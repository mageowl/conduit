import { JSONObject, JSONValue } from "./serialize.ts";

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

export interface Components extends JSONObject {
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

  // Extra components that we might not know about.
  [name: string]: JSONValue | undefined;
}
