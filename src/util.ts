export function error(message: string) {
  console.log(
    `%cerror%c: ${message}`,
    "color:red;font-weight:bold;",
    "color:unset;font-weight:unset;",
  );
}
export function warning(message: string) {
  console.log(
    `%cwarning%c: ${message}`,
    "color:yellow;font-weight:bold;",
    "color:unset;font-weight:unset;",
  );
}
