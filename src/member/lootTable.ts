import { Appendable, type Identifier, JSONMember } from "../member.ts";
import type Namespace from "../namespace.ts";
import { type JSONValue, serialize } from "../serialize.ts";
import type { RegistryTag } from "../tag.ts";
import type { NumberProvider } from "../types.ts";
import type { ItemModifierDefinition } from "./itemModifier.ts";

export default class LootTable extends JSONMember<"data">
  implements Appendable {
  static override readonly dataFolder: string = "loot_table";

  constructor(public data: LootTableDefinition) {
    super();
  }

  append(other: this): void {
    this.data.pools.push(...other.data.pools);
    this.data.functions = [
      ...this.data.functions ?? [],
      ...other.data.functions ?? [],
    ];
  }

  override add(_namespace: Namespace<"data">, _name: string): void {}

  override saveJSON(): JSONValue {
    return serialize(this.data);
  }
}

type LootTableDefinition = {
  type?: LootContext;
  functions?: ItemModifierDefinition[];
  pools: Pool[];
  // TODO: identifier of random seq
  random_sequence?: string;
};

export type Pool = {
  conditions?: LootPredicate[];
  functions?: ItemModifierDefinition[];
  rolls: NumberProvider;
  bonus_rolls?: NumberProvider;
  entries: Entry[];
};

export type Entry = SingletonEntry | CompositeEntry | TagEntry;

type SingletonEntry =
  & {
    conditions?: LootPredicate[];
    functions?: ItemModifierDefinition[];
    weight?: number;
    quality?: number;
  }
  & (
    | ItemEntry
    | SubTableEntry
    | DynamicEntry
    | EmptyEntry
  );

type ItemEntry = {
  type: "item";
  name: string;
};

type SubTableEntry = {
  type: "loot_table";
  value: Identifier<LootTable>;
};

type DynamicEntry = {
  type: "dynamic";
  name: "contents" | "sherds";
};

type EmptyEntry = {
  type: "empty";
};

type CompositeEntry = {
  type: "group" | "alternatives" | "sequence";
  conditions?: LootPredicate[];
  children: Entry[];
};

type TagEntry = {
  name: string | RegistryTag<"item">;
  expand: boolean;
  conditions?: LootPredicate[];
  functions?: ItemModifierDefinition[];
  weight?: number;
  quality?: number;
};

// TODO: define type
type LootPredicate = JSONValue;

type LootContext =
  | "empty"
  | "chest"
  | "fishing"
  | "entity"
  | "equipment"
  | "archaeology"
  | "vault"
  | "gift"
  | "barter"
  | "generic"
  | "block"
  | "shearing"
  | "entity_interact"
  | "block_interact";
