import { promises as fs } from "node:fs";
import http from "node:http";
import path from "node:path";

const PORT = Number(process.env.PORT ?? 4173);
const DIST_DIR = path.join(process.cwd(), "dist");

function contentType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === ".html") return "text/html; charset=utf-8";
  if (ext === ".js") return "text/javascript; charset=utf-8";
  if (ext === ".css") return "text/css; charset=utf-8";
  if (ext === ".json") return "application/json; charset=utf-8";
  if (ext === ".svg") return "image/svg+xml";
  return "application/octet-stream";
}

function safeJoinDist(requestPath) {
  const decoded = decodeURIComponent(requestPath.split("?")[0]);
  const clean = decoded === "/" ? "/index.html" : decoded;
  const full = path.normalize(path.join(DIST_DIR, clean));
  if (!full.startsWith(DIST_DIR)) return null;
  return full;
}

const server = http.createServer(async (req, res) => {
  try {
    if (!req.url) {
      res.writeHead(400);
      return res.end("Bad Request");
    }

    const filePath = safeJoinDist(req.url);
    if (!filePath) {
      res.writeHead(403);
      return res.end("Forbidden");
    }

    const data = await fs.readFile(filePath);
    res.writeHead(200, { "Content-Type": contentType(filePath) });
    return res.end(data);
  } catch {
    res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    return res.end("Not found");
  }
});

server.listen(PORT, () => {
  console.log(`[preview] http://127.0.0.1:${PORT}`);
});
