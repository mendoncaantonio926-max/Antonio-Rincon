import { spawn } from "node:child_process";
import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");

const appArg = process.argv.find(
  (item) => !item.startsWith("--") && item !== process.argv[0] && item !== process.argv[1],
);
const appRelativePath = appArg ?? "apps/web";
const skipTypecheck = process.argv.includes("--skip-typecheck");
const appDir = path.resolve(repoRoot, appRelativePath);
const distDir = path.join(appDir, "dist");
const esbuildBinary = path.join(repoRoot, "node_modules", "@esbuild", "win32-x64", "esbuild.exe");

function run(command, args, cwd) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd,
      stdio: "inherit",
      windowsHide: true,
    });

    child.on("exit", (code) => {
      if (code === 0) {
        resolve();
        return;
      }
      reject(new Error(`Falha em ${command} ${args.join(" ")} (exit ${code ?? 1}).`));
    });

    child.on("error", reject);
  });
}

if (!skipTypecheck) {
  await run(
    process.execPath,
    [path.join(repoRoot, "node_modules", "typescript", "bin", "tsc"), "-b"],
    appDir,
  );
}

rmSync(distDir, { recursive: true, force: true });
mkdirSync(distDir, { recursive: true });

await run(
  esbuildBinary,
  [
    path.join(appRelativePath, "src", "main.tsx"),
    "--bundle",
    "--format=esm",
    "--target=es2020",
    `--outdir=${path.join(appRelativePath, "dist")}`,
    "--entry-names=assets/[name]-[hash]",
    "--asset-names=assets/[name]-[hash]",
    "--loader:.css=css",
    "--jsx=automatic",
    `--metafile=${path.join(appRelativePath, "dist", "meta.json")}`,
  ],
  repoRoot,
);

writeFileSync(path.join(distDir, ".build-marker"), new Date().toISOString());
await run(
  process.execPath,
  [path.join(repoRoot, "scripts", "write-web-html.mjs"), appRelativePath],
  repoRoot,
);
