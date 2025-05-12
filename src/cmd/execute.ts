import { Pos, Rot } from "./pos.ts";
import Selector from "./selector.ts";

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

  align(axes: Axes) {
    this.instructions.push(`align ${axes}`);
    return this;
  }
  static align(axes: Axes) {
    return new Execute().align(axes);
  }

  anchored(anchor: "eyes" | "feet") {
    this.instructions.push(`anchored ${anchor}`);
    return this;
  }
  static anchored(anchor: "eyes" | "feet") {
    return new Execute().anchored(anchor);
  }

  as(selector: Selector) {
    this.instructions.push(`as ${selector}`);
    return this;
  }
  static as(selector: Selector) {
    return new Execute().as(selector);
  }

  at(pos: Pos) {
    this.instructions.push(`at ${pos}`);
    return this;
  }
  static at(pos: Pos) {
    return new Execute().at(pos);
  }

  facing(target: Selector, anchor: "eyes" | "feet"): Execute;
  facing(target: Pos): Execute;
  facing(target: Selector | Pos, anchor?: "eyes" | "feet") {
    this.instructions.push(
      target instanceof Pos
        ? `facing ${target}`
        : `facing entity ${target} ${anchor}`,
    );
    return this;
  }
  static facing(target: Selector, anchor: "eyes" | "feet"): Execute;
  static facing(target: Pos): Execute;
  static facing(target: Selector | Pos, anchor?: "eyes" | "feet") {
    const self = new Execute();
    self.instructions.push(
      target instanceof Pos
        ? `facing ${target}`
        : `facing entity ${target} ${anchor}`,
    );
    return self;
  }

  in(dimension: string) {
    this.instructions.push(`in ${dimension}`);
    return this;
  }
  static in(dimension: string) {
    return new Execute().in(dimension);
  }

  on(relation: ExecuteRelation) {
    this.instructions.push(`on ${relation}`);
    return this;
  }
  static on(relation: ExecuteRelation) {
    return new Execute().on(relation);
  }

  positioned(pos: Pos) {
    this.instructions.push(`positioned ${pos}`);
    return this;
  }
  static positioned(pos: Pos) {
    return new Execute().positioned(pos);
  }

  positionedAs(selector: Selector) {
    this.instructions.push(`postioned as ${selector}`);
    return this;
  }
  static positionedAs(selector: Selector) {
    return new Execute().positionedAs(selector);
  }

  positionedOver(
    heightMap: ExecuteHeightMap,
  ) {
    this.instructions.push(`positioned over ${heightMap}`);
  }
  static positionedOver(
    heightMap: ExecuteHeightMap,
  ) {
    return new Execute().positionedOver(heightMap);
  }

  rotated(rotation: Rot) {
    this.instructions.push(`rotated ${rotation}`);
    return this;
  }
  static rotated(rotation: Rot) {
    return new Execute().rotated(rotation);
  }

  rotatedAs(selector: Selector) {
    this.instructions.push(`rotated as ${selector}`);
    return this;
  }
  static rotatedAs(selector: Selector) {
    return new Execute().rotatedAs(selector);
  }

  store(value: ExecuteStoreValue) {
    return new ExecuteStore(this, value);
  }
  static store(value: ExecuteStoreValue) {
    return new ExecuteStore(new Execute(), value);
  }

  summon(entity: string) {
    this.instructions.push(`summon ${entity}`);
    return this;
  }
  static summon(entity: string) {
    return new Execute().summon(entity);
  }

  if() {
    return new ExecuteCondition(this, false);
  }
  static if() {
    return new ExecuteCondition(new Execute(), false);
  }
  unless() {
    return new ExecuteCondition(this, true);
  }
  static unless() {
    return new ExecuteCondition(new Execute(), true);
  }

  run(command: string): string {
    return `execute ${this.instructions.join(" ")} run ${command}`;
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
  ) {
    this.parent.instructions.push(
      `store ${this.value} block ${pos} ${path} ${type} ${scale}`,
    );
    return this.parent;
  }
  bossbar(id: string, property: "max" | "value") {
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
  ) {
    this.parent.instructions.push(
      `store ${this.value} entity ${selector} ${path} ${type} ${scale}`,
    );
  }
  score(target: string | "*", objective: string) {
    this.parent.instructions.push(
      `store ${this.value} score ${target} ${objective}`,
    );
  }
  storage(
    target: string,
    path: string,
    type: ExecuteStoreType,
    scale: number = 1,
  ) {
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

  get mode() {
    return this.invert ? "if" : "unless";
  }

  biome(pos: Pos, biome: string) {
    this.parent.instructions.push(`${this.mode} biome ${pos} ${biome}`);
    return this.parent;
  }

  block(pos: Pos, blockState: string) {
    this.parent.instructions.push(`${this.mode} block ${pos} ${blockState}`);
    return this.parent;
  }

  blocks(
    sourceStart: Pos,
    sourceEnd: Pos,
    destination: Pos,
    ignoreAir = false,
  ) {
    this.parent.instructions.push(
      `${this.mode} blocks ${sourceStart} ${sourceEnd} ${destination} ${
        ignoreAir ? "masked" : "all"
      }`,
    );
    return this.parent;
  }

  blockData(pos: Pos, path: string) {
    this.parent.instructions.push(`${this.mode} data block ${pos} ${path}`);
    return this.parent;
  }
  entityData(selector: Selector, path: string) {
    this.parent.instructions.push(
      `${this.mode} data entity ${selector} ${path}`,
    );
    return this.parent;
  }
  storageData(id: string, path: string) {
    this.parent.instructions.push(`${this.mode} data storage ${id} ${path}`);
    return this.parent;
  }

  inDimension(id: string) {
    this.parent.instructions.push(`${this.mode} dimension ${id}`);
    return this.parent;
  }

  entity(selector: Selector) {
    this.parent.instructions.push(`${this.mode} entity ${selector}`);
    return this.parent;
  }

  mcFunction(id: string) {
    this.parent.instructions.push(`${this.mode} function ${id}`);
    return this.parent;
  }

  // TODO: Custom predicate type
  items(source: Pos | Selector, slot: string, predicate: string) {
    this.parent.instructions.push(
      `${this.mode} items ${source} ${slot} ${predicate}`,
    );
    return this.parent;
  }

  chunkLoaded(pos: Pos) {
    this.parent.instructions.push(`${this.mode} loaded ${pos}`);
    return this.parent;
  }

  // TODO: Inline definition
  predicate(id: string) {
    this.parent.instructions.push(`${this.mode} predicate ${id}`);
    return this.parent;
  }

  score(
    target: string,
    objective: string,
    mode: "=",
    min: number,
    max: number,
  ): Execute;
  score(
    target: string,
    objective: string,
    mode: ExecuteIfCompareMode,
    value: number,
  ): Execute;
  score(
    target: string,
    objective: string,
    mode: ExecuteIfCompareMode,
    sourceTarget: string,
    sourceObjective: string,
  ): Execute;
  score(
    target: string,
    objective: string,
    mode: ExecuteIfCompareMode,
    spec1?: number | string,
    spec2?: number | string,
  ): Execute {
    let spec: string;
    if (typeof spec1 === "number" && typeof spec2 === "number") {
      const min = spec1, max = spec2;
      spec = `matches ${min}..${max}`;
    } else if (typeof spec1 === "number") {
      if (mode === ">") {
        this.invert = !this.invert;
        spec = `matches ..${spec1}`;
      } else if (mode === "<") {
        this.invert = !this.invert;
        spec = `matches ${spec1}..`;
      } else if (mode === ">=") {
        this.invert = !this.invert;
        spec = `matches ${spec1}..`;
      } else if (mode === "<=") {
        this.invert = !this.invert;
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
