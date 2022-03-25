import { InputTextComponent } from "https://deno.land/x/discordeno@13.0.0-rc18/src/types/messages/components/inputTextComponent.ts";
import { MessageComponentTypes, nanoid, TextStyles } from "../../../../deps.ts";
import { shortenString } from "../helpers.ts";
import { BaseComponent } from "./mod.ts";

export class InputText extends BaseComponent implements InputTextComponent {
    public type: MessageComponentTypes.InputText =
        MessageComponentTypes.InputText;
    public style = TextStyles.Short;
    public customId: string;
    public label = "Default Label";
    public placeholder?: string; // max 100 chars
    public minLength?: number;
    public maxLength?: number;
    public required?: boolean;
    public constructor() {
        super("InputText");
        this.customId = nanoid();
    }
    public setStyle(style: keyof typeof TextStyles) {
        this.style = TextStyles[style];
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
    /** What the input says. Max 80 characters. */
    public setLabel(label: string) {
        this.label = shortenString(label, 80);
        return this;
    }
    /** Input placeholder. Max 100 characters. */
    public setPlaceHolder(placeholder: string) {
        this.placeholder = shortenString(placeholder, 100);
        return this;
    }
    // Min: 0, Max: 4000 https://discord.com/developers/docs/interactions/message-components#text-inputs-text-input-structure
    /** Minimum length of the text user provides */
    public setMinLength(value: number) {
        if (value > 4000) value = 4000;
        if (value < 0) value = 0;
        this.minLength = value;
        return this;
    }
    // Min: 1, Max: 4000 https://discord.com/developers/docs/interactions/message-components#text-inputs-text-input-structure
    /** Maximum length of the text user provides */
    public setMaxLength(value: number) {
        if (value > 4000) value = 4000;
        if (value < 1) value = 1;
        this.maxLength = value;
        return this;
    }
    /** If this input is required or not */
    public setRequired(value: boolean) {
        this.required = value;
        return this;
    }
}
