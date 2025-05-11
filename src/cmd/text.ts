export type IntoText = string | TextComponent | TextComponent[];

export class Text {
  components: TextComponent[] = [];

  private constructor() {}

  static from(from: IntoText): Text {
    const self = new Text();

    if (typeof from === "string") {
      self.components = [{ text: from }];
    } else if (Array.isArray(from)) {
      self.components = from;
    } else {
      self.components = [from];
    }

    return self;
  }

  toString() {
    return JSON.stringify(this.components);
  }
  toJSON(): TextJSON {
    return this.components;
  }
}

export type RawComponent = {
  text: string;
};

export type TextComponent = RawComponent;
export type TextJSON = TextComponent | TextComponent[];
