// HTTPS reverse proxy in front of the HTTP backend, so a page served over
// https:// can call it without mixed-content errors.
//
//   npm run certs     # generate local-server/certs/{cert,key}.pem
//   npm run proxy     # https://localhost:8788  ->  http://localhost:8787
//
// Then open https://localhost:8788/health once in the browser and accept the
// self-signed certificate. Set VITE_DOWNLOADER_API_URL=https://localhost:8788.
//
// Prefer a public HTTPS URL instead? Use a tunnel (no certs needed):
//   cloudflared tunnel --url http://localhost:8787
//   ngrok http 8787
import https from "node:https";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import httpProxy from "http-proxy";
import { config } from "./config.js";

const certDir = fileURLToPath(new URL("./certs/", import.meta.url));
const keyPath = process.env.TLS_KEY_PATH || `${certDir}key.pem`;
const certPath = process.env.TLS_CERT_PATH || `${certDir}cert.pem`;

if (!fs.existsSync(keyPath) || !fs.existsSync(certPath)) {
  console.error(`\n  No certificate found.\n  Run:  npm run certs\n`);
  process.exit(1);
}

const target = `http://127.0.0.1:${config.port}`;
const proxy = httpProxy.createProxyServer({
  target,
  changeOrigin: false,
  xfwd: true,
  // Downloads stream for minutes — never time them out.
  proxyTimeout: 0,
  timeout: 0,
});

proxy.on("error", (err, _req, res) => {
  console.error("[proxy]", err.message);
  if (res && !res.headersSent) {
    res.writeHead(502, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Backend unreachable", detail: `Is ${target} running?` }));
  }
});

https
  .createServer({ key: fs.readFileSync(keyPath), cert: fs.readFileSync(certPath) }, (req, res) =>
    proxy.web(req, res),
  )
  .listen(config.httpsPort, () => {
    console.log(`\n  Reelio HTTPS proxy  →  https://localhost:${config.httpsPort}  ⇢  ${target}`);
    console.log(`  Visit https://localhost:${config.httpsPort}/health once and trust the certificate.\n`);
  });
