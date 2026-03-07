import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const explicitAppDir = process.argv[2];
const packageJsonPath = process.env.npm_package_json;
const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, "..");
const appDir = explicitAppDir
  ? path.resolve(repoRoot, explicitAppDir)
  : packageJsonPath
    ? path.dirname(path.resolve(packageJsonPath))
    : path.resolve(process.cwd());
const distDir = path.join(appDir, "dist");
const templatePath = path.join(appDir, "index.html");
const assetsDir = path.join(distDir, "assets");
const assetFiles = fs.readdirSync(assetsDir);
const jsFile = assetFiles.find((file) => file.endsWith(".js"));
const cssFile = assetFiles.find((file) => file.endsWith(".css"));

if (!jsFile) {
  throw new Error("Nenhum bundle JS foi gerado.");
}

let html = fs.readFileSync(templatePath, "utf8");
html = html.replace('<script type="module" src="/src/main.tsx"></script>', '');

const assetTags = [
  cssFile ? `    <link rel="stylesheet" href="./assets/${cssFile}" />` : null,
  `    <script type="module" src="./assets/${jsFile}"></script>`,
]
  .filter(Boolean)
  .join("\n");

html = html.replace("  </body>", `${assetTags}\n  </body>`);

fs.writeFileSync(path.join(distDir, "index.html"), html, "utf8");
