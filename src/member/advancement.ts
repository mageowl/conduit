import type { Text } from "../cmd/text.ts";
import type Item from "../item.ts";
import { type Identifier, JSONMember } from "../member.ts";
import type Namespace from "../namespace.ts";
import { type JSONValue, serialize } from "../serialize.ts";
import type Function from "./function.ts";

export default class Advancement<
  T extends { [name: string]: AdvancementCriteria } = {
    [name: string]: AdvancementCriteria;
  },
> extends JSONMember {
  static override readonly dataFolder: string = "advancement";
  data: AdvancementDefinition<T>;

  constructor(data: AdvancementDefinition<T>) {
    super();

    this.data = data;
  }

  override add(_namespace: Namespace, _name: string): void {}

  override saveJSON(): JSONValue {
    return serialize(this.data);
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
    function?: Identifier<Function>;
  };
};
type AdvancementDisplay = {
  icon: Item;
  title: Text;
  description: Text;
  frame?: "challenge" | "goal" | "task";
  background?: string;
  show_toast?: boolean;
  announce_to_chat?: boolean;
  hidden?: boolean;
};

// TODO: Implement seperate type for each criteria
type AdvancementCriteria = {
  trigger: string;
  conditions?: { [key: string]: JSONValue };
};
