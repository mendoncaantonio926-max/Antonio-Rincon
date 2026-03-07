import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const inputVersion = process.argv[2];
const jsonMode = process.argv.includes("--json");

if (!inputVersion) {
  console.error("Informe a versao esperada.");
  process.exit(1);
}

const normalizedVersion = inputVersion.startsWith("v")
  ? inputVersion.slice(1)
  : inputVersion;

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, "..");
const versionFilePath = path.join(repoRoot, "VERSION");
const packageJsonRelativePaths = [
  "package.json",
  "apps/web/package.json",
  "packages/ui/package.json",
  "packages/types/package.json",
  "packages/config/package.json",
];
const pyprojectPath = path.join(repoRoot, "apps/api/pyproject.toml");
const packageLockPath = path.join(repoRoot, "package-lock.json");

if (!fs.existsSync(versionFilePath)) {
  console.error("Arquivo VERSION nao encontrado.");
  process.exit(1);
}

const expectedVersion = fs.readFileSync(versionFilePath, "utf8").trim();
if (!expectedVersion) {
  console.error("Arquivo VERSION vazio.");
  process.exit(1);
}

if (normalizedVersion !== expectedVersion) {
  console.error(
    `Versao informada (${inputVersion}) difere de VERSION (${expectedVersion}).`,
  );
  process.exit(1);
}

for (const relativePath of packageJsonRelativePaths) {
  const absolutePath = path.join(repoRoot, relativePath);
  if (!fs.existsSync(absolutePath)) {
    console.error(`Manifest npm nao encontrado: ${relativePath}`);
    process.exit(1);
  }

  const packageJson = JSON.parse(fs.readFileSync(absolutePath, "utf8"));
  if (packageJson.version !== expectedVersion) {
    console.error(
      `${relativePath} (${packageJson.version}) difere de VERSION (${expectedVersion}).`,
    );
    process.exit(1);
  }
}

const webPackageJson = JSON.parse(
  fs.readFileSync(path.join(repoRoot, "apps/web/package.json"), "utf8"),
);
for (const dependencyName of ["@pulso/types", "@pulso/ui"]) {
  if (webPackageJson.dependencies?.[dependencyName] !== expectedVersion) {
    console.error(
      `apps/web depende de ${dependencyName}=${webPackageJson.dependencies?.[dependencyName]}, esperado ${expectedVersion}.`,
    );
    process.exit(1);
  }
}

const pyprojectContent = fs.readFileSync(pyprojectPath, "utf8");
const pyprojectMatch = pyprojectContent.match(/version = "([^"]+)"/);
if (!pyprojectMatch) {
  console.error("Nao foi possivel localizar a versao em apps/api/pyproject.toml.");
  process.exit(1);
}

if (pyprojectMatch[1] !== expectedVersion) {
  console.error(
    `apps/api/pyproject.toml (${pyprojectMatch[1]}) difere de VERSION (${expectedVersion}).`,
  );
  process.exit(1);
}

if (fs.existsSync(packageLockPath)) {
  const packageLock = JSON.parse(fs.readFileSync(packageLockPath, "utf8"));
  if (packageLock.version !== expectedVersion) {
    console.error(
      `package-lock.json (${packageLock.version}) difere de VERSION (${expectedVersion}).`,
    );
    process.exit(1);
  }

  const packageEntries = packageLock.packages ?? {};
  for (const lockPath of ["", "apps/web", "packages/ui", "packages/types", "packages/config"]) {
    const entry = packageEntries[lockPath];
    if (!entry) {
      console.error(`package-lock.json nao contem a entrada ${lockPath}.`);
      process.exit(1);
    }
    if (entry.version !== expectedVersion) {
      console.error(
        `package-lock.json:${lockPath} (${entry.version}) difere de VERSION (${expectedVersion}).`,
      );
      process.exit(1);
    }
  }

  const webEntry = packageEntries["apps/web"];
  for (const dependencyName of ["@pulso/types", "@pulso/ui"]) {
    if (webEntry?.dependencies?.[dependencyName] !== expectedVersion) {
      console.error(
        `package-lock apps/web depende de ${dependencyName}=${webEntry?.dependencies?.[dependencyName]}, esperado ${expectedVersion}.`,
      );
      process.exit(1);
    }
  }
}

if (jsonMode) {
  console.log(
    JSON.stringify(
      {
        versao_alvo: normalizedVersion,
        versao_atual: expectedVersion,
        valido: "sim",
        escopo: [
          "VERSION",
          "package.json",
          "apps/web/package.json",
          "packages/ui/package.json",
          "packages/types/package.json",
          "packages/config/package.json",
          "apps/api/pyproject.toml",
          "package-lock.json",
        ],
      },
      null,
      2,
    ),
  );
} else {
  console.log(
    "Versao validada contra VERSION, manifests npm, pyproject da API e package-lock.",
  );
}
