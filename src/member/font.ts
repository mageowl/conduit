import { JSONMember } from "../member.ts";
import type Namespace from "../namespace.ts";
import type { JSONValue } from "../serialize.ts";

export default class Font extends JSONMember<"assets"> {
  static override readonly dataFolder: string = "font";

  constructor(public data: FontDefinition) {
    super();
  }

  override add(_namespace: Namespace<"assets">, _name: string): void {}

  override saveJSON(): JSONValue {
    return this.data;
  }
}

export type FontDefinition = {
  providers: FontProvider[];
};

export type FontProvider = {
  filter?: {
    uniform?: boolean;
    jp?: boolean;
  };
} & (BitmapFontProvider | SpaceFontProvider);

type BitmapFontProvider = {
  type: "bitmap";
  ascent: number;
  height?: number;
  chars: string[];
  file: string;
};

type SpaceFontProvider = {
  type: "space";
  advances: { [codepoint: string]: number };
};
