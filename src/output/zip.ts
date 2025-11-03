import Output from "../output.ts";
import { error, warning } from "../util.ts";
import { create } from "@quentinadam/zip";

export default class ZippedOutput extends Output {
  constructor(public zipFile: string) {
    super();
    if (!zipFile.endsWith(".zip")) {
      warning("ZippedOutput expects a path to a zip file.");
    }
  }

  override async requestPermissions(): Promise<boolean> {
    const writeRes = await Deno.permissions.request({
      name: "write",
      path: this.zipFile,
    });
    if (writeRes.state != "granted") {
      error("Failed to save pack. You need to allow write access.");
      return false;
    }
    return true;
  }
  override async complete() {
    const encoder = new TextEncoder();
    const buf = await create(
      this.files.entries().map(([name, data]) => ({
        name,
        data: data instanceof Uint8Array ? data : encoder.encode(data),
      })).toArray(),
    );

    await Deno.writeFile(this.zipFile, buf);
  }
  override get savePath(): string {
    return this.zipFile;
  }
}
