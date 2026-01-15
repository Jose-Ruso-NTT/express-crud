import crypto from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const PUBLIC_DIR = path.join(ROOT, "public");
const DIST_DIR = path.join(ROOT, "dist");

function hashContent(buf) {
  return crypto.createHash("sha256").update(buf).digest("hex").slice(0, 8);
}

async function rmDir(dir) {
  await fs.rm(dir, { recursive: true, force: true });
}

async function copyDir(src, dst) {
  await fs.mkdir(dst, { recursive: true });
  const entries = await fs.readdir(src, { withFileTypes: true });
  for (const e of entries) {
    const from = path.join(src, e.name);
    const to = path.join(dst, e.name);
    if (e.isDirectory()) await copyDir(from, to);
    else await fs.copyFile(from, to);
  }
}

async function fileExists(p) {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

async function main() {
  await rmDir(DIST_DIR);
  await copyDir(PUBLIC_DIR, DIST_DIR);

  const indexPath = path.join(DIST_DIR, "index.html");
  if (!(await fileExists(indexPath))) {
    throw new Error("dist/index.html not found. Expected public/index.html.");
  }

  let indexHtml = await fs.readFile(indexPath, "utf-8");

  // Ajusta si tus nombres son distintos
  const appPath = path.join(DIST_DIR, "app.js");
  const cssPath = path.join(DIST_DIR, "styles.css");

  // Hashea y renombra app.js
  if (await fileExists(appPath)) {
    const appBuf = await fs.readFile(appPath);
    const appHash = hashContent(appBuf);
    const appHashedName = `app.${appHash}.js`;
    await fs.rename(appPath, path.join(DIST_DIR, appHashedName));
    indexHtml = indexHtml.replaceAll("app.js", appHashedName);
  }

  // Hashea y renombra styles.css
  if (await fileExists(cssPath)) {
    const cssBuf = await fs.readFile(cssPath);
    const cssHash = hashContent(cssBuf);
    const cssHashedName = `styles.${cssHash}.css`;
    await fs.rename(cssPath, path.join(DIST_DIR, cssHashedName));
    indexHtml = indexHtml.replaceAll("styles.css", cssHashedName);
  }

  await fs.writeFile(indexPath, indexHtml, "utf-8");

  console.log("[build] dist/ generated");
}

main().catch((err) => {
  console.error("[build] failed:", err);
  process.exit(1);
});
