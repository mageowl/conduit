import type { default as Item, ItemStack } from "../item.ts";
import { Identifier } from "../member.ts";
import ItemModifier, {
  ItemModifierDefinition,
} from "../member/itemModifier.ts";
import { serialize } from "../serialize.ts";
import { Pos } from "./pos.ts";
import type Selector from "./selector.ts";

const item: {
  replace(target: Pos | Selector, slot: string): {
    with(item: Item | ItemStack): string;
    from(
      other: Pos | Selector,
      otherSlot: string,
      modifier?: Identifier<ItemModifier> | ItemModifierDefinition,
    ): string;
  };
  modify(
    target: Pos | Selector,
    slot: string,
    modifier: Identifier<ItemModifier> | ItemModifierDefinition,
  ): string;
} = {
  replace(target: Pos | Selector, slot: string) {
    const targetStr = target instanceof Pos
      ? `block ${target}`
      : `entity ${target}`;
    return {
      with(item: Item | ItemStack) {
        return `item replace ${targetStr} ${slot} with ${item}`;
      },
      from(
        other: Pos | Selector,
        otherSlot: string,
        modifier?: Identifier<ItemModifier> | ItemModifierDefinition,
      ) {
        const otherStr = other instanceof Pos
          ? `block ${other}`
          : `entity ${other}`;
        if (modifier instanceof Identifier) {
          return `item replace ${targetStr} ${slot} from ${otherStr} ${otherSlot} ${modifier.toString()}`;
        } else if (modifier != null) {
          return `item replace ${targetStr} ${slot} from ${otherStr} ${otherSlot} ${
            JSON.stringify(serialize(modifier))
          }`;
        } else {
          return `item replace ${targetStr} ${slot} from ${otherStr} ${otherSlot}`;
        }
      },
    };
  },
  modify(
    target: Pos | Selector,
    slot: string,
    modifier: Identifier<ItemModifier> | ItemModifierDefinition,
  ) {
    const targetStr = target instanceof Pos
      ? `block ${target}`
      : `entity ${target}`;
    const modifierStr = modifier instanceof Identifier
      ? modifier.toString()
      : JSON.stringify(serialize(modifier));
    return `item modify ${targetStr} ${slot} ${modifierStr}`;
  },
};

export default item;
