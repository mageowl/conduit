import { TextJSON } from "../cmd/text.ts";
import Item from "../item.ts";
import Namespace, { Identifier, JSONMember } from "../namespace.ts";
import { JSONValue, serialize } from "../serialize.ts";
import Function from "./function.ts";

export default class Advancement<
  T extends { [name: string]: AdvancementCriteria } = {
    [name: string]: AdvancementCriteria;
  },
> extends JSONMember {
  override readonly dataFolder: string = "advancement";
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
  conditions?: { [key: string]: JSONValue };
};
