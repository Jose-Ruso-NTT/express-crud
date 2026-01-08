import { promises as fs } from "node:fs";
import path from "node:path";
import { Mutex } from "./mutex";

export type JsonDbClient<T> = {
  read(): Promise<T>;
  write(data: T): Promise<void>;
  transaction(fn: (data: T) => Promise<T> | T): Promise<T>;
};

export function createJsonDbClient<T>(
  filePath: string,
  options?: { initialData: T },
): JsonDbClient<T> {
  const absolutePath = path.isAbsolute(filePath)
    ? filePath
    : path.join(process.cwd(), filePath);

  const mutex = new Mutex();

  async function ensureFileExists() {
    try {
      await fs.access(absolutePath);
    } catch (err: any) {
      if (err?.code !== "ENOENT") throw err;
      if (!options?.initialData) {
        throw new Error(
          `JSON DB file not found: ${absolutePath}. Provide initialData to create it automatically.`,
        );
      }
      await writeUnsafe(options.initialData);
    }
  }

  async function readUnsafe(): Promise<T> {
    await ensureFileExists();
    const raw = await fs.readFile(absolutePath, "utf-8");
    return JSON.parse(raw) as T;
  }

  async function writeUnsafe(data: T): Promise<void> {
    const raw = JSON.stringify(data, null, 2);
    await fs.writeFile(absolutePath, raw, "utf-8");
  }

  return {
    async read() {
      return readUnsafe();
    },

    async write(data: T) {
      await mutex.lock(() => writeUnsafe(data));
    },

    async transaction(fn) {
      return mutex.lock(async () => {
        const data = await readUnsafe();
        const updated = await fn(data);
        await writeUnsafe(updated);
        return updated;
      });
    },
  };
}
