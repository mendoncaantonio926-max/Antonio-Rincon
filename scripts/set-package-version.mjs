import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const version = process.argv[2];

if (!version || !/^\d+\.\d+\.\d+$/.test(version)) {
  console.error("Use uma versao no formato X.Y.Z.");
  process.exit(1);
}

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, "..");
const workspacePackagePaths = [
  "package.json",
  "apps/web/package.json",
  "packages/ui/package.json",
  "packages/types/package.json",
  "packages/config/package.json",
];
const pyprojectPath = path.join(repoRoot, "apps/api/pyproject.toml");
const packageLockPath = path.join(repoRoot, "package-lock.json");
const pyprojectVersionPattern = /version = "\d+\.\d+\.\d+"/;

for (const relativePath of workspacePackagePaths) {
  const packageJsonPath = path.join(repoRoot, relativePath);
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
  packageJson.version = version;

  if (relativePath === "apps/web/package.json") {
    for (const dependencyName of ["@pulso/types", "@pulso/ui"]) {
      if (packageJson.dependencies?.[dependencyName]) {
        packageJson.dependencies[dependencyName] = version;
      }
    }
  }

  fs.writeFileSync(packageJsonPath, `${JSON.stringify(packageJson, null, 2)}\n`, "utf8");
}

const pyproject = fs.readFileSync(pyprojectPath, "utf8");
if (!pyprojectVersionPattern.test(pyproject)) {
  console.error("Nao foi possivel atualizar a versao em apps/api/pyproject.toml.");
  process.exit(1);
}

const updatedPyproject = pyproject.replace(
  pyprojectVersionPattern,
  `version = "${version}"`,
);

fs.writeFileSync(pyprojectPath, updatedPyproject, "utf8");

if (fs.existsSync(packageLockPath)) {
  const packageLock = JSON.parse(fs.readFileSync(packageLockPath, "utf8"));
  const packageEntries = packageLock.packages ?? {};
  const lockPaths = [
    "",
    "apps/web",
    "packages/ui",
    "packages/types",
    "packages/config",
    "node_modules/@pulso/web",
    "node_modules/@pulso/ui",
    "node_modules/@pulso/types",
    "node_modules/@pulso/config",
  ];

  packageLock.version = version;

  for (const lockPath of lockPaths) {
    if (packageEntries[lockPath]) {
      packageEntries[lockPath].version = version;
    }
  }

  if (packageEntries["apps/web"]?.dependencies) {
    for (const dependencyName of ["@pulso/types", "@pulso/ui"]) {
      if (packageEntries["apps/web"].dependencies[dependencyName]) {
        packageEntries["apps/web"].dependencies[dependencyName] = version;
      }
    }
  }

  fs.writeFileSync(packageLockPath, `${JSON.stringify(packageLock, null, 2)}\n`, "utf8");
}
