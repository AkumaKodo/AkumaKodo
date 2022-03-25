import { ButtonComponent, SelectOption } from "../../deps.ts";
import { Button } from "../lib/utils/Components/Button.ts";
import { SelectMenu } from "../lib/utils/Components/SelectMenu.ts";
import { InputText } from "../lib/utils/Components/InputText.ts";

export type ComponentInterfaceOptions = Button | SelectMenu | InputText;
export type ComponentAddableSelectMenuOption = "";
export interface SelectMenuOptionAdd extends Omit<SelectOption, "default"> {
    default?: boolean;
}
export type ComponentEmoji = string | ButtonComponent["emoji"];
