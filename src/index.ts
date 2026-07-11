import express from "express";
import router from "./routes/api";
import bodyParser from "body-parser";
import cors from "cors";
import db from "./utils/database";

const init = async () => {
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

    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error(error);
  }
};

init();
