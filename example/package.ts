import * as conduit from "@mageowl/conduit";
const { tellraw, Selector } = conduit.cmd;

const testPackage: conduit.Package = {
  name: "test_package",
  version: "1.0",
};
export default testPackage;

const pack = new conduit.Datapack({
  package: testPackage,
  description: "Test package",
  minecraft: "1.21.5",
});

const namespace = pack.namespace("test_package");
export const helloWorld = namespace.add(
  "hello_world",
  new conduit.Function([
    tellraw(Selector.players(), "Hello World!"),
  ]),
);

await pack.save("./example_out/package/");
