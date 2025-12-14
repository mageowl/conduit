import type { Particle } from "./cmd/particle.ts";
import Selector from "./cmd/selector.ts";
import Item from "./item.ts";
import type Advancement from "./member/advancement.ts";
import type Function from "./member/function.ts";
import type { Identifier } from "./member.ts";
import { type IntoText, Text } from "./text.ts";
import { Pos, type Rot } from "./cmd/pos.ts";
import type { ItemStack } from "./item.ts";
import { type Serializable, serialize } from "./serialize.ts";
import { DataSource } from "./cmd/data.ts";
import type { DialogDefinition, Time } from "./types.ts";
import type { SimpleParticleId } from "./cmd/types.ts";
import buildCommand from "./cmd/builder.ts";
import type LootTable from "./member/lootTable.ts";
import type Dialog from "./member/dialog.ts";

export { default as Selector } from "./cmd/selector.ts";
export { Pos, Rot } from "./cmd/pos.ts";
export * from "./cmd/types.ts";

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

export function call(func: Identifier<Function>): string;
export function call<A extends { [name: string]: string }>(
  func: Identifier<Function<A>>,
  args: A | DataSource,
): string;
export function call<A extends { [name: string]: string }>(
  func: Identifier<Function<A>>,
  args?: A | DataSource,
): string {
  if (args instanceof DataSource) {
    return `function ${func} with ${args}${
      args.path !== "" ? ` ${args.path}` : ""
    }`;
  } else if (args != null) {
    return `function ${func} ${JSON.stringify(args)}`;
  } else {
    return `function ${func}`;
  }
}

export function clear(
  player: Selector,
  predicate?: string,
  max_count?: number,
): string {
  return buildCommand("clear", player, predicate, max_count);
}

export function damage(target: Selector, amount: number, type?: string): string;
export function damage(
  target: Selector,
  amount: number,
  type: string,
  attacker: Selector,
): string;
export function damage(
  target: Selector,
  amount: number,
  type: string,
  vessel: Selector,
  attacker: Selector,
): string;
export function damage(
  target: Selector,
  amount: number,
  type?: string,
  by?: Selector,
  from?: Selector,
): string {
  return `damage ${target} ${amount}${type ? ` ${type}` : ""}${
    by ? ` by ${by}` : ""
  }${from ? ` from ${from}` : ""}`;
}

export { DataSource, default as data } from "./cmd/data.ts";

export function dialog(target: Selector): {
  clear(): string;
  show(dialog: Identifier<Dialog> | DialogDefinition): string;
} {
  return {
    clear() {
      return `dialog clear ${target}`;
    },
    show(dialog) {
      return `dialog show ${target} ${dialog}`;
    },
  };
}

export function effect(target: Selector): {
  clear(effect?: string): string;
  give(
    effect: string,
    seconds?: number | "infinite",
    amplifier?: number,
    hideParticles?: boolean,
  ): string;
} {
  return {
    clear(effect?: string) {
      return `effect clear ${target}${effect ? " " + effect : ""}`;
    },
    give(effect, seconds, amplifier, hideParticles) {
      return `effect give ${target} ${effect}${seconds ? " " + seconds : ""}${
        amplifier ? " " + amplifier : ""
      }${hideParticles ? " " + hideParticles : ""}`;
    },
  };
}

export { default as Execute } from "./cmd/execute.ts";

type FillMode = "outline" | "hollow" | "destroy" | "strict";
export function fill(
  from: Pos,
  to: Pos,
  block: string,
  mode?: FillMode | "replace" | "keep",
): string;
export function fill(
  from: Pos,
  to: Pos,
  block: string,
  mode: "replace",
  filter: string,
  mode2?: FillMode,
): string;
export function fill(
  from: Pos,
  to: Pos,
  block: string,
  mode?: string,
  filter?: string,
  mode2?: string,
): string {
  return buildCommand("fill", from, to, block, mode, filter, mode2);
}

export function gamemode(
  gamemode: "survival" | "creative" | "spectator" | "adventure",
  selector: Selector = Selector.self(),
): string {
  return `gamemode ${gamemode} ${selector}`;
}

export function give(selector: Selector, stack: Item | ItemStack): string {
  if (stack instanceof Item) {
    return `give ${selector} ${stack} 1`;
  } else {
    return `give ${selector} ${stack.item} ${stack.count}`;
  }
}

export { default as item } from "./cmd/item.ts";

export function kill(selector: Selector = Selector.self()): string {
  return `kill ${selector}`;
}

type LootTarget = {
  fish(
    lootTable: Identifier<LootTable>,
    pos: Pos,
    tool: "mainhand" | "offhand" | Item,
  ): string;
  loot(lootTable: Identifier<LootTable>): string;
  kill(target: Selector): string;
  mine(pos: Pos, tool: "mainhand" | "offhand" | Item): string;
};

function buildLootTarget(
  ...args: (string | { toString(): string } | null | undefined)[]
): LootTarget {
  return {
    fish(
      lootTable: Identifier<LootTable>,
      pos: Pos,
      tool: "mainhand" | "offhand" | Item,
    ) {
      return buildCommand("loot", ...args, "fish", lootTable, pos, tool);
    },
    loot(lootTable: Identifier<LootTable>) {
      return buildCommand("loot", ...args, "loot", lootTable);
    },
    kill(target: Selector) {
      return buildCommand("loot", ...args, "kill", target);
    },
    mine(pos: Pos, tool: "mainhand" | "offhand" | Item) {
      return buildCommand("loot", ...args, "mine", pos, tool);
    },
  };
}
export const loot: {
  give(players: Selector): LootTarget;
  insert(pos: Pos): LootTarget;
  spawn(pos: Pos): LootTarget;
  replace(target: Pos | Selector, slot: string, count?: number): LootTarget;
} = {
  give(players: Selector): LootTarget {
    return buildLootTarget("give", players);
  },
  insert(pos: Pos): LootTarget {
    return buildLootTarget("insert", pos);
  },
  spawn(pos: Pos): LootTarget {
    return buildLootTarget("spawn", pos);
  },
  replace(target: Pos | Selector, slot: string, count?: number) {
    return buildLootTarget(
      "replace",
      target instanceof Selector ? "entity" : "block",
      target,
      slot,
      count,
    );
  },
};

export function particle(
  particle: Particle | SimpleParticleId,
  pos: Pos = Pos.relative(),
  delta?: Pos,
  speed: number = 0,
  count: number = 0,
  mode?: "force" | "normal",
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

  if (delta == null) {
    return `particle ${particleString} ${pos}`;
  } else {
    return `particle ${particleString} ${pos} ${delta} ${speed} ${count} ${
      mode ?? ""
    }`;
  }
}

type SoundChannel =
  | "ambient"
  | "block"
  | "hostile"
  | "master"
  | "music"
  | "neutral"
  | "player"
  | "record"
  | "voice"
  | "weather";
// TODO: Ensure selector is only players
export function playsound(
  name: string,
  channel: SoundChannel,
  players: Selector,
  pos?: Pos,
  volume?: number,
  pitch?: number,
): string {
  let string = `playsound ${name} ${channel} ${players}`;

  if (pos != null) {
    string += ` ${pos}`;
  } else return string;
  if (volume != null) {
    string += ` ${volume}`;
  } else return string;
  if (pitch != null) {
    string += ` ${pitch}`;
  } else return string;

  return string;
}

export const mcReturn: {
  succeed(code: number): string;
  fail(): string;
  run(command: string): string;
} = {
  succeed(code: number) {
    return `return ${code}`;
  },
  fail() {
    return `return fail`;
  },
  run(command: string) {
    return `return run ${command}`;
  },
};

export function rotate(selector: Selector, rotation: Rot): string {
  return `rotate ${selector} ${rotation}`;
}
export function rotateFacing(
  selector: Selector,
  target: Pos | Selector,
): string {
  return `rotate ${selector} facing ${
    target instanceof Selector ? `entity ${target}` : target
  }`;
}

export const schedule: {
  add(
    fn: Identifier<Function>,
    delay: Time,
    mode?: "append" | "replace",
  ): string;
  clear(fn: Identifier<Function>): string;
} = {
  add(fn: Identifier<Function>, delay: Time, mode?: "append" | "replace") {
    return mode
      ? `schedule function ${fn} ${delay} ${mode}`
      : `schedule function ${fn} ${delay}`;
  },
  clear(fn: Identifier<Function>) {
    return `schedule clear ${fn}`;
  },
};

export { scoreboard } from "./cmd/scoreboard.ts";

export function setblock(
  pos: Pos,
  blockstate: string,
  mode: "destroy" | "keep" | "strict" | "replace" = "replace",
): string {
  return `setblock ${pos} ${blockstate} ${mode}`;
}

export function summon(entity: string, pos: Pos, nbt?: Serializable): string {
  if (nbt != null) {
    return `summon ${entity} ${pos} ${JSON.stringify(serialize(nbt))}`;
  } else {
    return `summon ${entity} ${pos}`;
  }
}

export function tag(
  selector: Selector,
): { add(name: string): string; remove(name: string): string; list: string } {
  return {
    add(name: string): string {
      return `tag ${selector} add ${name}`;
    },
    remove(name: string): string {
      return `tag ${selector} remove ${name}`;
    },
    list: `tag ${selector} list`,
  };
}

export function teleport(selector: Selector, pos: Pos, rotation: Rot): string {
  return buildCommand("tp", pos, rotation);
}

export function tellraw(selector: Selector, message: IntoText): string {
  const text = Text.from(message);
  return `tellraw ${selector} ${text}`;
}
