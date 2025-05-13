import * as conduit from "@mageowl/conduit";
const { Selector, Pos, give, advancement, tellraw, particle, Execute } =
  conduit.cmd;

const rightClickHandler = conduit.macro(function (
  item: conduit.Item,
  callback: conduit.Function,
) {
  return (namespace, name) => {
    if (item.components.consumable == null) {
      conduit.warning(
        `The right click handler "${namespace}:${name}" will not work because the item does not have a consumable component`,
      );
    }

    const callbackId = namespace.reserve(
      `on_right_click/${name}`,
      conduit.Function,
    );

    const predicate: conduit.JSONObject = {};
    if (item.components.custom_data?.custom_id != null) {
      predicate.predicates = {
        custom_data: { custom_id: item.components.custom_data.custom_id },
      };
    } else {
      predicate.components = item.components;
    }
    const trigger = namespace.add(
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
          function: callbackId,
        },
      }),
    );

    callback.body.unshift(
      advancement.revoke.only(
        Selector.self(),
        trigger,
      ),
    );
    namespace.initialize(callbackId, callback);
  };
});

if (import.meta.main) {
  const pack = new conduit.Datapack({
    minecraftVersion: "1.21.5",
    description: "Test datapack",
  });

  const namespace = pack.namespace("right_click");
  const rightClickWand = new conduit.Item({
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
    rightClickHandler(
      rightClickWand,
      new conduit.Function([
        tellraw(Selector.self(), "Poof!"),
        Execute.anchored("eyes").run(particle({
          id: "dust",
          color: [0.9, 0.7, 1.0],
          scale: 1,
        }, Pos.rotLocal(0, 0, 1))),
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
      result: rightClickWand,
    }),
  );

  await pack.save("./example_out/rightClick/");
}
