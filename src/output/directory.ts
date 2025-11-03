import * as path from "@std/path";
import Output from "../output.ts";
import { error } from "../util.ts";

export default class DirectoryOutput extends Output {
  constructor(public basePath: string) {
    super();
  }

  override async requestPermissions(): Promise<boolean> {
    const readRes = await Deno.permissions.request({
      name: "read",
      path: this.basePath,
    });
    if (readRes.state != "granted") {
      error(`Failed to save pack. You need to allow read access.`);
      return false;
    }
    const writeRes = await Deno.permissions.request({
      name: "write",
      path: this.basePath,
    });
    if (writeRes.state != "granted") {
      error("Failed to save pack. You need to allow write access.");
      return false;
    }
    return true;
  }

  override async complete(): Promise<void> {
    await (Deno.remove(this.basePath, { recursive: true }).catch(() => {}));
    await Deno.mkdir(this.basePath);

    for (const [dirPath, opts] of this.directories) {
      await Deno.mkdir(path.join(this.basePath, dirPath), opts);
    }

    await Promise.all(
      this.files.entries().map(async ([filePath, content]) => {
        const absolutePath = path.join(this.basePath, filePath);
        if (content instanceof Uint8Array) {
          await Deno.writeFile(absolutePath, content);
        } else {
          await Deno.writeTextFile(absolutePath, content);
        }
      }),
    );
  }

  override get savePath(): string {
    return this.basePath;
  }
}
