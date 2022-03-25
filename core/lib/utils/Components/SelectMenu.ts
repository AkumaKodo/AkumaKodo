import {
    MessageComponentTypes,
    nanoid,
    SelectMenuComponent,
    SelectOption,
} from "../../../../deps.ts";
import {
    ComponentEmoji,
    SelectMenuOptionAdd,
} from "../../../interfaces/Component.ts";
import { shortenString } from "../helpers.ts";
import { BaseComponent } from "./mod.ts";

export class SelectMenu extends BaseComponent implements SelectMenuComponent {
    public type: MessageComponentTypes.SelectMenu =
        MessageComponentTypes.SelectMenu;
    public customId: string;
    public placeholder?: string;
    public minValues?: number;
    public maxValues?: number;
    public options: SelectOption[] = [];
    public constructor() {
        super("SelectMenu");
        this.customId = nanoid();
    }
    /** A custom placeholder text if nothing is selected. Maximum 100 characters. */
    public setPlaceholder(value: string) {
        this.placeholder = shortenString(value, 100);
        return this;
    }
    public setCustomId(id: string) {
        this.customId = id;
        return this;
    }
    /** Sets custom id to a random one. */
    public generateCustomId() {
        this.customId = nanoid();
        return this;
    }
    /** The minimum number of items that must be selected. Default 1. Between 1-25. */
    public setMinValue(value: number) {
        if (value > 25) value = 25;
        if (value < 1) value = 1;
        this.minValues = value;
        return this;
    }
    /** The maximum number of items that can be selected. Default 1. Between 1-25. */
    public setMaxValue(value: number) {
        if (value > 25) value = 25;
        if (value < 1) value = 1;
        this.maxValues = value;
        return this;
    }
    /** Adds a option
     *
     * **Max Lengths**
     *
     * label - 25
     *
     * value - 100
     *
     * description - 50
     */
    public addOption(
        label: string,
        value: string,
        selectedByDefault = false,
        description?: string,
        emoji?: ComponentEmoji,
    ) {
        if (this.options.length == 25) return this;
        label = shortenString(label, 25);
        value = shortenString(value, 100);
        if (description) shortenString(description, 50);
        this.options.push({
            label: label,
            value: value,
            description: description,
            emoji: typeof emoji === "string"
                ? {
                    name: emoji,
                }
                : emoji,
            default: selectedByDefault,
        });
        return this;
    }
    /** Adds options in bulk
     *
     * **Max Lengths**
     *
     * label - 25
     *
     * value - 100
     *
     * description - 50
     */
    public addOptions(options: SelectMenuOptionAdd[]) {
        options.forEach((option) => {
            option.label = shortenString(option.label, 25);
            option.value = shortenString(option.value, 100);
            if (option.description) {
                option.description = shortenString(option.description, 50);
            }
            if (options.length == 25) return this;
            this.options.push({
                ...option,
                default: option.default || false,
            });
        });
        return this;
    }
}
