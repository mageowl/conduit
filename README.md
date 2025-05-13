# <img src="./logo.png" height=40/>
Make Minecraft datapacks using TypeScript!

```typescript
import * as conduit from "conduit";
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
```

[More Examples](./example)

## Features
Conduit is still in development.

- [x] Macros
- [ ] Resource types
  - [x] Functions
    - [ ] All commands (4/~200)
  - [x] Advancements
  - [x] Recipes
  - [ ] Predicates
  - [ ] Item modifiers
  - [ ] Tags
  - [ ] Banner patterns
  - [ ] Damage types
  - [ ] Enchantments
  - [ ] Loot tables
- [ ] Item components (2/70)
