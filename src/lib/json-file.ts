import "server-only";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";

// Tiny JSON-file persistence shared by the stores (no database: Zoho CRM is the system of record).

const filePath = (name: string) => resolve(/*turbopackIgnore: true*/ process.cwd(), name);

export async function readJson<T>(name: string): Promise<T[]> {
  try {
    return JSON.parse(await readFile(filePath(name), "utf8")) as T[];
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code !== "ENOENT") console.error(`[store] couldn't read ${name}`, err);
    return [];
  }
}

// Serialise writes; write to a temp file then rename so a file is never half-written.
const writing: Record<string, Promise<void>> = {};
export function writeJson(name: string, data: () => unknown): Promise<void> {
  writing[name] = (writing[name] ?? Promise.resolve()).then(async () => {
    const path = filePath(name);
    const tmp = `${path}.${process.pid}.tmp`;
    try {
      await mkdir(dirname(path), { recursive: true });
      await writeFile(tmp, JSON.stringify(data()));
      await rename(tmp, path);
    } catch (err) {
      console.error(`[store] couldn't write ${name} (data is still in memory)`, err);
    }
  });
  return writing[name];
}
