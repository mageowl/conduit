import type { Components } from "./itemComponents.ts";
import type { ItemModifierDefinition } from "./member/itemModifier.ts";
import { type JSONObject, type Serialize, serialize } from "./serialize.ts";
import type { LootEntry } from "./types.ts";

type ItemConfig = {
  id: string;
  components?: Components;
} | string;

export default class Item implements Serialize {
  id: string;
  components: Components;

  constructor(
    config: ItemConfig,
  ) {
    if (typeof config === "string") {
      this.id = config;
      this.components = {};
    } else {
      const { id, components = {} } = config;
      this.id = id;
      this.components = components;
    }
  }

  count(count: number): ItemStack {
    return new ItemStack(this, count);
  }

  toLootEntry(functions: ItemModifierDefinition[] = []): LootEntry {
    return {
      type: "item",
      name: this.id,
      functions: [
        {
          function: "set_components",
          components: this.components,
        },
        ...functions,
      ],
    };
  }

  toString(): string {
    const components: string[] = [];
    Object.entries(this.components).forEach(([key, value]) => {
      if (key.startsWith("!")) {
        components.push(key);
      } else {
        components.push(`${key}=${JSON.stringify(serialize(value))}`);
      }
    });
    return `${this.id}[${components.join(",")}]`;
  }
  serialize(): JSONObject {
    return {
      id: this.id,
      components: serialize(this.components),
    };
  }
}

export class ItemStack implements Serialize {
  item: Item;
  count: number;

  constructor(
    item: Item | ItemConfig,
    count: number,
  ) {
    if (item instanceof Item) this.item = item;
    else this.item = new Item(item);
    this.count = count;
  }

  serialize(): JSONObject {
    return {
      ...this.item.serialize(),
      count: this.count,
    };
  }

  toLootEntry(functions: ItemModifierDefinition[] = []): LootEntry {
    return this.item.toLootEntry([{
      function: "set_count",
      count: this.count,
    }]);
  }

  toString(): string {
    return `${this.item} ${this.count}`;
  }
}
