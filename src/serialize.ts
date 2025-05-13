import { mapEntries } from "./util.ts";

export type JSONPrimative =
  | string
  | number
  | boolean
  | null
  | undefined;
export interface JSONObject {
  [member: string]: JSONValue;
}
export type JSONValue =
  | JSONPrimative
  | JSONObject
  | JSONValue[];

export interface Serialize {
  serialize(): JSONValue;
}

type Serializable = JSONValue | { [member: string]: Serializable } | Serialize;
export function serialize(value: Serializable): JSONValue {
  if (
    value == null ||
    typeof value === "string" || typeof value === "number" ||
    typeof value === "boolean"
  ) {
    return value;
  } else if (Array.isArray(value)) {
    return value.map(serialize);
  } else if (typeof value === "object") {
    if (typeof value?.serialize === "function") {
      return value.serialize();
    } else {
      return mapEntries(value, (_, value) => serialize(<JSONValue> value));
    }
  } else {
    throw new TypeError(`Can't serialize ${value}.`);
  }
}
