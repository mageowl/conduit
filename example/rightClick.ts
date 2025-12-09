import * as conduit from "@mageowl/conduit";
const { Selector, Pos, give, tellraw, particle, Execute } = conduit.cmd;

if (import.meta.main) {
  const pack = new conduit.Datapack({
    description: "Test datapack",
    minecraft: "1.21.5",
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
    conduit.rightClickHandler(
      { custom_data: rightClickWand.components.custom_data },
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
