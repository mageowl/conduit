import Item from "../item.ts";
import { JSONObject } from "../serialize.ts";

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
  | string
  | BlockStateParticle
  | DustParticle
  | DustColorTransitionParticle
  | EntityEffectParticle
  | ItemParticle
  | SculkChargeParticle
  | ShriekParticle
  | TrailParticle
  | VibrationParticle;
