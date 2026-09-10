#!/usr/bin/env node
import { readFileSync } from "node:fs";

function readStdinJSON() {
  try {
    return JSON.parse(readFileSync(0, "utf-8"));
  } catch {
    return {};
  }
}

const filePath = readStdinJSON()?.tool_input?.file_path || "";
const PROTECTED = [
  /package-lock\.json$/,
  /yarn\.lock$/,
  /pnpm-lock\.yaml$/,
  /(^|\/)dist\//,
  /(^|\/)build\//,
  /(^|\/)\.next\//,
  /(^|\/)out\//,
  /(^|\/)node_modules\//,
  /(^|\/)next-env\.d\.ts$/,
];
if (PROTECTED.some((re) => re.test(filePath))) {
  console.error(
    `Blocked: "${filePath}" is generated or a lockfile. Use the relevant npm command ` +
      `(npm install, npm run build, ...) instead of editing it directly.`,
  );
  process.exit(2);
}
process.exit(0);
