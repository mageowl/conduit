import Selector from "./cmd/selector.ts";
import { IntoText, Text } from "./cmd/text.ts";
import ItemStack from "./item.ts";

export { default as Selector } from "./cmd/selector.ts";
export { Text } from "./cmd/text.ts";
export type * from "./cmd/text.ts";

function advancementSubCommands(action: "grant" | "revoke") {
  const subCommand =
    (target: "from" | "through" | "until") =>
    (selector: Selector, id: string) =>
      `advancement ${action} ${selector} ${target} ${id}`;
  return {
    // TODO: specific criteria
    only(selector: Selector, id: string, criterion?: string) {
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

export function tellraw(selector: Selector, message: IntoText): string {
  const text = Text.from(message);
  return `tellraw ${selector} ${text}`;
}

export function give(selector: Selector, item: ItemStack, count = 1) {
  return `give ${selector} ${item} ${count}`;
}
