import fs from "fs";
import path from "path";
import swaggerSpec from "../utils/swagger";

const outputPath = path.resolve(process.cwd(), "docs/swagger.json");
fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, JSON.stringify(swaggerSpec, null, 2));

console.log(`Swagger docs generated at ${outputPath}`);
