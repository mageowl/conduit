export type { MinecraftVersion, PackMetadata } from "./datapack.ts";
export type { default as Namespace, Identifier } from "./namespace.ts";
export type * as cmd from "./cmd/types.ts";
export type { ItemStackJSON } from "./item.ts";
export type * as component from "./itemComponents.ts";
export type { Components } from "./itemComponents.ts";

export type NBTPrimative = string | number | boolean | null | undefined;
export interface NBTObject {
  [member: string]: NBTValue;
}
export type NBTValue = NBTPrimative | NBTObject | NBTValue[];
