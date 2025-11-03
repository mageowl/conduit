import { serialize } from "@mageowl/conduit";
import { Identifier, JSONMember } from "../member.ts";
import Namespace from "../namespace.ts";
import { JSONObject, JSONValue } from "../serialize.ts";
import { ContextEntity, NumberProvider } from "../types.ts";
import Enchantment, { LevelBasedValue } from "./enchantment.ts";

export default class Predicate extends JSONMember<"data"> {
  static override readonly dataFolder: string = "predicate";

  constructor(public data: PredicateDefinition) {
    super();
  }

  override add(namespace: Namespace<"data">, name: string): void {}

  override saveJSON(): JSONValue {
    return serialize(this.data);
  }
}

export type PredicateDefinition =
  | BooleanCondition
  | BlockStatePropertyCondition
  | DamageSourceCondition
  | EnchantmentActiveCondition
  | EntityPropertiesCondition
  | EntityScoresCondition
  | InvertedCondition
  | KilledByPlayerCondition
  | LocationCheckCondition
  | RandomChanceCondition
  | RandomChanceWithEnchantedBonusCondition
  | ReferenceCondition
  | SurvivesExplosionCondition
  | TableBonusCondition
  | TimeCheckCondition
  | ValueCheckCondition
  | WeatherCheckCondition;

type BooleanCondition = {
  condition: "all_of" | "any_of";
  terms: PredicateDefinition[];
};
type BlockStatePropertyCondition = {
  condition: "block_state_property";
  block: string;
  properties?: { [name: string]: string | { min: number; max: number } };
};
type DamageSourceCondition = {
  condition: "damage_source_properties";
  predicate: JSONObject; // TODO
};
type EnchantmentActiveCondition = {
  condition: "enchantment_active_check";
  active: boolean;
};
type EntityPropertiesCondition = {
  condition: "entity_properties";
  entity: ContextEntity;
  predicate: JSONObject; // TODO: entity predicate
};
type EntityScoresCondition = {
  condition: "entity_scores";
  entity: ContextEntity;
  score: {
    [score: string]: number | {
      min: number;
      max: number;
    };
  };
};
type InvertedCondition = {
  condition: "inverted";
  term: PredicateDefinition;
};
type KilledByPlayerCondition = {
  condition: "killed_by_player";
};
type LocationCheckCondition = {
  condition: "location_check";
  offsetX?: number;
  offsetY?: number;
  offsetZ?: number;
  predicate: JSONObject; // TODO
};
type RandomChanceCondition = {
  condition: "random_chance";
  chance: NumberProvider;
};
type RandomChanceWithEnchantedBonusCondition = {
  condition: "random_chance_with_enchanted_bonus";
  unenchanted_chance: number;
  enchanted_chance: LevelBasedValue;
  enchantment: Identifier<Enchantment> | string;
};
type ReferenceCondition = {
  condition: "reference";
  name: Identifier<Predicate>;
};
type SurvivesExplosionCondition = {
  condition: "survives_explosion";
};
type TableBonusCondition = {
  condition: "table_bonus";
  enchantment: Identifier<Enchantment> | string;
  chances: number[];
};
type TimeCheckCondition = {
  condition: "time_check";
  value: {
    min: NumberProvider;
    max: NumberProvider;
  };
};
type ValueCheckCondition = {
  condition: "value_check";
  value: NumberProvider;
  range: {
    min: NumberProvider;
    max: NumberProvider;
  } | number;
};
type WeatherCheckCondition = {
  condition: "weather_check";
  raining?: boolean;
  thundering?: boolean;
};
