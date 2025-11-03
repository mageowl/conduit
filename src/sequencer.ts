import { error } from "./util.ts";

type SequenceGraph<T> = {
  [Name in keyof T]: Node<T, T[Name]>;
};

type Node<T, N> = N | ((inputs: Readonly<T>) => N);

export default function sequenceGraph<T>(
  graph: SequenceGraph<T>,
): Readonly<T> {
  const partial: Partial<T> = {};
  const uninitialized = Object.keys(graph) as (keyof T)[];

  // deno-lint-ignore prefer-const
  let proxy: Readonly<T>;

  const init = (k: keyof T) => {
    const v = typeof graph[k] === "function" ? graph[k](proxy) : graph[k];
    partial[k] = v;
    return v;
  };
  const get = (k: keyof T) => {
    if (Object.hasOwn(partial, k)) {
      return partial[k];
    } else {
      const idx = uninitialized.indexOf(k);
      if (idx === -1) {
        error("invalid sequence graph: circular dependencies");
      }
      uninitialized.splice(idx, 1);

      return init(k);
    }
  };

  proxy = new Proxy({}, {
    get(_, key) {
      if (Object.hasOwn(graph, key)) {
        return get(key as keyof T);
      } else {
        return undefined;
      }
    },
  }) as Readonly<T>;

  while (uninitialized.length > 0) {
    init(uninitialized.pop()!);
  }

  return proxy;
}
