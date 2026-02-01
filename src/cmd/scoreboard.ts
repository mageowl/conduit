import { type Macro, macro } from "../member.ts";
import Function from "../member/function.ts";
import buildCommand from "./builder.ts";
import type Selector from "./selector.ts";
import type { Formatting, Text } from "../text.ts";

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

type Criteria =
  | "dummy"
  | "trigger"
  | `minecraft.custom:${CustomCriteria}`
  | `minecraft.${StatisticType}:${string}`;
type StatisticType =
  | "mined"
  | "broken"
  | "crafted"
  | "used"
  | "picked_up"
  | "dropped"
  | "killed"
  | "killed_by";
type CustomCriteria =
  | "use_cauldron"
  | "trigger_trapped_chest"
  | "traded_with_villager"
  | "sleep_in_bed"
  | "total_world_time"
  | "time_since_rest"
  | "time_since_death"
  | "play_time"
  | "target_hit"
  | "talked_to_villager"
  | "sneak_time"
  | "open_shulker_box"
  | "clean_shulker_box"
  | "raid_win"
  | "raid_trigger"
  | "player_kills"
  | "pot_flower"
  | "deaths"
  | "tune_noteblock"
  | "play_noteblock"
  | "play_record"
  | "mob_kills"
  | "jump"
  | "enchant_item"
  | "drop"
  | "interact_with_stonecutter"
  | "interact_with_smoker"
  | "interact_with_smithing_table"
  | "interact_with_loom"
  | "interact_with_lectern"
  | "interact_with_grindstone"
  | "interact_with_furnace"
  | "interact_with_crafting_table"
  | "interact_with_cartography_table"
  | "interact_with_campfire"
  | "interact_with_brewingstand"
  | "interact_with_blast_furnace"
  | "interact_with_beacon"
  | "interact_with_anvil"
  | "inspect_hopper"
  | "leave_game"
  | "fish_caught"
  | "open_enderchest"
  | "inspect_dropper"
  | "walk_under_water_one_cm"
  | "walk_on_water_one_cm"
  | "walk_one_cm"
  | "swim_one_cm"
  | "sprint_one_cm"
  | "fly_one_cm"
  | "fall_one_cm"
  | "crouch_one_cm"
  | "climb_one_cm"
  | "strider_one_cm"
  | "pig_one_cm"
  | "minecart_one_cm"
  | "horse_one_cm"
  | "happy_ghast_one_cm"
  | "aviate_one_cm"
  | "boat_one_cm"
  | "inspect_dispenser"
  | "damage_taken"
  | "damage_resisted"
  | "damage_dealt_resisted"
  | "damage_dealt_absorbed"
  | "damage_dealt"
  | "damage_blocked_by_shield"
  | "damage_absorbed"
  | "open_chest"
  | "fill_cauldron"
  | "eat_cake_slice"
  | "bell_ring"
  | "open_barrel"
  | "clean_banner"
  | "clean_armor"
  | "animals_bred";

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
