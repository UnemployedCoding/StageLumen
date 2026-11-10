import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const git = (...args) => execFileSync("git", args, { encoding: "utf8" }).trim();
const root = git("rev-parse", "--show-toplevel");
process.chdir(root);
if (git("status", "--porcelain")) {
  throw new Error("Commit or stash changes first so the backup matches a recoverable commit.");
}
const commit = git("rev-parse", "HEAD");
const stamp = new Date().toISOString().replaceAll(":", "-");
const destination = resolve("backups", `source-${stamp}`);
mkdirSync(destination, { recursive: true, mode: 0o700 });
const bundle = resolve(destination, "stagelumen.bundle");
const archive = resolve(destination, "stagelumen-source.tar.gz");
execFileSync("git", ["bundle", "create", bundle, "--branches", "--tags", "HEAD"], { stdio: "inherit" });
execFileSync("git", ["bundle", "verify", bundle], { stdio: "inherit" });
execFileSync("git", ["archive", "--format=tar.gz", `--output=${archive}`, commit]);
const checksums = [bundle, archive].map(file => {
  const hash = createHash("sha256").update(readFileSync(file)).digest("hex");
  return `${hash}  ${file.split("/").pop()}`;
}).join("\n");
writeFileSync(resolve(destination, "SHA256SUMS"), `${checksums}\n`, { mode: 0o600 });
writeFileSync(resolve(destination, "manifest.json"), JSON.stringify({
  created_at: new Date().toISOString(), commit,
  includes: ["tracked source and public assets", "local branches, tags, HEAD and their history"],
  excludes: ["untracked files", "environment secrets", "live database", "remote storage objects", "provider settings"],
}, null, 2) + "\n", { mode: 0o600 });
console.log(`Source backup created: ${destination}`);
console.log("Copy this directory off the laptop. Database and secret backups are separate.");
