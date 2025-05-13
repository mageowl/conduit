import type { Particle } from "./cmd/particle.ts";
import type Selector from "./cmd/selector.ts";
import Item from "./item.ts";
import type Advancement from "./member/advancement.ts";
import type Function from "./member/function.ts";
import type { Identifier } from "./member.ts";
import { type IntoText, Text } from "./cmd/text.ts";
import { Pos } from "./cmd/pos.ts";
import type { ItemStack } from "./item.ts";

export { default as Selector } from "./cmd/selector.ts";
export { Pos, Rot } from "./cmd/pos.ts";
export { Text } from "./cmd/text.ts";

interface AdvancementCommand {
  revoke: AdvancementSubCommand;
  grant: AdvancementSubCommand;
}

interface AdvancementSubCommand {
  only(
    selector: Selector,
    id: Identifier<Advancement>,
    criterion?: string,
  ): string;
  everything(selector: Selector): string;
  from: (selector: Selector, id: Identifier<Advancement>) => string;
  through: (selector: Selector, id: Identifier<Advancement>) => string;
  until: (selector: Selector, id: Identifier<Advancement>) => string;
}

function advancementSubCommands(
  action: "grant" | "revoke",
): AdvancementSubCommand {
  const subCommand =
    (target: "from" | "through" | "until") =>
    (selector: Selector, id: Identifier<Advancement>) =>
      `advancement ${action} ${selector} ${target} ${id}`;
  return {
    only(
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
export const advancement: AdvancementCommand = {
  revoke: advancementSubCommands("revoke"),
  grant: advancementSubCommands("grant"),
};

export function call(func: Identifier<Function>): string {
  return `function ${func}`;
}

export { default as Execute } from "./cmd/execute.ts";

export function give(selector: Selector, stack: Item | ItemStack): string {
  if (stack instanceof Item) {
    return `give ${selector} ${stack} 1`;
  } else {
    return `give ${selector} ${stack.item} ${stack.count}`;
  }
}

export function particle(
  particle: Particle,
  pos: Pos = Pos.relative(),
): string {
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

export { scoreboard } from "./cmd/scoreboard.ts";

export function tellraw(selector: Selector, message: IntoText): string {
  const text = Text.from(message);
  return `tellraw ${selector} ${text}`;
}
