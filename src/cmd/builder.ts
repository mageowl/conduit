const buildCommand = (
  ...args: (string | { toString(): string } | null | undefined)[]
) => args.filter((a) => a != null).join(" ");

export default buildCommand;
