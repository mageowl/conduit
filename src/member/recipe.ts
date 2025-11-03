import type { default as Item, ItemStack } from "../item.ts";
import type Namespace from "../namespace.ts";
import { JSONMember } from "../member.ts";
import { type JSONValue, serialize } from "../serialize.ts";

export default class Recipe<
  T extends { [char: string]: RecipeIngredient } = {
    [char: string]: RecipeIngredient;
  },
> extends JSONMember<"data"> {
  static override readonly dataFolder = "recipe";

  constructor(public readonly data: RecipeDefinition<T>) {
    super();
  }

  override add(_namespace: Namespace<"data">, _name: string): void {}

  override saveJSON(): JSONValue {
    return serialize(this.data);
  }
}

type RecipeDefinition<T extends { [char: string]: RecipeIngredient }> =
  | BlastingRecipe
  | CampfireCookingRecipe
  | CraftingShapedRecipe<T>
  | CraftingShapelessRecipe
  | CraftingTransmuteRecipe
  | CraftingSpecialRecipe
  | CraftingDecoratedPotRecipe
  | SmeltingRecipe
  | SmithingTransformRecipe
  | SmithingTrimRecipe
  | SmokingRecipe
  | StonecuttingRecipe;

type RecipeIngredient = string | string[];

type BlastingRecipe = {
  type: "blasting";
  category?: "blocks" | "misc";
  group?: string;
  ingredient: RecipeIngredient;
  cookingtime?: number;
  result: Item;
  experience?: number;
};

type CampfireCookingRecipe = {
  type: "campfire_cooking";
  ingredient: RecipeIngredient;
  cookingtime?: number;
  result: Item;
};

type CraftingRecipeCategory = "equipment" | "building" | "misc" | "redstone";

type RecipedPatternRow3<T> = `${keyof T & string | " "}${
  | keyof T & string
  | " "}${
  | keyof T & string
  | " "}`;
type ShapedRecipePatternRow2<T> = `${keyof T & string | " "}${
  | keyof T & string
  | " "}`;
type ShapedRecipePatternRow1<T> = keyof T & string | " ";
type ShapedRecipePattern<T> =
  | [RecipedPatternRow3<T>, RecipedPatternRow3<T>, RecipedPatternRow3<T>]
  | [RecipedPatternRow3<T>, RecipedPatternRow3<T>]
  | [RecipedPatternRow3<T>]
  | [
    ShapedRecipePatternRow2<T>,
    ShapedRecipePatternRow2<T>,
    ShapedRecipePatternRow2<T>,
  ]
  | [ShapedRecipePatternRow2<T>, ShapedRecipePatternRow2<T>]
  | [ShapedRecipePatternRow2<T>]
  | [
    ShapedRecipePatternRow1<T>,
    ShapedRecipePatternRow1<T>,
    ShapedRecipePatternRow1<T>,
  ]
  | [ShapedRecipePatternRow1<T>, ShapedRecipePatternRow1<T>]
  | [ShapedRecipePatternRow1<T>];
type CraftingShapedRecipe<T extends { [char: string]: RecipeIngredient }> = {
  type: "crafting_shaped";
  category?: CraftingRecipeCategory;
  group?: string;
  pattern: ShapedRecipePattern<T>;
  key: T;
  result: ItemStack | Item;
};

type CraftingShapelessRecipe = {
  type: "crafting_shapeless";
  category?: CraftingRecipeCategory;
  group?: string;
  ingredients: RecipeIngredient[];
  result: ItemStack | Item;
};

type CraftingTransmuteRecipe = {
  type: "crafting_transmute";
  category?: CraftingRecipeCategory;
  group?: string;
  input: RecipeIngredient;
  material: RecipeIngredient;
  result: string;
};

type CraftingSpecialType =
  | "armordye"
  | "bannerduplicate"
  | "bookcloning"
  | "firework_rocket"
  | "firework_star"
  | "firework_star_fade"
  | "mapcloning"
  | "mapextending"
  | "repairitem"
  | "shielddecoration"
  | "tippedarrow";
type CraftingSpecialRecipe = {
  type: `crafting_special_${CraftingSpecialType}`;
};

type CraftingDecoratedPotRecipe = {
  type: "crafting_decorated_pot";
  category?: CraftingRecipeCategory;
};

type SmeltingRecipe = {
  type: "smelting";
  category?: "food" | "blocks" | "misc";
  group?: string;
  ingredient: RecipeIngredient;
  cookingtime?: number;
  result: Item;
  experience?: number;
};

type SmithingTransformRecipe = {
  type: "smithing_transform";
  template: RecipeIngredient;
  base: RecipeIngredient;
  addition: RecipeIngredient;
  result: ItemStack | Item;
};

type SmithingTrimRecipe = {
  type: "smithing_trim";
  template: RecipeIngredient;
  base: RecipeIngredient;
  addition: RecipeIngredient;
};

type SmokingRecipe = {
  type: "smoking";
  group?: string;
  ingredient: RecipeIngredient;
  cookingtime?: number;
  result: Item;
  experience?: number;
};

type StonecuttingRecipe = {
  type: "stonecutting";
  ingredient: RecipeIngredient;
  result: ItemStack | Item;
};
