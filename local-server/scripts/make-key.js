// Creates local-server/.env with a fresh API key + token secret.
import crypto from "node:crypto";
import fs from "node:fs";
import { fileURLToPath } from "node:url";

const envPath = fileURLToPath(new URL("../.env", import.meta.url));
if (fs.existsSync(envPath)) {
  console.error(`${envPath} already exists — delete it first if you want new credentials.`);
  process.exit(1);
}

const apiKey = `reelio_${crypto.randomBytes(24).toString("base64url")}`;
const secret = crypto.randomBytes(32).toString("base64url");

fs.writeFileSync(
  envPath,
  `PORT=8787
HTTPS_PORT=8788
REELIO_API_KEYS=${apiKey}
REELIO_TOKEN_SECRET=${secret}
REELIO_TOKEN_TTL=300
ALLOWED_ORIGINS=*
MAX_CONCURRENT_DOWNLOADS=2
MAX_CONCURRENT_INFO=4
MAX_QUEUE_LENGTH=20
`,
);

console.log(`\n  Wrote ${envPath}\n`);
console.log(`  Add this to the Reelio app's .env:\n`);
console.log(`  VITE_DOWNLOADER_API_KEY=${apiKey}\n`);
