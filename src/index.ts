import express from "express";
import router from "./routes/api";
import bodyParser from "body-parser";
import cors from "cors";
import db from "./utils/database";
import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./utils/swagger";

async function init() {
  try {
    const result = await db();

    console.log("Database Status", result);
    const app = express();
    const PORT = 3001;

    app.use(cors());
    app.use(bodyParser.json());
    app.get("/", (req, res) => {
      res.status(200).json({
        message: "Server is running",
        data: null,
      });
    });

    app.use("/api", router);
    app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
    app.get("/api-docs.json", (req, res) => {
      res.setHeader("Content-Type", "application/json");
      res.send(swaggerSpec);
    });

    app.listen(PORT, () => {
      console.log("\x1b[34m+============================================================+\x1b[0m");
      console.log("\x1b[35m|\x1b[32m", `Server is running on http://localhost:${PORT}`, "\x1b[35m|\x1b[32m");
      console.log("\x1b[35m|\x1b[32m", `Swagger UI is available at http://localhost:${PORT}/api-docs`, "\x1b[35m|\x1b[32m");
      console.log("\x1b[34m+============================================================+\x1b[0m");
    });
  } catch (error) {
    console.error(error);
  }
}

init();
