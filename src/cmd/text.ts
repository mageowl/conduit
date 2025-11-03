import type { Components } from "../itemComponents.ts";
import type { Identifier } from "../member.ts";
import type Dialog from "../member/dialog.ts";
import type Font from "../member/font.ts";
import { type JSONValue, type Serialize, serialize } from "../serialize.ts";
import type Selector from "./selector.ts";

export type IntoText = string | TextComponent | Text | IntoText[];

export class Text implements Serialize {
  components: TextComponent[] = [];

  private constructor() {}

  static of(text: string): Text {
    const self = new Text();
    self.components.push({ text });
    return self;
  }

  static from(...from: IntoText[]): Text {
    const self = new Text();

    from.forEach((from) => {
      if (typeof from === "string") {
        self.components.push({ text: from });
      } else if (Array.isArray(from)) {
        self.components.push(...from.flatMap((c) => this.from(c).components));
      } else if (from instanceof Text) {
        self.components.push(...from.components);
      } else {
        self.components.push(from);
      }
    });

    return self;
  }

  get raw() {
    let str = "";
    this.components.forEach((comp) => {
      if ("text" in comp) {
        str += comp.text;
      }
    });
    return str;
  }

  append(other: Text) {
    this.components.concat(other.components);
  }

  color(color: Color): this {
    this.components.forEach((component) => component.color = color);
    return this;
  }

  italic(italic: boolean = true): this {
    this.components.forEach((component) => component.italic = italic);
    return this;
  }

  bold(bold: boolean = true): this {
    this.components.forEach((component) => component.bold = bold);
    return this;
  }

  obfuscated(obfuscated: boolean = true): this {
    this.components.forEach((component) => component.obfuscated = obfuscated);
    return this;
  }

  toString(): string {
    return JSON.stringify(serialize(this.components));
  }
  serialize(): JSONValue[] {
    return this.components.map(serialize);
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
  bold?: boolean;
  italic?: boolean;
  underlined?: boolean;
  strikethrough?: boolean;
  obfuscated?: boolean;
  font?: Identifier<Font> | "default" | "illageralt";
  shadow_color?: number | [number, number, number, number];

  click_event?: ClickEvent;
  hover_event?: HoverEvent;
};

export type ClickEvent =
  | OpenUrlClickEvent
  | RunCommandClickEvent
  | SuggestCommandClickEvent
  | ChangePageClickEvent
  | CopyToClipboardClickEvent
  | ShowDialogClickEvent
  | CustomClickEvent;
type OpenUrlClickEvent = {
  action: "open_url";
  dialog: `${UrlProtocol}://${string}`;
};
type UrlProtocol = "https" | "http";
type RunCommandClickEvent = {
  action: "run_command";
  command: string;
};
type SuggestCommandClickEvent = {
  action: "suggest_command";
  command: string;
};
type ChangePageClickEvent = {
  action: "change_page";
  page: number;
};
type CopyToClipboardClickEvent = {
  action: "copy_to_clipboard";
  value: string;
};
type ShowDialogClickEvent = {
  action: "show_dialog";
  dialog: Identifier<Dialog>;
};
type CustomClickEvent = {
  action: "custom";
  id: string;
  payload: string;
};

type HoverEvent = TextHoverEvent | ItemHoverEvent | EntityHoverEvent;
type TextHoverEvent = {
  action: "show_text";
  // value: IntoText;
};
type ItemHoverEvent = {
  action: "show_item";
  id: string;
  count?: number;
  components?: Components;
};
type EntityHoverEvent = {
  action: "show_entity";
  name?: string;
  id: string;
  uuid: string | [number, number, number, number];
};

export type RawComponent = {
  text: string;
};

export type SelectorComponent = {
  selector: Selector;
};

export type TextComponent = (RawComponent | SelectorComponent) & Formatting;
