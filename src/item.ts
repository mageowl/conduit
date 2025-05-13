import type { Components } from "./itemComponents.ts";
import type { Serialize } from "./serialize.ts";

export default class Item implements Serialize {
  id: string;
  components: Components;

  constructor(
    { id, components = {} }: {
      id: string;
      components?: Components;
    },
  ) {
    this.id = id;
    this.components = components;
  }

  count(count: number): ItemStack {
    return new ItemStack(this, count);
  }

  toString(): string {
    const components: string[] = [];
    Object.entries(this.components).forEach(([key, value]) => {
      components.push(`${key}=${JSON.stringify(value)}`);
    });
    return `${this.id}[${components.join(",")}]`;
  }
  serialize(): { id: string; components: Components } {
    return {
      id: this.id,
      components: this.components,
    };
  }
}

export class ItemStack implements Serialize {
  item: Item;
  count: number;

  constructor(
    item: Item,
    count: number,
  ) {
    this.item = item;
    this.count = count;
  }

  serialize(): { count: number; id: string; components: Components } {
    return {
      ...this.item.serialize(),
      count: this.count,
    };
  }
}
