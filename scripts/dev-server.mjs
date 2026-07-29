import { createReadStream, existsSync, statSync } from "node:fs";
import { createServer } from "node:http";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";

const root = normalize(fileURLToPath(new URL("../", import.meta.url)));
const port = Number(process.env.PORT ?? 4173);
const host = process.env.HOST ?? "127.0.0.1";

const types = new Map([
  [".css", "text/css; charset=utf-8"],
  [".html", "text/html; charset=utf-8"],
  [".js", "text/javascript; charset=utf-8"],
  [".json", "application/json; charset=utf-8"],
  [".svg", "image/svg+xml"],
  [".png", "image/png"],
  [".jpg", "image/jpeg"],
  [".webp", "image/webp"],
]);

function safePath(urlPath) {
  const raw = decodeURIComponent((urlPath ?? "/").split("?")[0]);
  const clean = normalize(raw).replace(/^([/\\])+/, "");
  if (clean.includes("..")) return null;
  return join(root, clean);
}

const server = createServer((request, response) => {
  let filePath = safePath(request.url);
  if (!filePath) {
    response.writeHead(400);
    response.end("Bad request");
    return;
  }

  if (existsSync(filePath) && statSync(filePath).isDirectory()) {
    filePath = join(filePath, "index.html");
  }

  if (!existsSync(filePath)) {
    const cleanHtml = `${filePath}.html`;
    filePath = existsSync(cleanHtml) ? cleanHtml : join(root, "404.html");
  }

  const extension = extname(filePath).toLowerCase();
  response.writeHead(filePath.endsWith("404.html") ? 404 : 200, {
    "content-type": types.get(extension) ?? "application/octet-stream",
    "cache-control": extension === ".html" ? "no-cache" : "public, max-age=60",
  });

  if (request.method === "HEAD") {
    response.end();
    return;
  }

  createReadStream(filePath).on("error", () => {
    if (!response.headersSent) response.writeHead(500);
    response.end("Server error");
  }).pipe(response);
});

server.listen(port, host, () => {
  console.log(`NerdCommand prototype running at http://${host}:${port}`);
});
