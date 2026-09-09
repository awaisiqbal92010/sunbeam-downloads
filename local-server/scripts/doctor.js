// Quick environment check: are yt-dlp and ffmpeg usable?
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { config, authEnabled } from "../config.js";

const run = promisify(execFile);
const ok = (s) => `  OK    ${s}`;
const bad = (s) => `  MISS  ${s}`;

const lines = [];

if (config.ytdlpPath) {
  try {
    const { stdout } = await run(config.ytdlpPath, ["--version"]);
    lines.push(ok(`yt-dlp ${stdout.trim()} (${config.ytdlpPath})`));
  } catch (e) {
    lines.push(bad(`yt-dlp found but not runnable: ${e.message}`));
  }
} else {
  lines.push(bad("yt-dlp — run `npm install` in local-server/"));
}

if (config.ffmpegPath) {
  try {
    const { stdout } = await run(config.ffmpegPath, ["-version"]);
    lines.push(ok(`ffmpeg ${stdout.split("\n")[0]}`));
  } catch (e) {
    lines.push(bad(`ffmpeg found but not runnable: ${e.message}`));
  }
} else {
  lines.push(bad("ffmpeg — install it or `npm i ffmpeg-static`"));
}

lines.push(authEnabled() ? ok("auth configured") : bad("auth OFF — run `npm run keygen`"));
console.log(`\n${lines.join("\n")}\n`);
