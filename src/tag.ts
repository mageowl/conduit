import type { Identifier, Member } from "./member.ts";
import type { PackType } from "./pack.ts";
import type { JSONValue, Serialize } from "./serialize.ts";

export default class Tag<T extends Member<PackType>> implements Serialize {
  values: Set<Identifier<T>> = new Set();
  subTags: Identifier<Tag<T>>[] = [];
  additionalValues: JSONValue[] = [];
  replace: boolean = false;

  constructor(private identifier: Identifier<Tag<T>>) {}

  add(...ids: Identifier<T>[]) {
    ids.forEach((id) => this.values.add(id));
  }
  addTag(tag: Tag<T>) {
    this.subTags.push(tag.identifier);
  }

  toJSON(): JSONValue {
    return {
      values: [
        ...this.additionalValues,
        ...this.values.values().map((value) => value.toString()),
        ...this.subTags.map((value) => `#${value}`),
      ],
    };
  }

  toString(): string {
    return `#${this.identifier}`;
  }
  serialize(): JSONValue {
    return this.toString();
  }
}

export type HardCodedRegistry =
  | "block"
  | "item"
  | "fluid"
  | "entity_type"
  | "game_event"
  | "point_of_interest_type";
export class RegistryTag<T extends HardCodedRegistry> implements Serialize {
  values: Set<string> = new Set();
  subTags: Identifier<RegistryTag<T>>[] = [];
  replace: boolean = false;

  constructor(private identifier: Identifier<RegistryTag<T>>) {}

  add(...ids: string[]) {
    ids.forEach((id) => this.values.add(id));
  }
  addTag(tag: RegistryTag<T>) {
    this.subTags.push(tag.identifier);
  }

  toJSON(): JSONValue {
    return {
      values: [
        ...this.values.values().map((value) => value.toString()),
        ...this.subTags.map((value) => `#${value}`),
      ],
    };
  }

  toString(): string {
    return `#${this.identifier}`;
  }
  serialize(): JSONValue {
    return this.toString();
  }
}
