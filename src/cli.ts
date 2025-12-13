import type Datapack from "./datapack.ts";
import { error, log } from "./util.ts";
import type { Version } from "./pack.ts";
import ZippedOutput from "./output/zip.ts";
import DirectoryOutput from "./output/directory.ts";
import Output from "./output.ts";
import { basename, dirname, join as joinPath } from "@std/path";
import { parseArgs } from "@std/cli";
import { exists } from "@std/fs";

interface BuildConfig {
  datapack?: Datapack;
  resourcepack?: Datapack;
  outDir?: string;
}

export default async function build(
  { datapack, resourcepack, outDir }: BuildConfig,
) {
  const args = parseArgs(Deno.args, {
    boolean: ["Z", "zip"],
    string: ["link-to"],
  });
  const shouldZip = args.zip || args.Z;

  const output = outDir ?? "./out";
  await Deno.mkdir(output, { recursive: true });

  const name = datapack?.package?.name ?? dirname(Deno.cwd());
  const version: Version | undefined = datapack?.package?.version;
  const versionString = version ? "-" + version : "";

  const outputs: { [id: string]: Output } = {};

  if (shouldZip) {
    outputs.data = new ZippedOutput(
      joinPath(output, `/${name}-data${versionString}.zip`),
    );
    outputs.assets = new ZippedOutput(
      joinPath(
        output,
        `/${name}-assets${versionString}.zip`,
      ),
    );
  } else {
    outputs.data = new DirectoryOutput(joinPath(output, "/datapack"));
    outputs.assets = new DirectoryOutput(joinPath(output, "/resourcepack"));
  }

  if (datapack != null) {
    log("Building datapack...");
    datapack.save(outputs.data);
    console.log("Done!");
  }
  if (resourcepack != null) {
    log("Building resourcepack...");
    resourcepack.save(outputs.assets);
    console.log("Done!");
  }

  if (args["link-to"] && datapack) {
    log("Linking datapack into save...");

    const mcDir = Deno.env.get("CONDUIT_MCDIR");
    if (mcDir == null) {
      error(
        "Minecraft directory not specified. Set the 'CONDUIT_MCDIR' to the path to your .minecraft directory.",
      );
    }

    const save = joinPath(mcDir, "saves", args["link-to"], "datapacks");
    if (!await exists(save, { isDirectory: true })) {
      error(`Save '${args["link-to"]}' not found.`);
    }

    await Deno.symlink(
      joinPath(Deno.cwd(), outputs.data.savePath),
      joinPath(save, `${name}${versionString}${shouldZip ? ".zip" : ""}`),
    );

    console.log("Done!");
  }
}
