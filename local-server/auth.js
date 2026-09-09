// API-key + signed-token authentication.
//
//  * JSON/XHR calls send  x-api-key: <key>  (or Authorization: Bearer <key>)
//  * Browser-initiated downloads (window.location / <a download>) cannot set
//    headers, so the frontend first asks POST /api/token for a short-lived
//    HMAC token and appends it as ?token=... on /api/download.
import crypto from "node:crypto";
import { config, authEnabled } from "./config.js";

function timingSafeEqual(a, b) {
  const ab = Buffer.from(String(a));
  const bb = Buffer.from(String(b));
  if (ab.length !== bb.length) return false;
  return crypto.timingSafeEqual(ab, bb);
}

export function isValidApiKey(key) {
  if (!key) return false;
  return config.apiKeys.some((k) => timingSafeEqual(k, key));
}

function sign(payload) {
  return crypto.createHmac("sha256", config.tokenSecret).update(payload).digest("base64url");
}

/** Mint a short-lived token: "<expiryEpochSeconds>.<signature>" */
export function mintToken(ttlSeconds = config.tokenTtlSeconds) {
  if (!config.tokenSecret) return null;
  const exp = Math.floor(Date.now() / 1000) + ttlSeconds;
  return `${exp}.${sign(String(exp))}`;
}

export function isValidToken(token) {
  if (!token || !config.tokenSecret) return false;
  const [expRaw, sig] = String(token).split(".");
  const exp = Number(expRaw);
  if (!exp || !sig) return false;
  if (exp < Math.floor(Date.now() / 1000)) return false;
  return timingSafeEqual(sign(String(exp)), sig);
}

function keyFromRequest(req) {
  const header = req.get("x-api-key");
  if (header) return header.trim();
  const auth = req.get("authorization");
  if (auth && /^bearer /i.test(auth)) return auth.slice(7).trim();
  if (req.query && typeof req.query.key === "string") return req.query.key;
  return null;
}

/** Express middleware. Rejects with 401 when auth is on and credentials fail. */
export function requireAuth(req, res, next) {
  if (!authEnabled()) return next(); // open mode (local dev only)

  if (isValidApiKey(keyFromRequest(req))) return next();

  const token = (req.query && req.query.token) || req.get("x-reelio-token");
  if (isValidToken(token)) return next();

  return res.status(401).json({
    error: "Unauthorized",
    detail:
      "Missing or invalid API key. Set REELIO_API_KEYS on the server and VITE_DOWNLOADER_API_KEY in the app.",
  });
}
