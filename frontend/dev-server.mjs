import { promises as fs } from "node:fs";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT ?? 5173);
const PUBLIC_DIR = path.join(__dirname, "public");

// SSE clients
const clients = new Set();

function contentType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === ".html") return "text/html; charset=utf-8";
  if (ext === ".js") return "text/javascript; charset=utf-8";
  if (ext === ".css") return "text/css; charset=utf-8";
  if (ext === ".json") return "application/json; charset=utf-8";
  if (ext === ".svg") return "image/svg+xml";
  return "application/octet-stream";
}

function safeJoinPublic(requestPath) {
  const decoded = decodeURIComponent(requestPath.split("?")[0]);
  const clean = decoded === "/" ? "/index.html" : decoded;
  const full = path.normalize(path.join(PUBLIC_DIR, clean));
  if (!full.startsWith(PUBLIC_DIR)) return null;
  return full;
}

async function injectLiveReload(html) {
  const snippet = `
<script>
(() => {
  const es = new EventSource("/__livereload");
  es.onmessage = () => location.reload();
})();
</script>`;
  // Inserta antes de </body> si existe, si no al final
  return html.includes("</body>")
    ? html.replace("</body>", `${snippet}\n</body>`)
    : `${html}\n${snippet}\n`;
}

const server = http.createServer(async (req, res) => {
  try {
    if (!req.url) {
      res.writeHead(400);
      return res.end("Bad Request");
    }

    // SSE endpoint
    if (req.url.startsWith("/__livereload")) {
      res.writeHead(200, {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      });
      res.write("retry: 200\n\n");

      clients.add(res);
      req.on("close", () => clients.delete(res));
      return;
    }

    const filePath = safeJoinPublic(req.url);
    if (!filePath) {
      res.writeHead(403);
      return res.end("Forbidden");
    }

    const data = await fs.readFile(filePath);
    const ct = contentType(filePath);

    // Inyecta live reload en HTML
    if (ct.startsWith("text/html")) {
      const html = data.toString("utf-8");
      const withReload = await injectLiveReload(html);
      res.writeHead(200, { "Content-Type": ct });
      return res.end(withReload);
    }

    res.writeHead(200, { "Content-Type": ct });
    return res.end(data);
  } catch (err) {
    // Fallback 404
    res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    return res.end("Not found");
  }
});

// Watch changes and notify SSE clients
let debounceTimer = null;
function broadcastReload() {
  for (const res of clients) {
    res.write(`data: reload\n\n`);
  }
}

fs.watch(PUBLIC_DIR, { recursive: true }, () => {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => broadcastReload(), 50);
});

server.listen(PORT, () => {
  console.log(`[front] http://localhost:${PORT}`);
});
