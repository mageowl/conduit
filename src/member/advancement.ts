import { TextJSON } from "../cmd/text.ts";
import { ItemStackJSON } from "../item.ts";
import { JSONMember } from "../namespace.ts";
import { NBTValue } from "../types.ts";

export default class Advancement<
  T extends { [name: string]: AdvancementCriteria },
> extends JSONMember {
  override dataFolder: string = "advancement";
  data: AdvancementDefinition<T>;

  constructor(data: AdvancementDefinition<T>) {
    super();

    this.data = data;
  }

  override saveJSON(): NBTValue {
    return this.data;
  }
}

type AdvancementDefinition<
  T extends { [name: string]: AdvancementCriteria },
> = {
  parent?: string;
  display?: AdvancementDisplay;
  criteria: T;
  requirements?: (keyof T & string)[];
  rewards?: {
    experience?: number;
    recipes?: string[];
    loot?: string[];
    function?: string;
  };
};
type AdvancementDisplay = {
  icon: ItemStackJSON;
  title: TextJSON;
  description: TextJSON;
  frame?: "challenge" | "goal" | "task";
  background?: string;
  show_toast?: boolean;
  announce_to_chat?: boolean;
  hidden?: boolean;
};

// TODO: Implement seperate type for each criteria
type AdvancementCriteria = {
  trigger: string;
  conditions?: { [key: string]: NBTValue };
};
