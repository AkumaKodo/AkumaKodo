import { ActionRow, MessageComponentTypes } from "../../../../deps.ts";
import { ComponentInterfaceOptions } from "../../../interfaces/Component.ts";

export class Components extends Array<ActionRow> {
    constructor(...args: ActionRow[]) {
        super(...args);
        return this;
    }
    addActionRow() {
        if (this.length == 5) return this;
        this.push({
            type: 1,
            components: [] as unknown as ActionRow["components"],
        });
        return this;
    }
    addComponent(component: ComponentInterfaceOptions) {
        if (!this.length) this.addActionRow();
        // Get the last Action Row
        let row = this[this.length - 1];
        if (
            [MessageComponentTypes.SelectMenu, MessageComponentTypes.InputText]
                .includes(component.type)
        ) {
            // If row already has something than create a new one
            if (row.components.length > 0) {
                if (this.length == 5) return this;
                this.addActionRow();
                row = this[this.length - 1];
            }
            row.components = [component];
            return this;
        }
        // If the Action Row already has 5 buttons create a new one
        if (row.components.length === 5) {
            this.addActionRow();
            row = this[this.length - 1];
            // Apparently there are already 5 Full Action Rows so don't add the component
            if (row.components.length === 5) return this;
        } else if (
            [MessageComponentTypes.SelectMenu, MessageComponentTypes.InputText]
                .includes(row.components?.[0]?.type)
        ) {
            // If there is a select menu than we cannot add more in the same row
            // Check for max rows possible
            if (this.length == 5) return this;
            this.addActionRow();
            row = this[this.length - 1];
        }
        // Safety check
        // When there will be more components like button, add them here
        if (component.type !== MessageComponentTypes.Button) return this;
        //
        row.components.push(component);
        return this;
    }
    addComponents(
        components: ComponentInterfaceOptions[] | ComponentInterfaceOptions,
    ) {
        if (!Array.isArray(components)) components = [components];
        if (!this.length) this.addActionRow();
        for (const comp of components) {
            // Get the last Action Row
            let row = this[this.length - 1];
            if (comp.type == MessageComponentTypes.SelectMenu) {
                // If row already has something than create a new one
                if (row.components.length > 0) {
                    // Check for max rows possible
                    if (this.length == 5) break;
                    this.addActionRow();
                    row = this[this.length - 1];
                }
                row.components = [comp];
                continue;
            }
            // If the Action Row already has 5 buttons create a new one
            if (row.components.length === 5) {
                // Check for max rows possible
                if (this.length == 5) break;
                this.addActionRow();
                row = this[this.length - 1];
            } else if (
                [
                    MessageComponentTypes.SelectMenu,
                    MessageComponentTypes.InputText,
                ].includes(components?.[0]?.type)
            ) {
                // If there is a select menu than we cannot add more in the same row
                // Check for max rows possible
                if (this.length == 5) break;
                this.addActionRow();
                row = this[this.length - 1];
            }
            // Safety check
            // When there will be more components like button, add them here
            if (comp.type !== MessageComponentTypes.Button) return;
            //
            row.components.push(comp);
        }
        return this;
    }
}

export class BaseComponent {
    customId?: string;
    type: MessageComponentTypes;
    constructor(type: keyof typeof MessageComponentTypes, id?: string) {
        this.customId = id;
        this.type = MessageComponentTypes[type];
    }
}
