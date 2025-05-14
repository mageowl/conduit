import type { Identifier, Member } from "./member.ts";
import type { PackType } from "./pack.ts";
import type { JSONValue, Serialize } from "./serialize.ts";

export default class Tag<T extends Member<PackType>> implements Serialize {
  values: Identifier<T>[] = [];
  subTags: Identifier<Tag<T>>[] = [];
  replace: boolean = false;

  constructor(private identifier: Identifier<Tag<T>>) {}

  add(id: Identifier<T>) {
    this.values.push(id);
  }
  addTag(tag: Tag<T>) {
    this.subTags.push(tag.identifier);
  }

  serialize(): JSONValue {
    return {
      values: [
        ...this.values.map((value) => value.toString()),
        ...this.subTags.map((value) => `#${value}`),
      ],
    };
  }
}
