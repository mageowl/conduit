import Function from "../member/function.ts";
import { macro } from "../member.ts";
import type { JSONObject } from "../serialize.ts";
import Advancement from "../member/advancement.ts";
import { advancement, Selector } from "../cmd.ts";

const rightClickHandler = macro(function (
  predicates: JSONObject,
  callback: Function,
  on_finish: boolean = false,
) {
  return (namespace, name) => {
    // if (item.components.consumable == null) {
    //   warning(
    //     `The right click handler "${namespace}:${name}" will not work because the item does not have a consumable component`,
    //   );
    // }

    const callbackId = namespace.reserve(
      `on_right_click/${name}`,
      Function,
    );

    const trigger = namespace.add(
      `on_right_click/${name}`,
      new Advancement({
        criteria: {
          right_click: {
            trigger: on_finish ? "consume_item" : "using_item",
            conditions: {
              item: { predicates },
            },
          },
        },
        rewards: {
          function: callbackId,
        },
      }),
    );

    callback.body.unshift(
      advancement.revoke.only(
        Selector.self(),
        trigger,
      ),
    );
    namespace.initialize(callbackId, callback);
  };
});

export default rightClickHandler;
