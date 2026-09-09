// Generates a self-signed certificate for the HTTPS proxy.
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import selfsigned from "selfsigned";

const dir = fileURLToPath(new URL("../certs/", import.meta.url));
fs.mkdirSync(dir, { recursive: true });

const pems = selfsigned.generate([{ name: "commonName", value: "localhost" }], {
  days: 825,
  keySize: 2048,
  algorithm: "sha256",
  extensions: [
    {
      name: "subjectAltName",
      altNames: [
        { type: 2, value: "localhost" },
        { type: 7, ip: "127.0.0.1" },
      ],
    },
  ],
});

fs.writeFileSync(`${dir}key.pem`, pems.private);
fs.writeFileSync(`${dir}cert.pem`, pems.cert);
console.log(`Wrote ${dir}key.pem and ${dir}cert.pem`);
