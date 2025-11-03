import type { Particle } from "../cmd.ts";
import { type Identifier, JSONMember } from "../member.ts";
import type Namespace from "../namespace.ts";
import { OutputFile } from "../output.ts";
import { type JSONObject, type JSONValue, serialize } from "../serialize.ts";
import type Tag from "../tag.ts";
import type { NumberProvider, Rename } from "../types.ts";
import type Function from "./function.ts";
import type { PredicateDefintion } from "./predicate.ts";

export default class Enchantment extends JSONMember<"data"> {
  static override readonly dataFolder: string = "enchantment";

  constructor(public data: EnchantmentDefinition) {
    super();
  }

  override add(namespace: Namespace<"data">, name: string): void {}

  override saveJSON(): JSONValue {
    return serialize(this.data);
  }
}

type ItemSlot =
  | "any"
  | "head"
  | "mainhand"
  | "offhand"
  | "armor"
  | "feet"
  | "legs"
  | "chest"
  | "head"
  | "body"
  | "saddle";
export type EnchantmentDefinition = {
  description: string;
  exclusive_set?:
    | Identifier<Enchantment>
    | Identifier<Enchantment>[]
    | Tag<Enchantment>;
  supported_items: string | string[];
  primary_items?: string | string[];
  weight: number;
  max_level: number;
  min_cost: Omit<LinearLevelBasedValue, "type">;
  max_cost: Omit<LinearLevelBasedValue, "type">;
  anvil_cost: number;
  slots: ItemSlot[];
  effects:
    & { [trigger in ValueEffectComponentName]?: ValueEffectComponent[] }
    & { [trigger in EntityEffectComponentName]?: EntityEffectComponent[] }
    & {
      equipment_drops?: ValueEffectComponent & {
        enchanted: "attacker" | "victim";
      }[];
      post_attack?: EntityEffectComponent & {
        enchanted: "attacker" | "victim" | "damaging_entity";
        affected: "attacker" | "victim" | "damaging_entity";
      }[];
      location_changed?: {
        effect: LocationBasedEffect;
        requirements?: PredicateDefintion;
      }[];
      damage_immunity?: {
        effect: Record<string | number | symbol, never>;
        requirements?: PredicateDefintion | PredicateDefintion[];
      }[];
      prevent_equipment_drop?: Record<string | number | symbol, never>;
      prevent_armor_change?: Record<string | number | symbol, never>;
      attributes?: AttributeEffect[];
      crossbow_charging_sounds?: {
        start: string;
        mid: string;
        end: string;
      }[];
      trident_sound?: string[];
    };
};

type ValueEffectComponentName =
  | "armor_effectiveness"
  | "damage"
  | "damage_protection"
  | "smash_damage_per_fallen_block"
  | "knockback"
  | "ammo_use"
  | "projectile_piercing"
  | "block_experience"
  | "repair_with_xp"
  | "item_damage"
  | "projectile_count"
  | "trident_return_acceleration"
  | "projectile_speed"
  | "fishing_time_reduction"
  | "fishing_luck_bonus"
  | "mob_experience";
type ValueEffectComponent = {
  effect: ValueEffect;
  requirements?: PredicateDefintion | PredicateDefintion[];
};

type EntityEffectComponentName =
  | "hit_block"
  | "tick"
  | "projectile_spawned";
type EntityEffectComponent = {
  effect: EntityEffect;
  requirements?: PredicateDefintion;
};

type ValueEffect =
  | ValueArithmaticEffect
  | ValueMultiplyEffect
  | ValueRemoveBinomialEffect
  | ValueAllOfEffect;
type ValueArithmaticEffect = {
  type: "set" | "add";
  value: LevelBasedValue;
};
type ValueMultiplyEffect = {
  type: "multiply";
  factor: LevelBasedValue;
};
type ValueRemoveBinomialEffect = {
  type: "multiply";
  factor: LevelBasedValue;
};
type ValueAllOfEffect = {
  type: "all_of";
  effects: ValueEffect[];
};

type AttributeEffect = {
  attribute: string;
  amount: LevelBasedValue;
  operation: "add_value" | "add_multiplied_base" | "add_multiplied_total";
  id: string;
};

type EntityEffect =
  | EntityAllOfEffect
  | EntityApplyMobEffect
  | EntityDamageEffect
  | EntityChangeItemDamageEffect
  | EntityExplodeEffect
  | EntityIgniteEffect
  | EntityPlaySoundEffect
  | EntityDamageEffect
  | EntityChangeItemDamageEffect
  | EntityExplodeEffect
  | EntityIgniteEffect
  | EntityPlaySoundEffect
  | EntityReplaceBlockEffect
  | EntityReplaceDiskEffect
  | EntityRunFunctionEffect
  | EntitySetBlockPropertiesEffect
  | EntitySpawnParticlesEffect
  | EntitySummonEntityEffect;

type EntityAllOfEffect = {
  type: "all_of";
  effects: EntityEffect[];
};
type EntityApplyMobEffect = {
  type: "apply_mob_effect";
  to_apply: string | string[];
  min_duration: LevelBasedValue;
  max_duration: LevelBasedValue;
  min_amplifier: LevelBasedValue;
  max_amplifier: LevelBasedValue;
};
type EntityDamageEffect = {
  type: "damage_entity";
  damage_type: string;
  min_damage: LevelBasedValue;
  max_damage: LevelBasedValue;
};
type EntityChangeItemDamageEffect = {
  type: "change_item_damage";
  amount: LevelBasedValue;
};
type EntityExplodeEffect = {
  type: "explode";
  attribute_to_user?: boolean;
  damage_type?: string;
  immune_blocks?: string | string[];
  knockback_multiplier?: LevelBasedValue;
  offset?: [number, number, number];
  radius: LevelBasedValue;
  create_fire?: boolean;
  block_interaction: "none" | "block" | "mob" | "tnt" | "trigger";
  small_particle: Rename<Particle, "id", "type">;
  large_particle: Rename<Particle, "id", "type">;
  sound: string; // TODO: Inlined
};
type EntityIgniteEffect = {
  type: "ignite";
  duration: LevelBasedValue;
};
type EntityPlaySoundEffect = {
  type: "play_sound";
  sound: string; // TODO: can also be inline
  volume: NumberProvider;
  pitch: NumberProvider;
};
type EntityReplaceBlockEffect = {
  type: "replace_block";
  block_state: JSONObject; // TODO
  offset?: [number, number, number];
  predicate?: PredicateDefintion;
  trigger_game_event?: string;
};
type EntityReplaceDiskEffect = {
  type: "replace_disk";
  block_state: JSONObject; // TODO
  offset?: [number, number, number];
  predicate?: PredicateDefintion;
  trigger_game_event?: string;
  radius: LevelBasedValue;
  height: LevelBasedValue;
};
type EntityRunFunctionEffect = {
  type: "run_function";
  function: Identifier<Function>;
};
type EntitySetBlockPropertiesEffect = {
  type: "set_block_properties";
  offset?: [number, number, number];
  properties: { [name: string]: string };
  trigger_game_event?: string;
};
type EntitySpawnParticlesEffect = {
  particle: Rename<Particle, "id", "type">;
  horizontal_position: {
    type: "entity_position";
    offset?: number;
  } | {
    type: "in_bounding_box";
    offset?: number;
    scale?: number;
  };
  vertical_position: {
    type: "entity_position";
    offset?: number;
  } | {
    type: "in_bounding_box";
    offset?: number;
    scale?: number;
  };
  horizontal_velocity: {
    base?: NumberProvider;
    movement_scale?: number;
  };
  vertical_velocity: {
    base?: NumberProvider;
    movement_scale?: number;
  };
};
type EntitySummonEntityEffect = {
  type: "summon_entity";
  entity: string | string[];
  join_team?: boolean;
};

type LocationBasedEffect =
  | EntityEffect
  | ({
    type: "attribute";
  } & AttributeEffect)
  | {
    type: "all_of";
    effects: LocationBasedEffect[];
  };

export type LevelBasedValue =
  | number
  | LinearLevelBasedValue
  | LevelsSquaredLevelBasedValue
  | ClampedLevelBasedValue
  | FractionLevelBasedValue
  | LookupLevelBasedValue;
type LinearLevelBasedValue = {
  type: "linear";
  base: number;
  per_level_above_first: number;
};
type LevelsSquaredLevelBasedValue = {
  type: "levels_squared";
  added: number;
};
type ClampedLevelBasedValue = {
  type: "clamped";
  value: LevelBasedValue;
  min: number;
  max: number;
};
type FractionLevelBasedValue = {
  type: "fraction";
  numerator: LevelBasedValue;
  denominator: LevelBasedValue;
};
type LookupLevelBasedValue = {
  type: "lookup";
  values: number[];
  fallback: LevelBasedValue;
};
