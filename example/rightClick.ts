import * as conduit from "../src/main.ts";
const { Selector, Pos, give, advancement, tellraw, particle } = conduit.cmd;

export default function onRightClick(
  item: conduit.ItemStack,
  callback: conduit.Function,
): conduit.Macro {
  return (name, namespace) => {
    if (item.components.consumable == null) {
      conduit.warning(
        `The right click handler "${namespace}:${name}" will not work because the item does not have a consumable component`,
      );
    }

    callback.body.unshift(
      advancement.revoke.only(
        Selector.self(),
        `${namespace}:on_right_click/${name}`,
      ),
    );
    namespace.add(`on_right_click/${name}`, callback);

    const predicate: conduit.NBTObject = {};
    if (item.components.custom_data?.custom_id != null) {
      predicate.predicates = {
        custom_data: { custom_id: item.components.custom_data.custom_id },
      };
    } else {
      predicate.components = item.components;
    }

    namespace.add(
      `on_right_click/${name}`,
      new conduit.Advancement({
        criteria: {
          right_click: {
            trigger: "using_item",
            conditions: {
              item: predicate,
            },
          },
        },
        rewards: {
          function: `${namespace}:on_right_click/${name}`,
        },
      }),
    );
  };
}

if (import.meta.main) {
  const pack = new conduit.Datapack({
    minecraftVersion: "1.21.5",
    description: "Test datapack",
  });

  const namespace = pack.namespace("right_click");
  const rightClickWand = new conduit.ItemStack({
    id: "stick",
    components: {
      custom_data: {
        custom_id: `${namespace}:wand`,
      },
      consumable: {
        consume_seconds: 999999,
      },
    },
  });

  namespace.add(
    "give_wand",
    new conduit.Function([
      give(Selector.self(), rightClickWand),
    ]),
  );

  namespace.add(
    "wand",
    onRightClick(
      rightClickWand,
      new conduit.Function([
        tellraw(Selector.self(), "Poof!"),
        particle({
          id: "dust",
          color: [0.9, 0.7, 1.0],
          scale: 1,
        }, Pos.rotLocal(0, 0, 1)),
      ]),
    ),
  );

  namespace.add(
    "wand",
    new conduit.Recipe({
      type: "crafting_shaped",
      pattern: [
        "  A",
        " A ",
        "A  ",
      ],
      key: {
        A: "resin_clump",
      },
      result: rightClickWand.toJSON(),
    }),
  );

  await pack.save("./example_out/rightClick/");
}
