import * as conduit from "@mageowl/conduit";
const pack = new conduit.Datapack({
  description: "Test included files",
  minecraft: "1.21.5",
});

const namespace = pack.namespace("test");
namespace.add(
  "loot_table/included_loot",
  new conduit.Include(
    "./example/loot_table.json",
  ),
);

await pack.save("./example_out/include/");
