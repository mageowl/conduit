export function error(message: string) {
  console.log(
    `%cerror%c: ${message}`,
    "color:red;font-weight:bold;",
    "color:unset;font-weight:unset;",
  );
  Deno.exit(1);
}
export function warning(message: string) {
  console.log(
    `%cwarning%c: ${message}`,
    "color:yellow;font-weight:bold;",
    "color:unset;font-weight:unset;",
  );
}

export function mapEntries<O extends object, R>(
  object: O,
  callback: (key: keyof O, value: O[keyof O]) => R,
): { [Key in keyof O]: R } {
  const out = <{ [Key in keyof O]: R }> {};
  for (const key in object) {
    if (Object.hasOwn(object, key)) {
      out[key] = callback(key, object[key]);
    }
  }
  return out;
}
