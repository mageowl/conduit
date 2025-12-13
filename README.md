# <img src="./logo.png" height=40/>

_Supported Minecraft versions: 1.21.5-11_ 

Make Minecraft packs using TypeScript!

```typescript
import * as conduit from "conduit";
const { tellraw, Selector } = conduit.cmd;

const pack = new conduit.Datapack({
  description: "Test datapack",
  dependencies: {
    minecraft: "1.21.5",
  },
});

const namespace = pack.namespace("test");
namespace.add(
  "hello_world",
  new conduit.Function([
    tellraw(Selector.players(), "Hello World!"),
  ]),
);

await pack.save("./example_out/basic/");
```

[More Examples](./example)

## Features

Conduit is still in development. All unimported features can be replaced with [workarounds](#Workarounds)

- [x] Data packs
  - [x] Functions
    - [x] Some commands
    - [x] Macros
  - [x] Advancements
  - [x] Recipes
  - [x] Predicates
  - [x] Item modifiers
  - [x] Tags
  - [ ] Banner patterns
  - [ ] Damage types
  - [x] Enchantments
  - [x] Loot tables
- [x] Resource packs
  - [x] Fonts
  - [x] Item models
  - [ ] Block models
- [x] Item components

## Workarounds

For unimplemented commands, use strings.

```typescript
namespace.add(
  "hello_world",
  new conduit.Function([
    "say hello world!"
  ])
);
```

For unimplemented resource types, use `conduit.Include`.

```typescript
// The path is relative to wherever the program is run from -- usually the root of the project directory.
// Make sure to include the "type" directory (e.g. textures or function), but not the file extension (e.g. .png)
namespace.add("textures/item/my_item", new conduit.Include("./src/my_item.png"));
```
