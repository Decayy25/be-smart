import express from "express";
import helmet from "helmet";
import router from "./routes/api";
import bodyParser from "body-parser";
import https from "https";
import path from "path";
import fs from "fs";
import cors from "cors";
import db from "./utils/database";
import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./utils/swagger";
import { fileURLToPath } from "url";

const init = async () => {
  try {
    const result = await db();

    console.log("Database Status", result);
    const app = express();
    const PORT = 3001;

    // Middleware
    app.use(helmet());
    app.use(
      cors({
        origin: "https://localhost:3000",
        credentials: true,
      }),
    );
    app.use(express.json());

    // Security headers
    app.use((req, res, next) => {
      res.setHeader("Strict-Transport-Security", "max-age=31536000");
      res.setHeader("X-Content-Type-Options", "nosniff");
      res.setHeader("X-Frame-Options", "DENY");
      res.setHeader("X-XSS-Protection", "1; mode=block");
      next();
    });

    // Routes
    app.use("/api", router);
    app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
    app.get("/api-docs.json", (req, res) => {
      res.setHeader("Content-Type", "application/json");
      res.send(swaggerSpec);
    });

    // Error Handling
    app.use(
      (
        err: any,
        req: express.Request,
        res: express.Response,
        next: express.NextFunction,
      ) => {
        console.error(err.stack);
        res.status(500).json({ error: "Internal Server Error" });
      },
    );

    // Load SSL Certificates
    const currentFilePath = fileURLToPath(import.meta.url);
    const currentDir = path.dirname(currentFilePath);
    const projectRoot = path.resolve(currentDir, "..");
    const cert = path.join(projectRoot, "certs", ".pem");
    const key = path.join(projectRoot, "certs", "key.pem");

    const options: https.ServerOptions = {
      cert: fs.readFileSync(cert),
      key: fs.readFileSync(key),
    };

    app.use(bodyParser.json());
    app.get("/", (req, res) => {
      res.status(200).json({
        message: "Server is running",
        data: null,
      });
    });

    https.createServer(options, app).listen(PORT, () => {
      console.log(
        "\x1b[34m+============================================================+\x1b[0m",
      );
      console.log(
        "\x1b[35m|\x1b[32m",
        `Server is running on https://localhost:${PORT}               `,
        "\x1b[35m|\x1b[32m",
      );
      console.log(
        "\x1b[35m|\x1b[32m",
        `Swagger UI is available at https://localhost:${PORT}/api-docs`,
        "\x1b[35m|\x1b[32m",
      );
      console.log(
        "\x1b[34m+============================================================+\x1b[0m",
      );
    });
  } catch (error) {
    console.error(error);
  }
};

init();
