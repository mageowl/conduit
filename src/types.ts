export type { Package } from "./datapack.ts";
export type { MinecraftVersion, PackMetadata, Version } from "./pack.ts";
export type { default as Namespace } from "./namespace.ts";
export type { Identifier, Macro } from "./member.ts";
export type * as component from "./itemComponents.ts";
export type * from "./text.ts";
export type { Components } from "./itemComponents.ts";
export type {
  JSONObject,
  JSONPrimative,
  JSONValue,
  Serializable,
  Serialize,
} from "./serialize.ts";

export type {
  Entry as LootEntry,
  LootTableDefinition,
  Pool as LootPool,
} from "./member/lootTable.ts";
export type {
  AdvancementCriteria,
  AdvancementDefinition,
} from "./member/advancement.ts";
export type {
  DialogAction,
  DialogButton,
  DialogDefinition,
  DialogElement,
  DialogInput,
} from "./member/dialog.ts";
export type { FontDefinition, FontProvider } from "./member/font.ts";
export type { RecipeDefinition } from "./member/recipe.ts";
export type { EnchantmentDefinition } from "./member/enchantment.ts";
export type { ItemModelDefinition } from "./member/itemModel.ts";
export type { PredicateDefinition } from "./member/predicate.ts";

export type Rename<T, K extends keyof T, N extends string> =
  & Pick<T, Exclude<K, keyof T>>
  & { [P in N]: T[K] };

export type DyeColor =
  | "white"
  | "light_gray"
  | "gray"
  | "black"
  | "brown"
  | "red"
  | "orange"
  | "yellow"
  | "lime"
  | "green"
  | "cyan"
  | "light_blue"
  | "blue"
  | "purple"
  | "magenta"
  | "pink";

export type ContextEntity =
  | "block_entity"
  | "this"
  | "attacker"
  | "direct_attacker"
  | "attacking_player";

export type NumberProvider =
  | number
  | {
    min: NumberProvider;
    max: NumberProvider;
  }
  | ConstantNumber
  | UniformNumber
  | BinomialNumber
  | ScoreNumber
  | StorageNumber
  | EnchantmentLevelNumber;
type ConstantNumber = {
  type: "constant";
  value: number;
};
type UniformNumber = {
  type: "uniform";
  min: NumberProvider;
  max: NumberProvider;
};
type BinomialNumber = {
  type: "binomial";
  n: NumberProvider;
  p: NumberProvider;
};
type ScoreNumber = {
  type: "score";
  target: {
    type: "fixed";
    name: string;
  } | {
    type: "context";
    target: ContextEntity;
  };
  score: string;
  scale?: number;
};
type StorageNumber = {
  type: "storage";
  storage: string;
  path: string;
};
type EnchantmentLevelNumber = {
  type: "enchantment_level";
  amount: string;
};

export type Time = `${number}${"d" | "s" | "t"}`;
