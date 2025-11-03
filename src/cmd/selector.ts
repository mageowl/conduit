import { Identifier } from "../member.ts";
import Predicate from "../member/predicate.ts";
import type { JSONValue, Serialize } from "../serialize.ts";
import type { Range } from "./types.ts";

type SelectorKind = "a" | "e" | "r" | "p" | "s" | "n" | "explicit";

export default class Selector implements Serialize {
  private kind: SelectorKind;
  private constraints: [string, string][] = [];
  private explicitName?: string;

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
  static byName(name: string): Selector {
    const self = new Selector("explicit");
    self.explicitName = name;
    return self;
  }
  static of(other: Selector): Selector {
    const self = new Selector(other.kind);
    self.constraints = [...other.constraints];
    self.explicitName = other.explicitName;
    return self;
  }

  // TODO: rest of constraints
  x(x: number): this {
    this.constraints.push(["x", x.toString()]);
    return this;
  }
  y(y: number): this {
    this.constraints.push(["y", y.toString()]);
    return this;
  }
  z(z: number): this {
    this.constraints.push(["z", z.toString()]);
    return this;
  }
  dx(dx: number): this {
    this.constraints.push(["dx", dx.toString()]);
    return this;
  }
  dy(dy: number): this {
    this.constraints.push(["dy", dy.toString()]);
    return this;
  }
  dz(dz: number): this {
    this.constraints.push(["dz", dz.toString()]);
    return this;
  }

  distance(range: Range): this {
    this.constraints.push(["distance", range.toString()]);
    return this;
  }

  type(entityType: string): this {
    this.constraints.push(["type", entityType]);
    return this;
  }

  tag(tag: string): this {
    this.constraints.push(["tag", tag]);
    return this;
  }

  gamemode(
    gamemode: "adventure" | "creative" | "spectator" | "survival",
  ): this {
    this.constraints.push(["gamemode", gamemode]);
    return this;
  }

  scores(dict: { [objective: string]: Range }): this {
    this.constraints.push([
      "scores",
      `{${Object.entries(dict).map(([k, v]) => `${k}=${v}`).join(", ")}}`,
    ]);
    return this;
  }

  team(teamName: string): this {
    this.constraints.push(["team", teamName]);
    return this;
  }

  predicate(predicate: Identifier<Predicate>): this {
    this.constraints.push(["predicate", predicate.toString()]);
    return this;
  }
  notPredicate(predicate: Identifier<Predicate>): this {
    this.constraints.push(["predicate", "!" + predicate.toString()]);
    return this;
  }

  nbt__VERYSLOW(predicate: JSONValue): this {
    this.constraints.push(["nbt", JSON.stringify(predicate)]);
    return this;
  }
  invertedNbt__VERYSLOW(predicate: JSONValue): this {
    this.constraints.push(["nbt", "!" + JSON.stringify(predicate)]);
    return this;
  }
  rawNbt__VERYSLOW(predicate: string): this {
    this.constraints.push(["nbt", predicate]);
    return this;
  }

  toString(): string {
    if (this.kind === "explicit") return this.explicitName!;
    if (this.constraints.length === 0) return `@${this.kind}`;
    const constraints = this.constraints
      .map(([k, v]) => `${k}=${v}`);
    return `@${this.kind}[${Array.from(constraints).join(", ")}]`;
  }
  serialize(): string {
    return this.toString();
  }
}
