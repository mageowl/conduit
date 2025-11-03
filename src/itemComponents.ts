import type ItemModel from "./member/itemModel.ts";
import type { TextComponent } from "./cmd/text.ts";
import type { JSONObject, JSONValue, Serializable } from "./serialize.ts";
import { Identifier } from "./member.ts";

export type ItemRarity = "common" | "uncommon" | "rare" | "epic";
export type ConsumeEffectApplyEffects = {
  type: "apply_effects";
  effects: {
    id: string;
    amplifier?: number;
    duration?: number;
    ambient?: boolean;
    show_particles?: boolean;
    show_icon?: boolean;
  }[];
  probability?: number;
};
export type ConsumeEffectRemoveEffects = {
  type: "remove_effects";
  effects: string | string[];
};
export type ConsumeEffectClearAllEffects = {
  type: "clear_all_effects";
};
export type ConsumeEffectTeleportRandomly = {
  type: "teleport_randomly";
  diameter?: number;
};
export type ConsumeEffectPlaySound = {
  type: "play_sound";
  // TODO: Inline sound effect?
  sound: string;
};
export type ConsumeEffect = ConsumeEffectApplyEffects;

interface PositiveComponents {
  consumable?: {
    consume_seconds?: number;
    animation?:
      | "none"
      | "eat"
      | "drink"
      | "block"
      | "bow"
      | "spear"
      | "crossbow"
      | "spyglass"
      | "toot_horn"
      | "brush";
    sound?: string;
    has_consume_particles?: boolean;
    on_consume_effects?: ConsumeEffect[];
  };
  custom_data?: { [key: string]: JSONValue };
  custom_model_data?: {
    floats?: number[];
    flags?: boolean[];
    strings?: string[];
    colors?: ([number, number, number] | number)[];
  };
  enchantment_glint_override?: boolean;
  entity_data?: {
    id: string;
    [name: string]: JSONValue;
  };
  item_model?: Identifier<ItemModel> | string;
  item_name?: string | TextComponent | TextComponent[];
  rarity?: ItemRarity;

  // Extra components that we might not know about.
  [name: string]: Serializable | undefined;
}

export type Components =
  & PositiveComponents
  & {
    [Key in `!${keyof PositiveComponents}`]: Record<
      string | number | symbol,
      never
    >;
  };
