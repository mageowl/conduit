import { JSONMember } from "../member.ts";
import type Namespace from "../namespace.ts";
import type { JSONValue } from "../serialize.ts";
import type { DyeColor } from "../types.ts";

export default class ItemModel extends JSONMember<"assets"> {
  static override readonly dataFolder = "items";
  readonly data: {
    model: ItemModelDefinition;
    hand_animation_on_swap?: boolean;
    oversized_in_gui?: boolean;
  };

  constructor(
    data: {
      model: ItemModelDefinition;
      hand_animation_on_swap?: boolean;
    } | ItemModelDefinition,
  ) {
    super();
    if (!("type" in data)) {
      this.data = data;
    } else {
      this.data = { model: data };
    }
  }

  override add(_namespace: Namespace<"assets">, _name: string): void {}

  override saveJSON(): JSONValue {
    return this.data;
  }
}

type ItemModelTint =
  | ConstantTint
  | DyeTint
  | FireworkTint
  | GrassTint
  | MapColorTint
  | PotionTint
  | TeamTint
  | CustomModelDataTint;

type ConstantTint = {
  type: "constant";
  value: number | [number, number, number];
};
type DyeTint = {
  type: "dye";
  default: [number, number, number];
};
type FireworkTint = {
  type: "firework";
  default: [number, number, number];
};
type GrassTint = {
  type: "grass";
  tempature: number;
  downfall: number;
};
type MapColorTint = {
  type: "map_color";
  default: [number, number, number];
};
type PotionTint = {
  type: "potion";
  default: [number, number, number];
};
type TeamTint = {
  type: "team";
  default: [number, number, number];
};
type CustomModelDataTint = {
  type: "custom_model_data";
  index: number;
  default: [number, number, number];
};

type ItemModelDefinition =
  | ModelDefinition
  | CompositeDefinition
  | ConditionDefinition
  | SelectDefinition
  | RangeDispatchDefinition
  | SpecialDefinition;

type ModelDefinition = {
  type: "model";
  model: string;
  tints?: ItemModelTint[];
};

type CompositeDefinition = {
  type: "composite";
  models: ItemModelDefinition[];
};

type ConditionDefinition =
  | {
    type: "condition";
    property:
      | "broken"
      | "bundle/has_selected_item"
      | "carried"
      | "damaged"
      | "extended_view"
      | "fishing_rod/cast"
      | "selected"
      | "using_item"
      | "view_entity";
    on_true: ItemModelDefinition;
    on_false: ItemModelDefinition;
  }
  | ComponentConditionDefinition
  | HasComponentConditionDefinition
  | KeybindConditionDefinition
  | CustomModelDataConditionDefinition;
type ComponentConditionDefinition = {
  type: "condition";
  property: "component";
  predicate: string;
  value: JSONValue;
  on_true: ItemModelDefinition;
  on_false: ItemModelDefinition;
};
type HasComponentConditionDefinition = {
  type: "condition";
  property: "has_component";
  component: string;
  ignore_default?: boolean;
  on_true: ItemModelDefinition;
  on_false: ItemModelDefinition;
};
type KeybindConditionDefinition = {
  type: "condition";
  property: "keybind_down";
  keybind: string;
  on_true: ItemModelDefinition;
  on_false: ItemModelDefinition;
};
type CustomModelDataConditionDefinition = {
  type: "condition";
  property: "custom_model_data";
  index: number;
  on_true: ItemModelDefinition;
  on_false: ItemModelDefinition;
};

type GenericSelectDefinition<P extends string, K extends string> = {
  type: "select";
  property: P;
  cases: {
    when: K;
    model: ItemModelDefinition;
  }[];
  fallback?: ItemModelDefinition;
};

type SelectDefinition =
  | SelectBlockStateDefinition
  | SelectChargeTypeDefinition
  | SelectComponentDefinition
  | SelectContextDimentionDefinition
  | SelectContextEntityDefinition
  | SelectCustomModelDataDefinition
  | SelectDisplayContextDefinition
  | SelectLocalTimeDefinition
  | SelectMainHandDefinition
  | SelectTrimMaterialDefinition;
type SelectBlockStateDefinition =
  & GenericSelectDefinition<"block_state", string>
  & {
    block_state_property: string;
  };
type SelectChargeTypeDefinition = GenericSelectDefinition<
  "charge_type",
  "none" | "arrow" | "rocket"
>;
type SelectComponentDefinition =
  & GenericSelectDefinition<
    "component",
    string
  >
  & {
    component: string;
  };
type SelectContextDimentionDefinition = GenericSelectDefinition<
  "context_dimention",
  "overworld" | "nether" | "end" | string
>;
type SelectContextEntityDefinition = GenericSelectDefinition<
  "context_dimention",
  string
>;
type SelectDisplayContextDefinition = GenericSelectDefinition<
  "display_context",
  | "none"
  | "thirdperson_lefthand"
  | "thirdperson_righthand"
  | "firstperson_lefthand"
  | "firstperson_righthand"
  | "head"
  | "gui"
  | "ground"
  | "fixed"
>;
type SelectLocalTimeDefinition =
  & GenericSelectDefinition<"local_time", string>
  & {
    locale?: string;
    time_zone?: string;
    pattern: string;
  };
type SelectMainHandDefinition = GenericSelectDefinition<
  "main_hand",
  "left" | "right"
>;
type SelectTrimMaterialDefinition = GenericSelectDefinition<
  "trim_material",
  string
>;
type SelectCustomModelDataDefinition =
  & GenericSelectDefinition<"custom_model_data", string>
  & {
    index?: number;
  };

type RangeDispatchDefinition =
  | GenericRangeDispatchDefinition<"bundle/fullness">
  | CompassRangeDispatch
  | GenericRangeDispatchDefinition<"cooldown">
  | CountRangeDispatch
  | GenericRangeDispatchDefinition<"crossbow/pull">
  | DamageRangeDispatch
  | UseCycleRangeDispatch
  | UseDurationRangeDispatch
  | CustomModelDataRangeDispatch;
type GenericRangeDispatchDefinition<P extends string> = {
  type: "range_dispatch";
  property: P;
  scale: number;
  entries: {
    threshold: number;
    model: ItemModelDefinition;
  }[];
  fallback?: ItemModelDefinition;
};

type CompassRangeDispatch = GenericRangeDispatchDefinition<"compass"> & {
  target: "spawn" | "lodestone" | "recovery" | "none";
  wobble?: boolean;
};

type CountRangeDispatch = GenericRangeDispatchDefinition<"count"> & {
  normalize?: boolean;
};

type DamageRangeDispatch = GenericRangeDispatchDefinition<"damage"> & {
  normalize?: boolean;
};

type TimeRangeDispatch = GenericRangeDispatchDefinition<"time"> & {
  source: "daytime" | "moon_phase" | "random";
  wobble?: boolean;
};

type UseCycleRangeDispatch = GenericRangeDispatchDefinition<"use_cycle"> & {
  period?: number;
};

type UseDurationRangeDispatch =
  & GenericRangeDispatchDefinition<"use_duration">
  & {
    remaining?: boolean;
  };

type CustomModelDataRangeDispatch =
  & GenericRangeDispatchDefinition<"custom_model_data">
  & {
    index?: number;
  };

type EmptyDefinition = {
  type: "empty";
};
type BundleItemDefinition = {
  type: "bundle/selected_item";
};

type SpecialDefinition = {
  type: "special";
  base: string;
  model: SpecialTypeDefinition;
};
type SpecialTypeDefinition =
  | SpecialBannerDefinition
  | SpecialBedDefinition
  | SpecialChestDefinition
  | SpecialHeadDefinition
  | SpecialShulkerBoxDefinition
  | SpecialSignDefinition
  | {
    type: "conduit" | "decorated_pot" | "shield" | "trident";
  };
type SpecialBannerDefinition = {
  type: "banner";
  color: DyeColor;
};
type SpecialBedDefinition = {
  type: "bed";
  texture: string;
};
type SpecialChestDefinition = {
  type: "chest";
  texture: string;
  openness?: number;
};
type SpecialHeadDefinition = {
  type: "head";
  kind:
    | "skeleton"
    | "wither_skeleton"
    | "player"
    | "creeper"
    | "zombie"
    | "piglin"
    | "dragon";
  texture?: string;
  animation?: number;
};
type SpecialShulkerBoxDefinition = {
  type: "shulker_box";
  texture: string;
  openness?: number;
  orientation?: "up" | "down" | "left" | "right" | "forward" | "backward";
};
type SpecialSignDefinition = {
  type: "standing_sign" | "hanging_sign";
  wood_type:
    | "oak"
    | "spruce"
    | "birch"
    | "acacia"
    | "cherry"
    | "jungle"
    | "dark_oak"
    | "pale_oak"
    | "mangrove"
    | "bamboo"
    | "crimson"
    | "warped";
  texture?: string;
};
