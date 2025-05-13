import * as conduit from "@mageowl/conduit";
const { tellraw, Selector } = conduit.cmd;

const pack = new conduit.Datapack({
  minecraftVersion: "1.21.5",
  description: "Test datapack",
});

const namespace = pack.namespace("test");
namespace.add(
  "hello_world",
  new conduit.Function([
    tellraw(Selector.players(), "Hello World!"),
  ]),
);

await pack.save("./example_out/basic/");
