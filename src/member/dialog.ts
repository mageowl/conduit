import type { IntoText } from "../text.ts";
import type { default as Item, ItemStack } from "../item.ts";
import { type Identifier, JSONMember } from "../member.ts";
import type Namespace from "../namespace.ts";
import { type JSONObject, type JSONValue, serialize } from "../serialize.ts";
import type Tag from "../tag.ts";
import { error } from "../util.ts";

export default class Dialog extends JSONMember<"data"> {
  static override readonly dataFolder = "dialog";

  constructor(public data: DialogDefinition) {
    super();
  }

  override add(namespace: Namespace<"data">, _name: string): void {
    if (typeof namespace.packFormat === "number" && namespace.packFormat < 77) {
      error(
        "Dialogs were added in 25w20a, but an earlier version of Minecraft is being used.",
      );
    }
  }

  override saveJSON(): JSONValue {
    return serialize(this.data);
  }
}

export type DialogDefinition =
  & {
    title: IntoText;
    external_title?: IntoText;
    body?: DialogElement[] | DialogElement;
    inputs?: DialogInput[];
    can_close_with_escape?: boolean;
    pause?: boolean;
    after_action?: "close" | "none" | "wait_for_response";
  }
  & (
    | DialogNoticeDefinition
    | DialogConfirmationDefinition
    | DialogMultiActionDefinition
    | DialogServerLinksDefinition
    | DialogListDefinition
  );

type DialogNoticeDefinition = {
  type: "notice";
  action?: DialogButton;
};
type DialogConfirmationDefinition = {
  type: "confirmation";
  yes: DialogButton;
  no: DialogButton;
};
type DialogMultiActionDefinition = {
  type: "multi_action";
  actions: DialogButton[];
  columns?: number;
  exit_action?: DialogButton;
};
type DialogServerLinksDefinition = {
  type: "server_links";
  columns?: number;
  button_width?: number;
  exit_action?: DialogButton;
};
type DialogListDefinition = {
  type: "dialog_list";
  dialogs:
    | (Identifier<Dialog> | DialogDefinition)[]
    | Identifier<Dialog>
    | DialogDefinition
    | Tag<Dialog>;
  columns?: number;
  button_width?: number;
  exit_action?: DialogButton;
};

export type DialogButton = {
  label: IntoText;
  tooltip?: IntoText;
  width?: number;
  action?: DialogAction;
};

export type DialogElement = DialogPlainTextElement | DialogItemElement;
type DialogPlainTextElement = {
  type: "plain_message";
  contents: IntoText;
  width?: number;
};
type DialogItemElement = {
  type: "item";
  item: ItemStack | Item;
  description?: {
    contents: IntoText;
    width?: number;
  } | IntoText;
  show_decoration?: boolean;
  show_tooltip?: boolean;
  width?: number;
  height?: number;
};

export type DialogInput =
  & {
    key: string;
    label: IntoText;
  }
  & (
    | DialogTextInput
    | DialogBooleanInput
    | DialogSingleOptionInput
    | DialogNumberRangeInput
  );
type DialogTextInput = {
  type: "text";
  width?: number;
  label_visible?: boolean;
  initial?: string;
  max_length?: number;
  multiline?: {
    max_lines?: number;
    height?: number;
  };
};
type DialogBooleanInput = {
  type: "boolean";
  initial?: boolean;
  on_true?: string;
  on_false?: string;
};
type DialogSingleOptionInput = {
  type: "single_option";
  label_visible?: boolean;
  width?: number;
  options: {
    id: string;
    display?: IntoText;
    initial?: boolean;
  }[];
};
type DialogNumberRangeInput = {
  type: "number_range";
  label_format?: string;
  width?: number;
  start: number;
  end: number;
  step?: number;
  initial?: number;
};

export type DialogAction =
  | DialogOpenUrlAction
  | DialogRunCommandAction
  | DialogSuggestCommandAction
  | DialogChangePageAction
  | DialogCopyToClipboardAction
  | DialogShowDialogAction
  | DialogCustomAction
  | DialogDynamicCustomAction
  | DialogDynamicRunCommandAction;
type DialogOpenUrlAction = {
  type: "open_url";
  url: string;
};
type DialogRunCommandAction = {
  type: "run_command";
  command: string;
};
type DialogSuggestCommandAction = {
  type: "suggest_command";
  command: string;
};
type DialogChangePageAction = {
  type: "change_page";
  page: number;
};
type DialogCopyToClipboardAction = {
  type: "copy_to_clipboard";
  value: string;
};
type DialogShowDialogAction = {
  type: "show_dialog";
  dialog: Identifier<Dialog> | DialogDefinition;
};
type DialogCustomAction = {
  type: "custom";
  id: string;
  payload?: string;
};
type DialogDynamicRunCommandAction = {
  type: "dynamic/run_command";
  template: string;
};
type DialogDynamicCustomAction = {
  type: "dynamic/custom";
  id: string;
  additions?: JSONObject;
};
