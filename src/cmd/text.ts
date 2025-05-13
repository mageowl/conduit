import type { Serialize } from "../serialize.ts";

export type IntoText = string | TextComponent | TextComponent[] | Text;

export class Text implements Serialize {
  components: TextComponent[] = [];

  private constructor() {}

  static from(...from: IntoText[]): Text {
    const self = new Text();

    from.forEach((from) => {
      if (typeof from === "string") {
        self.components.push({ text: from });
      } else if (Array.isArray(from)) {
        self.components.push(...from);
      } else if (from instanceof Text) {
        self.components.push(...from.components);
      } else {
        self.components.push(from);
      }
    });

    return self;
  }

  append(other: Text) {
    this.components.concat(other.components);
  }

  color(color: Color): this {
    this.components.forEach((component) => component.color = color);
    return this;
  }

  toString(): string {
    return JSON.stringify(this.components);
  }
  serialize(): RawComponent[] {
    return this.components;
  }
}

export type Color =
  | `#${string}`
  | "black"
  | "dark_blue"
  | "dark_green"
  | "dark_aqua"
  | "dark_red"
  | "dark_purple"
  | "gold"
  | "gray"
  | "dark_gray"
  | "blue"
  | "green"
  | "aqua"
  | "red"
  | "light_purple"
  | "yellow"
  | "white";

export type Formatting = {
  color?: Color;
};

export type RawComponent = {
  text: string;
};

export type TextComponent = RawComponent & Formatting;
