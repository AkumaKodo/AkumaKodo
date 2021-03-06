import {
    AkumaKodoConfigurationInterface,
    AkumaKodoContainerInterface,
} from "../../interfaces/Client.ts";
import {
    AkumaKodoCommand,
    CommandScopeType,
} from "../../interfaces/Command.ts";
import {
    AtLeastOne,
    BotWithCache,
    ButtonStyles,
    DiscordenoInteraction,
    DiscordenoMember,
    EditGlobalApplicationCommand,
    editInteractionResponse,
    InteractionApplicationCommandCallbackData,
    InteractionResponseTypes,
    MakeRequired,
    MessageComponentTypes,
    nanoid,
    sendInteractionResponse,
    upsertApplicationCommands,
    validatePermissions,
} from "../../../deps.ts";
import { Components } from "../utils/Components/mod.ts";
import { Button } from "../utils/Components/Button.ts";

export class AkumaKodoCommandModule {
    public container: AkumaKodoContainerInterface;
    public configuration: AkumaKodoConfigurationInterface;
    private readonly instance: BotWithCache;

    /**
     * @param bot The bot instance
     * @param container The container instance
     * @param config The configuration instance
     */
    public constructor(
        bot: BotWithCache,
        container: AkumaKodoContainerInterface,
        config: AkumaKodoConfigurationInterface,
    ) {
        this.container = container;
        this.configuration = config;
        this.instance = bot;
    }

    /**
     * Creates a new command in the cache. This is used to preload commands
     * @param command The command to create
     * @returns The created command
     */
    public createCommand(command: AkumaKodoCommand): AkumaKodoCommand {
        // Check things before the command is set in cache
        AkumaKodoCommandModule.preCheck(command);

        if (!command.rateLimit) {
            command.rateLimit = this.container.defaultRateLimit;
        }
        if (!command.description) {
            command.description = "No description provided";
        }
        if (!command.category) command.category = "undefined";
        if (!command.nsfw) command.nsfw = false;

        this.container.commands.set(command.trigger.toLowerCase(), command);
        this.container.logger.debug(
            "info",
            "create command",
            `Created command ${command.trigger}`,
        );
        return command;
    }

    /**
     * A quick util for a developer to send interaction command messages
     * @param interaction An interaction
     * @param context The interaction reply options
     * @param hidden Whether the interaction should be hidden
     * @param type The type of interaction
     */
    public async createCommandReply(
        interaction: DiscordenoInteraction,
        context?: InteractionApplicationCommandCallbackData,
        hidden = false,
        type?:
            | "Pong"
            | "ChannelMessageWithSource"
            | "DeferredChannelMessageWithSource"
            | "DeferredUpdateMessage"
            | "UpdateMessage"
            | "ApplicationCommandAutocompleteResult"
            | "Modal",
    ) {
        try {
            switch (type) {
                case "Pong":
                    await this.instance.helpers.sendInteractionResponse(
                        interaction.id,
                        interaction.token,
                        {
                            type: InteractionResponseTypes.Pong,
                            private: hidden,
                            data: context,
                        },
                    );
                    break;
                case "ChannelMessageWithSource":
                    await this.instance.helpers.sendInteractionResponse(
                        interaction.id,
                        interaction.token,
                        {
                            type: InteractionResponseTypes
                                .ChannelMessageWithSource,
                            private: hidden,
                            data: context,
                        },
                    );
                    break;
                case "DeferredChannelMessageWithSource":
                    await this.instance.helpers.sendInteractionResponse(
                        interaction.id,
                        interaction.token,
                        {
                            type: InteractionResponseTypes
                                .DeferredChannelMessageWithSource,
                            private: hidden,
                            data: context,
                        },
                    );
                    break;
                case "DeferredUpdateMessage":
                    await this.instance.helpers.sendInteractionResponse(
                        interaction.id,
                        interaction.token,
                        {
                            type:
                                InteractionResponseTypes.DeferredUpdateMessage,
                            private: hidden,
                            data: context,
                        },
                    );
                    break;
                case "UpdateMessage":
                    await this.instance.helpers.sendInteractionResponse(
                        interaction.id,
                        interaction.token,
                        {
                            type: InteractionResponseTypes.UpdateMessage,
                            private: hidden,
                            data: context,
                        },
                    );
                    break;
                case "ApplicationCommandAutocompleteResult":
                    await this.instance.helpers.sendInteractionResponse(
                        interaction.id,
                        interaction.token,
                        {
                            type: InteractionResponseTypes
                                .ApplicationCommandAutocompleteResult,
                            private: hidden,
                            data: context,
                        },
                    );
                    break;
                case "Modal":
                    await this.instance.helpers.sendInteractionResponse(
                        interaction.id,
                        interaction.token,
                        {
                            type: InteractionResponseTypes.Modal,
                            private: hidden,
                            data: context,
                        },
                    );
                    break;
                default:
                    await this.instance.helpers.sendInteractionResponse(
                        interaction.id,
                        interaction.token,
                        {
                            type: InteractionResponseTypes
                                .ChannelMessageWithSource,
                            private: hidden,
                            data: context,
                        },
                    );
                    break;
            }
        } catch (e) {
            this.container.logger.debug("fatal", "Command Reply Failed", e);
        }
    }

    /**
     * Checks if a command is valid before loading it into the collection.
     * @param command
     * @private
     */
    private static preCheck(command: AkumaKodoCommand) {
        if (command.trigger.length > 32) {
            throw new Error(
                "Command trigger is too long! Max 32 characters" +
                    `For command ${command.trigger}`,
            );
        }
        if (command.trigger.length < 1) {
            throw new Error(
                "Command trigger is too short! Min 1 character" +
                    `For command ${command.trigger}`,
            );
        }
        if (command.trigger.includes(" ")) {
            throw new Error(
                "Command trigger cannot contain spaces!" +
                    `For command ${command.trigger}`,
            );
        }
        if (command.trigger.includes("@")) {
            throw new Error(
                "Command trigger cannot contain the @ symbol" +
                    `For command ${command.trigger}`,
            );
        }
        if (command.trigger.includes("#")) {
            throw new Error(
                "Command trigger cannot contain the ! symbol" +
                    `For command ${command.trigger}`,
            );
        }
    }

    /**
     * Gets a command by trigger and return its data.
     * You can use this to get command information such as category, description, usage, etc.
     * @param trigger
     * @returns The command data or undefined if not found
     */
    public getCommand(trigger: string): AkumaKodoCommand | undefined {
        const command: AkumaKodoCommand | undefined = this.container.commands
            .get(trigger);
        if (command) {
            return command;
        } else {
            return undefined;
        }
    }

    /**
     * Sends the discord api an event to update all slash commands.
     * @param scope The scope of commands to upgrade
     */
    public async updateApplicationCommands(scope?: CommandScopeType) {
        if (this.configuration.optional.commands?.upsert) {
            const globalCommands: MakeRequired<
                EditGlobalApplicationCommand,
                "name"
            >[] = [];
            const developmentCommands: MakeRequired<
                EditGlobalApplicationCommand,
                "name"
            >[] = [];

            for (const command of this.container.commands.values()) {
                if (scope === "Development") {
                    if (command.scope === "Development") {
                        developmentCommands.push({
                            name: command.trigger,
                            description: command.description,
                            type: command.type,
                            options: command.options
                                ? command.options
                                : undefined,
                        });
                    }
                    /**
                     * Update the development commands
                     */
                    if (
                        developmentCommands.length &&
                        (scope === "Development" || scope === undefined)
                    ) {
                        if (
                            !this.configuration.required
                                .bot_development_server_id
                        ) {
                            throw new Error(
                                "Development server id is not set in config options!",
                            );
                        }
                        await upsertApplicationCommands(
                            this.instance,
                            developmentCommands,
                            this.configuration.required
                                .bot_development_server_id,
                        ).catch((e) =>
                            this.container.logger.debug(
                                "error",
                                "Update development commands Error",
                                e,
                            )
                        );

                        this.container.logger.debug(
                            "info",
                            "Update development commands",
                            "Updating Development Commands, this will only take a few seconds...",
                        );
                    }
                } else {
                    if (command.scope === "Global") {
                        globalCommands.push({
                            name: command.trigger,
                            description: command.description,
                            type: command.type,
                            options: command.options
                                ? command.options
                                : undefined,
                        });
                    }

                    /**
                     * Updates the global application commands
                     */
                    if (
                        globalCommands.length &&
                        (scope === "Global" || scope === undefined)
                    ) {
                        this.container.logger.debug(
                            "info",
                            "Update global commands",
                            "Updating Global Commands, this takes up to 1 hour to take effect...",
                        );
                        this.container.logger.debug(
                            "info",
                            "Update global commands",
                            `Commands added: ${globalCommands.join(", ")}`,
                        );
                        await this.instance.helpers.upsertApplicationCommands(
                            globalCommands,
                        ).catch((e) =>
                            this.container.logger.debug(
                                "error",
                                "Update global commands Error",
                                e,
                            )
                        ).catch((e) =>
                            this.container.logger.debug(
                                "error",
                                "Update global commands Error",
                                e,
                            )
                        );
                    }
                }
            }
            this.PermissionLevelsHandlers().Admin;
        } else {
            this.container.logger.debug(
                "info",
                "Update commands",
                "Skipping slash commands updates...",
            );
        }
    }

    /**
     * Checks if the guild member has x permission
     * @returns {boolean} If the member has access to these permissions
     */
    public PermissionLevelsHandlers() {
        return {
            Admin: (data: DiscordenoMember) =>
                Boolean(data.permissions) &&
                validatePermissions(data.permissions!, ["ADMINISTRATOR"]),
            GuildOwner: (
                data: DiscordenoMember,
            ) => (data.guildId
                ? this.instance.guilds.get(data.guildId)?.ownerId === data.id
                : false),
            BotOwner: (data: DiscordenoMember) =>
                this.container.bot_owners_cache.has(data.id),
        };
    }
}
