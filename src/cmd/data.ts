import type { JSONValue } from "../serialize.ts";
import { error } from "../util.ts";
import type { Pos } from "./pos.ts";
import type Selector from "./selector.ts";

export class DataSource {
  private constructor(private selector: string, public path: string) {}

  toString(): string {
    return this.selector;
  }

  static block(pos: Pos, path: string = ""): DataSource {
    return new DataSource(`block ${pos}`, path);
  }
  static entity(selector: Selector, path: string = ""): DataSource {
    return new DataSource(`entity ${selector}`, path);
  }
  static storage(name: string, path: string = ""): DataSource {
    return new DataSource(`storage ${name}`, path);
  }

  static self(path: string = ""): DataSource {
    return new DataSource(`entity @s`, path);
  }
}

export default function data(
  target: DataSource,
): {
  remove(): string;
  get(scale?: number): string;
  merge(contents: JSONValue): string;
  modify: {
    (
      mode: "append" | "merge" | "prepend" | "set",
    ): {
      value(value: JSONValue): string;
      from(source: DataSource): string;
      nbtValue(nbt: string): string;
    };
    (
      mode: "insert",
      index: number,
    ): {
      value(value: JSONValue): string;
      from(source: DataSource): string;
      nbtValue(nbt: string): string;
    };
  };
} {
  function modify(
    mode: "append" | "merge" | "prepend" | "set",
  ): {
    value(value: JSONValue): string;
    from(source: DataSource): string;
    nbtValue(nbt: string): string;
  };
  function modify(
    mode: "insert",
    index: number,
  ): {
    value(value: JSONValue): string;
    from(source: DataSource): string;
    nbtValue(nbt: string): string;
  };
  function modify(
    mode: "append" | "merge" | "prepend" | "set" | "insert",
    index?: number,
  ): {
    value(value: JSONValue): string;
    from(source: DataSource): string;
    nbtValue(nbt: string): string;
  } {
    if (target.path === "") {
      error("'/data modify' must have a target path.");
      Deno.exit();
    }
    const modeStr = mode === "insert" ? `insert ${index}` : mode;
    return {
      value(value: JSONValue) {
        return `data modify ${target} ${target.path} ${modeStr} value ${
          JSON.stringify(value)
        }`;
      },
      nbtValue(nbt: string) {
        return `data modify ${target} ${target.path} ${modeStr} value ${nbt}`;
      },
      from(source: DataSource) {
        return `data modify ${target} ${target.path} ${modeStr} from ${source} ${source.path}`;
      },
    };
  }

  return {
    remove() {
      return `data remove ${target} ${target.path}`;
    },
    get(scale?: number) {
      return `data get ${target} ${target.path}` +
        (scale != null ? ` ${scale}` : "");
    },
    merge(contents: JSONValue) {
      return `data merge ${target} ${JSON.stringify(contents)}`;
    },
    modify,
  };
}
