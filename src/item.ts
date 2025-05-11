import { Components } from "./itemComponents.ts";

export default class ItemStack {
  id: string;
  components: Components;

  constructor(
    { id, components = {} }: { id: string; components?: Components },
  ) {
    this.id = id;
    this.components = components;
  }

  toString() {
    const components: string[] = [];
    Object.entries(this.components).forEach(([key, value]) => {
      components.push(`${key}=${JSON.stringify(value)}`);
    });
    return `${this.id}[${components.join(",")}]`;
  }
  toJSON(): ItemStackJSON {
    return {
      id: this.id,
      components: this.components,
    };
  }
}

export type ItemStackJSON = {
  id: string;
  components?: Components;
  count?: number;
};
