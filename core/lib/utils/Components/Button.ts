import {
    ButtonComponent,
    ButtonStyles,
    MessageComponentTypes,
    nanoid,
} from "../../../../deps.ts";
import { ComponentEmoji } from "../../../interfaces/Component.ts";
import { shortenString } from "../helpers.ts";
import { BaseComponent } from "./mod.ts";

export class Button extends BaseComponent implements ButtonComponent {
    public label = "Default Label";
    public type: MessageComponentTypes.Button = MessageComponentTypes.Button;
    public style: ButtonStyles = ButtonStyles.Primary;
    public emoji?: ButtonComponent["emoji"];
    public url?: string;
    public disabled?: boolean;
    public constructor() {
        super("Button", nanoid());
    }
    /** Set different styles/colors of the buttons. */
    public setStyle(style: keyof Omit<typeof ButtonStyles, "Link">) {
        this.style = ButtonStyles[style];
        // Non link buttons need a customId
        if (!this.customId) this.customId = nanoid();
        return this;
    }
    /** Set a unicode or custom Discord emoji. */
    public setEmoji(emoji: ComponentEmoji) {
        this.emoji = typeof emoji === "string"
            ? {
                name: emoji,
            }
            : emoji;
        return this;
    }
    /** Makes this button a link button with the specified url. */
    public setUrl(url: string) {
        this.style = ButtonStyles.Link;
        this.url = url;
        // Link buttons cannot have customId
        this.customId = undefined;
        return this;
    }
    public setEnabled(enabled: boolean) {
        this.disabled = !enabled;
        return this;
    }
    public disable() {
        this.disabled = true;
        return this;
    }
    public enable() {
        this.disabled = undefined;
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
    /** What the button says. Max 80 characters. */
    public setLabel(label: string) {
        this.label = shortenString(label, 80);
        return this;
    }
}
