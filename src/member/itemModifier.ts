import { IntoText } from "../cmd/text.ts";
import { Components } from "../itemComponents.ts";
import { JSONMember } from "../member.ts";
import type Namespace from "../namespace.ts";
import { type JSONObject, type JSONValue, serialize } from "../serialize.ts";
import type {
  ContextEntity,
  DyeColor,
  Identifier,
  NumberProvider,
} from "../types.ts";

export default class ItemModifier extends JSONMember<"data"> {
  static override readonly dataFolder = "item_modifier";

  constructor(
    public data: ItemModifierDefinition | ItemModifierDefinition[],
  ) {
    super();
  }

  override add(_namespace: Namespace<"data">, _name: string): void {}

  override saveJSON(): JSONValue {
    return serialize(this.data);
  }
}

export type ItemModifierDefinition =
  & {
    // TODO: predicates
    conditions?: never[];
  }
  & (
    | ApplyBonusDefinition
    | CopyComponentsDefinition
    | CopyCustomDataDefinition
    | CopyNameDefinition
    | CopyStateDefinition
    | EnchantedCountIncreaseDefinition
    | EnchantRandomlyDefinition
    | EnchantWithLevelsDefinition
    | ExplorationMapDefinition
    | ExplosionDecayDefinintion
    | FillPlayerHeadDefiniton
    | FilteredDefinition
    | FurnaceSmeltDefinition
    | LimitCountDefinition
    | ModifyContentsDefinition
    | ReferenceDefinition
    | SequenceDefinition
    | SetAttributesDefinition
    | SetBannerPatternDefinition
    | SetBookCoverDefinition
    | SetComponentsDefinition
    | SetContentsDefinition
    | SetCountDefinition
    | SetCustomDataDefinition
    | SetCustomModelDataDefinition
    | SetDamageDefinition
    | SetEnchantmentsDefinition
    | SetFireworkExplosionDefinition
    | SetFireworksDefinition
    | SetInstrumentDefinition
    | SetItemDefinition
    | SetLootTableDefinition
    | SetLoreDefinition
    | SetNameDefinition
    | SetOminousBottleAmplifierDefinition
    | SetPotionDefinition
    | SetStewEffectDefinition
    | SetWritableBookPagesDefinition
    | SetWrittenBookPagesDefinition
    | ToggleTooltipsDefiniton
  );

type ApplyBonusDefinition = {
  function: "apply_bonus";
  enchantment: string;
  formula: "binomial_with_bonus_count" | "uniform_bonus_count" | "ore_drops";
  parameters?: {
    extra?: number;
    probability?: number;
    bonusMultiplier?: number;
  };
};

type CopyComponentsDefinition = {
  function: "copy_components";
  source: "block_entity";
  include?: string[];
  exclude?: string[];
};

type CopyCustomDataDefinition = {
  function: "copy_custom_data";
  source: ContextEntity | {
    type: "context";
    target: ContextEntity;
  } | {
    type: "storage";
    source: string;
  };
  ops: {
    source: string;
    target: string;
    op: "append" | "replace" | "merge";
  }[];
};

type CopyNameDefinition = {
  function: "copy_name";
  source: ContextEntity;
};

type CopyStateDefinition = {
  function: "copy_state";
  block: string;
  properties: string[];
};

type EnchantRandomlyDefinition = {
  function: "enchant_randomly";
  options?: string | string[];
  only_compatable?: boolean;
};

type EnchantWithLevelsDefinition = {
  function: "enchant_with_levels";
  levels: NumberProvider;
};

type EnchantedCountIncreaseDefinition = {
  function: "enchanted_count_increase";
  count: NumberProvider;
  limit: number;
  // TODO: Enchantment identifier
  enchantment: string;
};

type ExplorationMapDefinition = {
  function: "exploration_map";
  // TODO: Tag of structures
  destination?: string;
  decoration?:
    | "player"
    | "frame"
    | "red_marker"
    | "blue_marker"
    | "target_x"
    | "target_point"
    | "player_off_map"
    | "player_off_limits"
    | "mansion"
    | "monument"
    | `banner_${DyeColor}`
    | "red_x"
    | `${"desert" | "plains" | "snowy" | "taiga" | "savanna"}_village`
    | "jungle_pyramid"
    | "swamp_hut"
    | "trial_chambers";
  zoom?: number;
  search_radius?: number;
  skip_existing_chunks?: boolean;
};

type ExplosionDecayDefinintion = {
  function: "explosion_decay";
};

type FillPlayerHeadDefiniton = {
  function: "fill_player_head";
  // NOTE to self: cannot be block_entity.
  entity: ContextEntity;
};

type FilteredDefinition = {
  function: "filtered";
  TODO: never;
};

type FurnaceSmeltDefinition = {
  function: "furnace_smelt";
};

type LimitCountDefinition = {
  function: "limit_count";
  limit: number | {
    min?: NumberProvider;
    max?: NumberProvider;
  };
};

type ModifyContentsDefinition = {
  function: "modify_contents";
  component: "bundle_contents" | "charged_projectiles" | "container";
  modifier: ItemModifierDefinition | ItemModifierDefinition[];
};

type ReferenceDefinition = {
  function: "reference";
  name: Identifier<ItemModifier> | Identifier<ItemModifier>[];
};

type SequenceDefinition = {
  function: "sequence";
  functions: ItemModifierDefinition[];
};

type SetAttributesDefinition = {
  function: "set_attributes";
  modifiers: {
    attribute: string;
    operation: "add_value" | "add_multiplied_base" | "add_multiplied_total";
    amount: NumberProvider;
    id: string;
    slot: "mainhand" | "offhand" | "feet" | "legs" | "chest" | "head";
  }[];
  replace?: boolean;
};

type SetBannerPatternDefinition = {
  function: "set_banner_pattern";
  patterns: {
    pattern: string;
    color: DyeColor;
  }[];
  append: boolean;
};

type SetBookCoverDefinition = {
  function: "set_book_cover";
  author?: string;
  generation?: number;
  title?: IntoText;
};

type SetComponentsDefinition = {
  function: "set_components";
  components: Components;
};

type SetContentsDefinition = {
  function: "set_contents";
  // TODO: Loot table entries
  entries: never[];
  component: "bundle_contents" | "charged_projectiles" | "container";
};

type SetCountDefinition = {
  function: "set_count";
  count: NumberProvider;
  add?: boolean;
};

type SetCustomDataDefinition = {
  function: "set_custom_data";
  tag: JSONObject;
};

type ListOperation = {
  mode: "append" | "replace_all";
} | {
  mode: "insert";
  offset: number;
} | {
  mode: "replace_section";
  offset: number;
  size: number;
};
type CustomModelDataOperation<T> =
  & ListOperation
  & { values: T[] };
type SetCustomModelDataDefinition = {
  function: "set_custom_model_data";
  floats?: CustomModelDataOperation<NumberProvider>;
  flags?: CustomModelDataOperation<boolean>;
  strings?: CustomModelDataOperation<string>;
  colors?: CustomModelDataOperation<[number, number, number] | number>;
};

type SetDamageDefinition = {
  function: "set_damage";
  damage: NumberProvider;
  add?: boolean;
};

type SetEnchantmentsDefinition = {
  function: "set_enchantments";
  enchantments: { [name: string]: NumberProvider };
  add?: boolean;
};

type SetFireworksDefinition = {
  function: "set_fireworks";
  explosions?: {
    values: Exclude<SetFireworkExplosionDefinition, "function">[];
  } & ListOperation;
  flight_duration?: number;
};
type SetFireworkExplosionDefinition = {
  function: "set_firework_explosion";
  shape: "small_ball" | "large_ball" | "star" | "creeper" | "burst";
  colors: number[];
  fade_colors: number[];
  has_trail: boolean;
  has_twinkle: boolean;
};

type SetInstrumentDefinition = {
  function: "set_instrument";
  options: string;
};

type SetItemDefinition = {
  function: "set_item";
  id: string;
};

type SetLootTableDefinition = {
  function: "set_loot_table";
  name: string;
  seed?: number;
  type?: string;
};

type SetLoreDefinition = {
  function: "set_lore";
  lore: IntoText[];
  entity?: ContextEntity;
} & ListOperation;

type SetNameDefinition = {
  function: "set_name";
  name: IntoText;
  entity: ContextEntity;
  target?: "custom_name" | "item_name";
};

type SetOminousBottleAmplifierDefinition = {
  function: "set_ominous_bottle_amplifier";
  amplifier: NumberProvider;
};

type SetPotionDefinition = {
  function: "set_potion";
  id: string;
};

type SetStewEffectDefinition = {
  function: "set_stew_effect";
  effects: {
    type: string;
    duration: NumberProvider;
  }[];
};

type SetWritableBookPagesDefinition = {
  function: "set_writable_book_pages";
  pages: ({
    raw: string;
    filtered?: string;
  } | string)[];
} & ListOperation;

type SetWrittenBookPagesDefinition = {
  function: "set_writable_book_pages";
  pages: ({
    raw: IntoText;
    filtered?: IntoText;
  } | IntoText)[];
} & ListOperation;

type ToggleTooltipsDefiniton = {
  function: "toggle_tooltips";
  toggles: {
    toggles?: boolean;
    attribute_modifiers?: boolean;
    can_break?: boolean;
    can_place_on?: boolean;
    dyed_color?: boolean;
    enchantments?: boolean;
    stored_enchantments?: boolean;
    trim?: boolean;
    unbreakable?: boolean;
  };
};
