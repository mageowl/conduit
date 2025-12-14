import { Identifier } from "../member.ts";
import Function from "../member/function.ts";
import Predicate from "../member/predicate.ts";
import { Pos, type Rot } from "./pos.ts";
import type Selector from "./selector.ts";

export type Axes = `${"x" | ""}${"y" | ""}${"z" | ""}`;
export type ExecuteRelation =
  | "attacker"
  | "controller"
  | "leasher"
  | "origin"
  | "owner"
  | "passengers"
  | "target"
  | "vehicle";
type ExecuteHeightMap =
  | "world_surface"
  | "motion_blocking"
  | "motion_blocking_no_leaves"
  | "ocean_floor";

export default class Execute {
  instructions: string[] = [];

  align(axes: Axes): this {
    this.instructions.push(`align ${axes}`);
    return this;
  }
  static align(axes: Axes): Execute {
    return new Execute().align(axes);
  }

  anchored(anchor: "eyes" | "feet"): this {
    this.instructions.push(`anchored ${anchor}`);
    return this;
  }
  static anchored(anchor: "eyes" | "feet"): Execute {
    return new Execute().anchored(anchor);
  }

  as(selector: Selector): this {
    this.instructions.push(`as ${selector}`);
    return this;
  }
  static as(selector: Selector): Execute {
    return new Execute().as(selector);
  }

  at(selector: Selector): this {
    this.instructions.push(`at ${selector}`);
    return this;
  }
  static at(selector: Selector): Execute {
    return new Execute().at(selector);
  }

  facing(target: Selector, anchor: "eyes" | "feet"): this;
  facing(target: Pos): this;
  facing(target: Selector | Pos, anchor?: "eyes" | "feet"): this {
    this.instructions.push(
      target instanceof Pos
        ? `facing ${target}`
        : `facing entity ${target} ${anchor}`,
    );
    return this;
  }
  static facing(target: Selector, anchor: "eyes" | "feet"): Execute;
  static facing(target: Pos): Execute;
  static facing(target: Selector | Pos, anchor?: "eyes" | "feet"): Execute {
    const self = new Execute();
    self.instructions.push(
      target instanceof Pos
        ? `facing ${target}`
        : `facing entity ${target} ${anchor}`,
    );
    return self;
  }

  in(dimension: string): this {
    this.instructions.push(`in ${dimension}`);
    return this;
  }
  static in(dimension: string): Execute {
    return new Execute().in(dimension);
  }

  on(relation: ExecuteRelation): this {
    this.instructions.push(`on ${relation}`);
    return this;
  }
  static on(relation: ExecuteRelation): Execute {
    return new Execute().on(relation);
  }

  positioned(pos: Pos): this {
    this.instructions.push(`positioned ${pos}`);
    return this;
  }
  static positioned(pos: Pos): Execute {
    return new Execute().positioned(pos);
  }

  positionedAs(selector: Selector): this {
    this.instructions.push(`postioned as ${selector}`);
    return this;
  }
  static positionedAs(selector: Selector): Execute {
    return new Execute().positionedAs(selector);
  }

  positionedOver(
    heightMap: ExecuteHeightMap,
  ): this {
    this.instructions.push(`positioned over ${heightMap}`);
    return this;
  }
  static positionedOver(
    heightMap: ExecuteHeightMap,
  ): Execute {
    return new Execute().positionedOver(heightMap);
  }

  rotated(rotation: Rot): this {
    this.instructions.push(`rotated ${rotation}`);
    return this;
  }
  static rotated(rotation: Rot): Execute {
    return new Execute().rotated(rotation);
  }

  rotatedAs(selector: Selector): this {
    this.instructions.push(`rotated as ${selector}`);
    return this;
  }
  static rotatedAs(selector: Selector): Execute {
    return new Execute().rotatedAs(selector);
  }

  store(value: ExecuteStoreValue): ExecuteStore {
    return new ExecuteStore(this, value);
  }
  static store(value: ExecuteStoreValue): ExecuteStore {
    return new ExecuteStore(new Execute(), value);
  }

  summon(entity: string): this {
    this.instructions.push(`summon ${entity}`);
    return this;
  }
  static summon(entity: string): Execute {
    return new Execute().summon(entity);
  }

  get if(): ExecuteCondition {
    return new ExecuteCondition(this, false);
  }
  static get if(): ExecuteCondition {
    return new ExecuteCondition(new Execute(), false);
  }
  get unless(): ExecuteCondition {
    return new ExecuteCondition(this, true);
  }
  static get unless(): ExecuteCondition {
    return new ExecuteCondition(new Execute(), true);
  }

  run(command: string | string[]): string {
    if (Array.isArray(command)) {
      return command.map((c) =>
        `execute ${this.instructions.join(" ")} run ${c}`
      ).join("\n");
    } else {
      return `execute ${this.instructions.join(" ")} run ${command}`;
    }
  }

  finish(): string {
    return `execute ${this.instructions.join(" ")}`;
  }
}

type ExecuteStoreValue = "result" | "success";
type ExecuteStoreType = "byte" | "short" | "int" | "long" | "float" | "double";
export class ExecuteStore {
  private parent: Execute;
  value: ExecuteStoreValue;

  constructor(parent: Execute, value: ExecuteStoreValue) {
    this.parent = parent;
    this.value = value;
  }

  block(
    pos: Pos,
    path: string,
    type: ExecuteStoreType,
    scale: number = 1,
  ): Execute {
    this.parent.instructions.push(
      `store ${this.value} block ${pos} ${path} ${type} ${scale}`,
    );
    return this.parent;
  }
  bossbar(id: string, property: "max" | "value"): Execute {
    this.parent.instructions.push(
      `store ${this.value} bossbar ${id} ${property}`,
    );
    return this.parent;
  }
  entity(
    selector: Selector,
    path: string,
    type: ExecuteStoreType,
    scale: number = 1,
  ): Execute {
    this.parent.instructions.push(
      `store ${this.value} entity ${selector} ${path} ${type} ${scale}`,
    );
    return this.parent;
  }
  score(target: Selector | string | "*", objective: string): Execute {
    this.parent.instructions.push(
      `store ${this.value} score ${target} ${objective}`,
    );
    return this.parent;
  }
  storage(
    target: string,
    path: string,
    type: ExecuteStoreType,
    scale: number = 1,
  ): Execute {
    this.parent.instructions.push(
      `store ${this.value} storage ${target} ${path} ${type} ${scale}`,
    );
    return this.parent;
  }
}

type ExecuteIfCompareMode = "<" | "<=" | "=" | ">=" | ">";

export class ExecuteCondition {
  private parent: Execute;
  invert: boolean;

  constructor(parent: Execute, invert: boolean) {
    this.parent = parent;
    this.invert = invert;
  }

  get mode(): "if" | "unless" {
    return this.invert ? "unless" : "if";
  }

  biome(pos: Pos, biome: string): Execute {
    this.parent.instructions.push(`${this.mode} biome ${pos} ${biome}`);
    return this.parent;
  }

  block(pos: Pos, blockState: string): Execute {
    this.parent.instructions.push(`${this.mode} block ${pos} ${blockState}`);
    return this.parent;
  }

  blocks(
    sourceStart: Pos,
    sourceEnd: Pos,
    destination: Pos,
    ignoreAir = false,
  ): Execute {
    this.parent.instructions.push(
      `${this.mode} blocks ${sourceStart} ${sourceEnd} ${destination} ${
        ignoreAir ? "masked" : "all"
      }`,
    );
    return this.parent;
  }

  blockData(pos: Pos, path: string): Execute {
    this.parent.instructions.push(`${this.mode} data block ${pos} ${path}`);
    return this.parent;
  }
  entityData(selector: Selector, path: string): Execute {
    this.parent.instructions.push(
      `${this.mode} data entity ${selector} ${path}`,
    );
    return this.parent;
  }
  storageData(id: string, path: string): Execute {
    this.parent.instructions.push(`${this.mode} data storage ${id} ${path}`);
    return this.parent;
  }

  inDimension(id: string): Execute {
    this.parent.instructions.push(`${this.mode} dimension ${id}`);
    return this.parent;
  }

  entity(selector: Selector): Execute {
    this.parent.instructions.push(`${this.mode} entity ${selector}`);
    return this.parent;
  }

  mcFunction(id: Identifier<Function>): Execute {
    this.parent.instructions.push(`${this.mode} function ${id}`);
    return this.parent;
  }

  // TODO: Custom predicate type
  items(source: Pos | Selector, slot: string, predicate: string): Execute {
    this.parent.instructions.push(
      `${this.mode} items ${
        source instanceof Pos ? "block" : "entity"
      } ${source} ${slot} ${predicate}`,
    );
    return this.parent;
  }

  chunkLoaded(pos: Pos): Execute {
    this.parent.instructions.push(`${this.mode} loaded ${pos}`);
    return this.parent;
  }

  predicate(id: Identifier<Predicate>): Execute {
    this.parent.instructions.push(`${this.mode} predicate ${id}`);
    return this.parent;
  }

  score(
    target: Selector | string,
    objective: string,
    mode: "=",
    min: number,
    max: number,
  ): Execute;
  score(
    target: Selector | string,
    objective: string,
    mode: ExecuteIfCompareMode,
    value: number,
  ): Execute;
  score(
    target: Selector | string,
    objective: string,
    mode: ExecuteIfCompareMode,
    sourceTarget: Selector | string,
    sourceObjective: string,
  ): Execute;
  score(
    target: Selector | string,
    objective: string,
    mode: ExecuteIfCompareMode,
    spec1?: number | string | Selector,
    spec2?: number | string,
  ): Execute {
    let spec: string;
    if (typeof spec1 === "number" && typeof spec2 === "number") {
      const min = spec1, max = spec2;
      spec = `matches ${min}..${max}`;
    } else if (typeof spec1 === "number") {
      if (mode === ">") {
        spec = `matches ${spec1 + 1}..`;
      } else if (mode === "<") {
        spec = `matches ..${spec1 - 1}`;
      } else if (mode === ">=") {
        spec = `matches ${spec1}..`;
      } else if (mode === "<=") {
        spec = `matches ..${spec1}`;
      } else {
        spec = `matches ${spec1}`;
      }
    } else {
      spec = `${mode} ${spec1} ${spec2}`;
    }

    this.parent.instructions.push(
      `${this.mode} score ${target} ${objective} ${spec}`,
    );
    return this.parent;
  }
}
