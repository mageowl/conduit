import { Particle } from "./cmd/particle.ts";
import { Pos } from "./cmd/pos.ts";
import Selector from "./cmd/selector.ts";
import { IntoText, Text } from "./cmd/text.ts";
import ItemStack from "./item.ts";
import { Advancement } from "./main.ts";
import { Identifier } from "./namespace.ts";

export { default as Selector } from "./cmd/selector.ts";
export { Pos, Rot } from "./cmd/pos.ts";
export { Text } from "./cmd/text.ts";
export type * from "./cmd/text.ts";
export type * from "./cmd/particle.ts";

function advancementSubCommands(action: "grant" | "revoke") {
  const subCommand =
    (target: "from" | "through" | "until") =>
    (selector: Selector, id: Identifier<Advancement>) =>
      `advancement ${action} ${selector} ${target} ${id}`;
  return {
    only<T>(
      selector: Selector,
      id: Identifier<Advancement>,
      criterion?: string,
    ) {
      return criterion != null
        ? `advancement ${action} ${selector} only ${id} ${criterion}`
        : `advancement ${action} ${selector} only ${id}`;
    },
    everything(selector: Selector) {
      return `advancement ${action} ${selector} everything`;
    },
    from: subCommand("from"),
    through: subCommand("through"),
    until: subCommand("until"),
  };
}
export const advancement = {
  revoke: advancementSubCommands("revoke"),
  grant: advancementSubCommands("grant"),
};

export { default as Execute } from "./cmd/execute.ts";

export function give(selector: Selector, item: ItemStack, count = 1) {
  return `give ${selector} ${item} ${count}`;
}

export function particle(particle: Particle, pos = Pos.relative()) {
  let particleString;
  if (typeof particle === "string") {
    particleString = particle;
  } else {
    const tags: string[] = [];
    Object.entries(particle).forEach(([key, value]) => {
      if (key !== "id") {
        tags.push(`${key}:${JSON.stringify(value)}`);
      }
    });
    particleString = `${particle.id}{${tags.join(",")}}`;
  }

  return `particle ${particleString} ${pos}`;
}

export function tellraw(selector: Selector, message: IntoText): string {
  const text = Text.from(message);
  return `tellraw ${selector} ${text}`;
}
