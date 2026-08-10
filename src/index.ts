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
        origin: "*",
        credentials: true,
      }),
    );
    app.use(express.json());

    // Security headers
    app.use(
      (
        req: express.Request,
        res: express.Response,
        next: express.NextFunction,
      ) => {
        res.setHeader("Strict-Transport-Security", "max-age=31536000");
        res.setHeader("X-Content-Type-Options", "nosniff");
        res.setHeader("X-Frame-Options", "DENY");
        res.setHeader("X-XSS-Protection", "1; mode=block");
        next();
      },
    );

    // Routes
    app.use("/api", router);
    app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
    app.get("/api-docs.json", (req: express.Request, res: express.Response) => {
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
        console.error(err && err.stack ? err.stack : err);
        res.status(500).json({ error: "Internal Server Error" });
      },
    );

    // Load SSL Certificates
    const currentFilePath = __filename;
    const currentDir = path.dirname(currentFilePath);
    const projectRoot = path.resolve(currentDir, "..");
    const cert = path.join(projectRoot, "certs", ".pem");
    const key = path.join(projectRoot, "certs", "key.pem");

    const options: https.ServerOptions = {
      cert: fs.readFileSync(cert),
      key: fs.readFileSync(key),
    };

    app.use(bodyParser.json());
    app.get("/", (req: express.Request, res: express.Response) => {
      res.status(200).json({
        message: "Server is running",
        data: null,
      });
    });

    const startServer = (port: number) => {
      const server = https.createServer(options, app);

      server.on("error", (error: NodeJS.ErrnoException) => {
        if (error.code === "EADDRINUSE") {
          console.warn(`Port ${port} is already in use. Trying ${port + 1}...`);
          startServer(port + 1);
          return;
        }

        console.error("Server startup error:", error);
      });

      server.listen(port, () => {
        console.log(
          "\x1b[34m+============================================================+\x1b[0m",
        );
        console.log(
          "\x1b[35m|\x1b[32m",
          `Server is running on https://localhost:${port}               `,
          "\x1b[35m|\x1b[32m",
        );
        console.log(
          "\x1b[35m|\x1b[32m",
          `Swagger UI is available at https://localhost:${port}/api-docs`,
          "\x1b[35m|\x1b[32m",
        );
        console.log(
          "\x1b[34m+============================================================+\x1b[0m",
        );
      });
    };

    startServer(Number(PORT));
  } catch (error) {
    console.error(error);
  }
};

init();
