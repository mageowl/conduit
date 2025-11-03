import * as path from "@std/path";

export default abstract class Output {
  directories: Map<string, Deno.MkdirOptions> = new Map();
  files: Map<string, string | Uint8Array> = new Map();

  mkdir(path: string, opts: Deno.MkdirOptions = {}): void {
    this.directories.set(path, opts);
  }
  writeFile(path: string, content: string | Uint8Array): void {
    this.files.set(path, content);
  }

  withBase(path: string): SubOutput {
    return new SubOutput(this, path);
  }
  file(path: string): OutputFile {
    return new OutputFile(this, path);
  }

  abstract requestPermissions(): Promise<boolean>;
  abstract complete(): Promise<void>;

  abstract get savePath(): string;
}

export class SubOutput extends Output {
  constructor(private parent: Output, public path: string) {
    super();
  }

  override mkdir(dirPath: string, opts: Deno.MkdirOptions = {}): void {
    this.parent.mkdir(path.join(this.path, dirPath), opts);
  }
  override writeFile(filePath: string, content: string | Uint8Array): void {
    this.parent.writeFile(path.join(this.path, filePath), content);
  }
  override withBase(basePath: string): SubOutput {
    return new SubOutput(this.parent, path.join(this.path, basePath));
  }

  override requestPermissions(): Promise<boolean> {
    return this.parent.requestPermissions();
  }
  override complete(): Promise<void> {
    return this.parent.complete();
  }

  override get savePath(): string {
    return path.join(this.parent.savePath, this.path);
  }
}

export class OutputFile {
  constructor(private output: Output, private path: string) {}

  write(contents: string | Uint8Array) {
    this.output.writeFile(this.path, contents);
  }
}
