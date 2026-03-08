import { createReadStream, existsSync } from "node:fs";
import { readFile, stat } from "node:fs/promises";
import http from "node:http";
import path from "node:path";

const rootArg = process.argv[2] ?? "apps/web/dist";
const port = Number(process.argv[3] ?? process.env.PORT ?? 4173);
const rootDir = path.resolve(rootArg);

const mimeTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".txt": "text/plain; charset=utf-8",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
};

function sendJson(response, statusCode, payload) {
  response.writeHead(statusCode, { "Content-Type": "application/json; charset=utf-8" });
  response.end(JSON.stringify(payload));
}

function resolveAssetPath(requestPath) {
  const sanitizedPath = decodeURIComponent((requestPath ?? "/").split("?")[0]);
  const relativePath = sanitizedPath === "/" ? "index.html" : sanitizedPath.replace(/^\/+/, "");
  const absolutePath = path.resolve(rootDir, relativePath);
  if (!absolutePath.startsWith(rootDir)) {
    return null;
  }
  return absolutePath;
}

const server = http.createServer(async (request, response) => {
  if (!existsSync(rootDir)) {
    sendJson(response, 500, { detail: `Diretorio dist inexistente: ${rootDir}` });
    return;
  }

  const assetPath = resolveAssetPath(request.url);
  if (!assetPath) {
    sendJson(response, 403, { detail: "Acesso negado." });
    return;
  }

  let filePath = assetPath;
  try {
    const assetStat = await stat(filePath);
    if (assetStat.isDirectory()) {
      filePath = path.join(filePath, "index.html");
    }
  } catch {
    filePath = path.join(rootDir, "index.html");
  }

  try {
    const extension = path.extname(filePath).toLowerCase();
    const contentType = mimeTypes[extension] ?? "application/octet-stream";
    response.writeHead(200, { "Content-Type": contentType });
    createReadStream(filePath).pipe(response);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Falha ao servir arquivo.";
    sendJson(response, 500, { detail: message });
  }
});

server.listen(port, "127.0.0.1", async () => {
  const indexPath = path.join(rootDir, "index.html");
  const hasIndex = existsSync(indexPath);
  const title = hasIndex
    ? String(
        await readFile(indexPath, "utf-8").then(
          (data) => data.match(/<title>(.*?)<\/title>/i)?.[1] ?? "Pulso Politico",
        ),
      )
    : "Pulso Politico";
  console.log(`${title} em http://127.0.0.1:${port}`);
});
