import * as conduit from "@mageowl/conduit";
const pack = new conduit.Datapack({
  description: "Test included files",
  minecraft: "1.21.5",
});

const namespace = pack.namespace("test");
namespace.add(
  "included_loot_table",
  new conduit.Include(
    import.meta.resolve("./loot_table.json"),
    "loot_table",
  ),
);

await pack.save("./example_out/include/");
