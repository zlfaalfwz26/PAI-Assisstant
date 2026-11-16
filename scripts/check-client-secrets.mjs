#!/usr/bin/env node
/**
 * Pastikan rahasia server TIDAK ikut ke bundle browser.
 * Jalankan setelah `npm run build` (dengan env yang sama):
 *   npm run check:secrets
 * Memindai .next/static (JS/CSS untuk browser) dan HTML hasil prerender.
 */
import { readdirSync, readFileSync, statSync, existsSync } from "node:fs";
import path from "node:path";

const root = path.resolve(process.cwd(), ".next");
if (!existsSync(root)) {
  console.error("Folder .next tidak ditemukan. Jalankan `npm run build` dulu.");
  process.exit(2);
}

const secretNames = ["OPENROUTER_API_KEY", "SUPABASE_SERVICE_ROLE_KEY", "ADMIN_PASSWORD", "ADMIN_SESSION_SECRET"];
const secrets = secretNames
  .map((name) => [name, (process.env[name] || "").trim()])
  .filter(([, value]) => value.length >= 6);
const patterns = [/sk-or-v1-[A-Za-z0-9]{16,}/];

function* walk(dir) {
  for (const entry of readdirSync(dir)) {
    const full = path.join(dir, entry);
    const stat = statSync(full);
    if (stat.isDirectory()) yield* walk(full);
    else if (/\.(js|mjs|css|html|json|rsc|txt)$/.test(entry)) yield full;
  }
}

const targets = [path.join(root, "static"), path.join(root, "server", "app")].filter(existsSync);
let scanned = 0;
const leaks = [];
for (const dir of targets) {
  for (const file of walk(dir)) {
    // Bundle server (route handler) memang boleh membaca env; yang dicek: aset browser & HTML.
    if (file.includes(`${path.sep}server${path.sep}`) && !/\.(html|rsc|txt)$/.test(file)) continue;
    const content = readFileSync(file, "utf8");
    scanned++;
    for (const [name, value] of secrets) if (content.includes(value)) leaks.push(`${name} → ${path.relative(root, file)}`);
    for (const pattern of patterns) if (pattern.test(content)) leaks.push(`pola ${pattern} → ${path.relative(root, file)}`);
  }
}

if (leaks.length) {
  console.error(`✗ Ditemukan ${leaks.length} kemungkinan kebocoran rahasia:\n  ${leaks.join("\n  ")}`);
  process.exit(1);
}
console.log(`✓ ${scanned} file browser/HTML dipindai — tidak ada rahasia server yang bocor (${secrets.length} nilai dicek).`);
