import * as path from "jsr:@std/path";

interface MemberMap {
  map: Map<string, Member>;
  dataFolder: string;
  fileExtension: string;
}

export default class Namespace {
  private members: Map<string, MemberMap> = new Map();

  add(name: string, member: Member | Macro) {
    if (member instanceof Member) {
      let map;
      if (this.members.has(member.constructor.name)) {
        map = this.members.get(member.constructor.name)!.map;
      } else {
        map = new Map();
        this.members.set(member.constructor.name, {
          map,
          fileExtension: member.fileExtension,
          dataFolder: member.dataFolder,
        });
      }

      if (map.has(name)) {
        throw new Error(`The member '${name}' is already defined.`);
      }
      map.set(name, member);
    } else {
      for (const [k, v] of Object.entries(member(name))) {
        this.add(k, v);
      }
    }
  }

  async save(savePath: string) {
    await Deno.mkdir(savePath);
    await Promise.all(
      this.members.entries().map(
        async ([, { map, dataFolder, fileExtension }]) => {
          const dataPath = path.join(
            savePath,
            dataFolder,
          );
          await Deno.mkdir(dataPath);

          await Promise.all(
            map.entries().map(async ([name, member]) => {
              const filePath = path.join(dataPath, name) +
                `.${fileExtension}`;
              await member.save(filePath);
            }),
          );
        },
      ),
    );
  }
}

export abstract class Member {
  abstract readonly fileExtension: string;
  abstract readonly dataFolder: string;

  abstract save(filePath: string): Promise<void>;
}

export type Macro = (name: string) => { [name: string]: Member | Macro };
