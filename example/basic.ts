import * as conduit from "../src/main.ts";
const { cmd } = conduit;

const pack = new conduit.Datapack({
  minecraftVersion: "1.21.5",
  description: "Test datapack",
});

const namespace = pack.namespace("test");
namespace.add(
  "hello_world",
  new conduit.Function([
    cmd.say("Hello World!"),
  ]),
);

await pack.save("./example_out/basic/");
