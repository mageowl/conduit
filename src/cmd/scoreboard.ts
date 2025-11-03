import { type Macro, macro } from "../member.ts";
import Function from "../member/function.ts";
import buildCommand from "./builder.ts";
import type Selector from "./selector.ts";
import type { Text } from "./text.ts";
import type { Formatting } from "./types.ts";

interface ScoreboardCommand {
  players: {
    set(
      target: Selector | string | "*",
      objective: string,
      score: number,
    ): string;
    add(
      target: Selector | string | "*",
      objective: string,
      score: number,
    ): string;
    remove(
      target: Selector | string | "*",
      objective: string,
      score: number,
    ): string;
    get(
      target: Selector | string | "*",
      objective: string,
    ): string;
    reset(target: Selector | string | "*", objective: string): string;
    operation(
      target: Selector | string | "*",
      targetObjective: string,
      operation: ScoreOperation,
      source: Selector | string | "*",
      sourceObjective: string,
    ): string;
    enable(target: Selector, objective: string): string;
  };
  objectives: {
    /** You should consider using `conduit.scoreObjective` to run this command on load. */
    add(
      name: string,
      criteria?: Criteria,
      displayName?: Text,
    ): string;

    list(): string;

    remove(name: string): string;

    setdisplay(slot: string, objective?: string): string;
    modify: typeof modify;
  };
}

type Criteria = "dummy" | "trigger";

type ScoreOperation = "=" | "+=" | "-=" | "*=" | "/=" | "%=" | "><" | "<" | ">";

export const scoreObjective: (
  criteria?: Criteria,
  displayName?: Text,
) => Macro<"data", string> = macro(
  (criteria = "dummy", displayName?: Text) => (namespace, name) => {
    const fullName = `${namespace.name}.${name.replaceAll("/", ".")}`;
    namespace.appendOrCreate(
      "load",
      new Function([
        scoreboard.objectives.add(
          fullName,
          criteria,
          displayName,
        ),
      ]),
    );
    return fullName;
  },
);

function modify(
  objective: string,
  property: "displayautoupdate",
  value: boolean,
): string;
function modify(
  objective: string,
  property: "displayname",
  value: Text,
): string;
function modify(objective: string, property: "numberformat"): string;
function modify(
  objective: string,
  property: "numberformat",
  value: "blank",
): string;
function modify(
  objective: string,
  property: "numberformat",
  value: "fixed",
  component: Text,
): string;
function modify(
  objective: string,
  property: "numberformat",
  value: "styled",
  style: Formatting,
): string;
function modify(
  objective: string,
  property: "rendertype",
  value: "hearts" | "integer",
): string;
function modify(
  objective: string,
  property: string,
  value?: { toString(): string },
  component?: { toString(): string },
): string {
  return buildCommand(objective, property, value, component);
}

export const scoreboard: ScoreboardCommand = {
  players: {
    // TODO: Add objective type
    set(
      target: Selector | string | "*",
      objective: string,
      score: number,
    ): string {
      return `scoreboard players set ${target} ${objective} ${score}`;
    },
    add(
      target: Selector | string | "*",
      objective: string,
      score: number,
    ): string {
      return `scoreboard players add ${target} ${objective} ${score}`;
    },
    remove(
      target: Selector | string | "*",
      objective: string,
      score: number,
    ): string {
      return `scoreboard players remove ${target} ${objective} ${score}`;
    },
    get(
      target: Selector | string | "*",
      objective: string,
    ): string {
      return `scoreboard players get ${target} ${objective}`;
    },
    reset(target: Selector | string | "*", objective: string): string {
      return `scoreboard players reset ${target} ${objective}`;
    },
    operation(
      target: Selector | string | "*",
      targetObjective: string,
      operation: ScoreOperation,
      source: Selector | string | "*",
      sourceObjective: string,
    ): string {
      return `scoreboard players operation ${target} ${targetObjective} ${operation} ${source} ${sourceObjective}`;
    },
    enable(target: Selector, objective: string): string {
      return `scoreboard players enable ${target} ${objective}`;
    },
  },
  objectives: {
    /** You should consider using `conduit.scoreObjective` to run this command on load. */
    add(
      name: string,
      criteria: Criteria = "dummy",
      displayName?: Text,
    ): string {
      return buildCommand(
        "scoreboard",
        "objectives",
        "add",
        name,
        criteria,
        displayName,
      );
    },

    list() {
      return "scoreboard objectives list";
    },

    remove(name: string) {
      return `scoreboard objectives remove ${name}`;
    },

    setdisplay(slot: string, objective?: string): string {
      return buildCommand(
        "scoreboard",
        "objectives",
        "setdisplay",
        slot,
        objective,
      );
    },
    modify,
  },
};
