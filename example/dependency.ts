import * as conduit from "@mageowl/conduit";
const { call } = conduit.cmd;
// Because we are importing an Identifier, we also need to add `testPackage` to the dependency list.
// If you import just a macro, you don't need to add it to the dependencies, because macros only
// exist at compile time.
import testPackage, { helloWorld } from "./package.ts";

const pack = new conduit.Datapack({
  package: {
    name: "test_dependency",
    version: "1.0",
    dependencies: [testPackage],
  },
  description: "Example with dependencies.",
  minecraft: "1.21.5",
});

const namespace = pack.namespace("test_dependency");
namespace.add(
  "hello_world_twice",
  new conduit.Function([
    call(helloWorld),
    call(helloWorld),
  ]),
);

pack.save("./example_out/dependency/");
