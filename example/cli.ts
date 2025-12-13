import * as conduit from "@mageowl/conduit";

const datapack = new conduit.Datapack({
  package: {
    name: "cli-example",
    version: "0.1",
  },
  description: "Test for conduit CLI.",
  minecraft: "1.21.11",
});

conduit.build({
  datapack,
  outDir: "./example_out/cli/",
});
