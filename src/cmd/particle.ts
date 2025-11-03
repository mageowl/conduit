import type Item from "../item.ts";
import type { JSONObject } from "../serialize.ts";

export interface BlockStateParticle {
  id:
    | "block"
    | "block_crumble"
    | "block_marker"
    | "dust_pillar"
    | "falling_dust";
  block_state: {
    Name: string;
    Properties: JSONObject;
  } | string;
}
export interface DustParticle {
  id: "dust";
  color: [number, number, number];
  scale: number;
}
export interface DustColorTransitionParticle {
  id: "dust_color_transition";
  from_color: [number, number, number];
  to_color: [number, number, number];
  scale: number;
}
export interface EntityEffectParticle {
  id: "entity_effect";
  color: [number, number, number, number] | number;
}
export interface ItemParticle {
  id: "item";
  item: Item;
}
export interface SculkChargeParticle {
  id: "sculk_charge";
  roll: number;
}
export interface ShriekParticle {
  id: "shriek";
  delay: number;
}
export interface TrailParticle {
  id: "trail";
  target: [number, number, number];
  color: number;
  duration: number;
}
export interface VibrationParticle {
  id: "vibration";
  destination: {
    type: "block";
    pos: [number, number, number];
  };
  arrival_in_ticks: number;
}
export type Particle =
  | BlockStateParticle
  | DustParticle
  | DustColorTransitionParticle
  | EntityEffectParticle
  | ItemParticle
  | SculkChargeParticle
  | ShriekParticle
  | TrailParticle
  | VibrationParticle
  | {
    id: SimpleParticleId;
  };

export type SimpleParticleId =
  | "angry_villager"
  | "ash"
  | "block"
  | "block_crumble"
  | "block_marker"
  | "bubble"
  | "bubble_column_up"
  | "bubble_pop"
  | "campfire_cosy_smoke"
  | "campfire_signal_smoke"
  | "cherry_leaves"
  | "cloud"
  | "composter"
  | "crimson_spore"
  | "crit"
  | "current_down"
  | "damage_indicator"
  | "dolphin"
  | "dragon_breath"
  | "dripping_dripstone_lava"
  | "dripping_dripstone_water"
  | "dripping_honey"
  | "dripping_lava"
  | "dripping_obsidian_tear"
  | "dripping_water"
  | "dust"
  | "dust_color_transition"
  | "dust_pillar"
  | "dust_plume"
  | "effect"
  | "egg_crack"
  | "elder_guardian"
  | "electric_spark"
  | "enchant"
  | "enchanted_hit"
  | "end_rod"
  | "entity_effect"
  | "explosion"
  | "explosion_emitter"
  | "explosion_emitter"
  | "falling_dripstone_lava"
  | "falling_dripstone_water"
  | "falling_dust"
  | "falling_honey"
  | "falling_lava"
  | "falling_nectar"
  | "falling_obsidian_tear"
  | "falling_spore_blossom"
  | "falling_water"
  | "firefly"
  | "firework"
  | "fishing"
  | "flame"
  | "flash"
  | "glow"
  | "glow_squid_ink"
  | "gust"
  | "gust_emitter_small"
  | "gust_emitter_large"
  | "happy_villager"
  | "heart"
  | "infested"
  | "instant_effect"
  | "item"
  | "item_cobweb"
  | "item_slime"
  | "item_snowball"
  | "landing_honey"
  | "falling_honey"
  | "landing_lava"
  | "falling_lava"
  | "falling_dripstone_lava"
  | "landing_obsidian_tear"
  | "falling_obsidian_tear"
  | "large_smoke"
  | "lava"
  | "mycelium"
  | "nautilus"
  | "note"
  | "ominous_spawning"
  | "pale_oak_leaves"
  | "poof"
  | "portal"
  | "raid_omen"
  | "rain"
  | "reverse_portal"
  | "scrape"
  | "sculk_charge"
  | "sculk_charge_pop"
  | "sculk_soul"
  | "shriek"
  | "small_flame"
  | "small_gust"
  | "smoke"
  | "lava"
  | "sneeze"
  | "snowflake"
  | "sonic_boom"
  | "soul"
  | "soul_fire_flame"
  | "spit"
  | "splash"
  | "falling_water"
  | "falling_dripstone_water"
  | "spore_blossom_air"
  | "squid_ink"
  | "sweep_attack"
  | "tinted_leaves"
  | "totem_of_undying"
  | "trail"
  | "trial_omen"
  | "trial_spawner_detection"
  | "trial_spawner_detection_ominous"
  | "underwater"
  | "vault_connection"
  | "vibration"
  | "warped_spore"
  | "wax_off"
  | "wax_on"
  | "white_ash"
  | "white_smoke"
  | "witch"
  | "blockcrack"
  | "splash"
  | "bubble"
  | "flame"
  | "reddust"
  | "snowballpoof"
  | "largeexplode"
  | "portal"
  | "splash"
  | "note"
  | "footstep"
  | "crit"
  | "hugeexplosion"
  | "townaura"
  | "depthsuspend"
  | "dripWater"
  | "dripLava"
  | "magicCrit"
  | "spell"
  | "instantSpell"
  | "mobSpell"
  | "angryVillager"
  | "happyVillager"
  | "witchMagic"
  | "mobSpellAmbient"
  | "fireworksSpark"
  | "wake"
  | "barrier"
  | "droplet"
  | "take"
  | "mobappearance"
  | "iconcrack"
  | "snowballpoof"
  | "depthSuspend"
  | "dragonbreath"
  | "endRod"
  | "damageIndicator"
  | "sweepAttack"
  | "fallingdust"
  | "fallingdust"
  | "spit"
  | "talisman"
  | "talisman"
  | "totem"
  | "footstep"
  | "depthsuspend"
  | "take"
  | "blockcrack"
  | "blockdust"
  | "block"
  | "explode"
  | "snowshovel"
  | "poof"
  | "bubble_column_up"
  | "bubble_pop"
  | "current_down"
  | "squid_ink"
  | "nautilus"
  | "dolphin"
  | "dripping_water"
  | "dripping_water"
  | "dripping_water"
  | "sneeze"
  | "campfire_cosy_smoke"
  | "campfire_signal_smoke"
  | "composter"
  | "particles.png"
  | "explosion.png"
  | "sweep.png"
  | "dripping_honey"
  | "landing_honey"
  | "falling_honey"
  | "falling_nectar"
  | "ash"
  | "crimson_spore"
  | "soul_fire_flame"
  | "warped_spore"
  | "dripping_obsidian_tear"
  | "falling_obsidian_tear"
  | "landing_obsidian_tear"
  | "soul"
  | "white_ash"
  | "snowflake"
  | "dripping_dripstone_lava"
  | "dripping_dripstone_water"
  | "falling_dripstone_lava"
  | "falling_dripstone_water"
  | "vibration"
  | "dust_color_transition"
  | "glow"
  | "glow_squid_ink"
  | "falling_spore_blossom"
  | "spore_blossom_air"
  | "electric_spark"
  | "scrape"
  | "wax_off"
  | "wax_on"
  | "footprint"
  | "light"
  | "block_marker"
  | "light"
  | "barrier"
  | "shriek"
  | "sculk_soul"
  | "sculk_charge_pop"
  | "sculk_charge"
  | "allay_dust"
  | "sonic_boom"
  | "allay_dust"
  | "dripping_cherry_leaves"
  | "falling_cherry_leaves"
  | "landing_cherry_leaves"
  | "dripping_cherry_leaves"
  | "falling_cherry_leaves"
  | "landing_cherry_leaves"
  | "cherry_leaves"
  | "dust_plume"
  | "white_smoke"
  | "gust"
  | "gust_dust"
  | "trial_spawner_detection"
  | "gust_dust"
  | "vault_connection"
  | "infested"
  | "item_cobweb"
  | "ominous_spawning"
  | "raid_omen"
  | "small_gust"
  | "trial_omen"
  | "trial_spawner_detection_ominous"
  | "block_crumble"
  | "trail"
  | "trail"
  | "duration"
  | "pale_oak_leaves"
  | "tinted_leaves"
  | "tinted_leaves"
  | "color";
