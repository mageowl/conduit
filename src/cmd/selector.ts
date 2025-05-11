type SelectorKind = "a" | "e" | "r" | "p" | "s" | "n";

export default class Selector {
  private kind: SelectorKind;
  private constraints: Map<string, string> = new Map();

  private constructor(kind: SelectorKind) {
    this.kind = kind;
  }

  static players(): Selector {
    return new Selector("a");
  }
  static nearestPlayer(): Selector {
    return new Selector("p");
  }
  static self(): Selector {
    return new Selector("s");
  }
  static all(): Selector {
    return new Selector("e");
  }
  static nearest(): Selector {
    return new Selector("n");
  }
  static random(): Selector {
    return new Selector("r");
  }

  toString(): string {
    const constraints = this.constraints
      .entries()
      .map(([k, v]) => `${k}=${v}`);
    return `@${this.kind}[${Array.from(constraints).join(", ")}]`;
  }
}
