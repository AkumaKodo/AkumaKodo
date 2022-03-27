import {
    ApplicationCommandOptionTypes,
    botHasGuildPermissions,
    BotWithCache,
    DiscordenoInteraction,
    InteractionResponseTypes,
    InteractionTypes,
    validatePermissions,
} from "../../../deps.ts";
import {
    AkumaKodoConfigurationInterface,
    AkumaKodoContainerInterface,
} from "../../interfaces/Client.ts";
import {
    AkumaKodoCommand,
    CommandScopeType,
} from "../../interfaces/Command.ts";
import { componentCollectors } from "../utils/collectors/component.ts";
import { Milliseconds } from "../utils/helpers.ts";
import { AkumaKodoCommandModule } from "./CommandModule.ts";

/**
 * Module to handle events
 */
export class AkumaKodoEventModule {
    private launcher: {
        command: AkumaKodoCommandModule;
    };
    public container: AkumaKodoContainerInterface;
    public configuration: AkumaKodoConfigurationInterface;
    private readonly instance: BotWithCache;

    private commandCachePool: Map<string, {
        /** The number of executions the command can take before we enable the ratelimit */
        hits: number;
        /** Time of the ratelimit */
        timestamp: number;
    }>;

    public constructor(
        bot: BotWithCache,
        container: AkumaKodoContainerInterface,
        config: AkumaKodoConfigurationInterface,
    ) {
        this.container = container;
        this.configuration = config;
        this.instance = bot;
        this.launcher = {
            command: new AkumaKodoCommandModule(
                this.instance,
                this.container,
                this.configuration,
            ),
        };

        this.commandCachePool = new Map();
        // Clear the rate-limit pool to save memory
        setInterval(() => {
            this.commandCachePool.forEach((ratelimit, key) => {
                if (ratelimit.timestamp < Date.now()) {
                    this.commandCachePool.delete(key);
                }
            });
        }, Milliseconds.Minute * 10);
    }

    /**
     * @description - Loads all internal event handlers for the bot client.
     * We handel Development scoped commands only by default. You can call this function again with your scope if you wish to use global commands.
     * @param scope - The scope of the command.
     */
    public async interactionCreateHandler(scope?: CommandScopeType) {
        try {
            // if (this.container.fullyReady) {
            await this.launcher.command.updateApplicationCommands("Development")
                .then(() => {
                    this.container.logger.debug(
                        "info",
                        "Development Commands",
                        "Application commands updated!",
                    );
                });

            // Checks if user wants to init global commands
            if (scope === "Global") {
                if (this.configuration.optional.bot_debug_mode) {
                    this.container.logger.debug(
                        "warn",
                        "initialize Internal Events",
                        "Global scope not recommended while in development mode!",
                    );
                }
                await this.launcher.command.updateApplicationCommands("Global")
                    .then(() => {
                        this.container.logger.debug(
                            "info",
                            "Global Commands",
                            "Global Application commands updated!",
                        );
                    });
            }
        } catch (error) {
            this.container.logger.debug(
                "error",
                "AkumaKodo Bot Core",
                "Failed to initialize application commands events.",
            );
            this.container.logger.debug("error", "AkumaKodo Bot Core", error);
            // Only start listening for events after all slash commands are posted!
        } finally {
            // Runs the interactionCreate event for all active slash commands in the bot.
            this.instance.events.interactionCreate = async (_, interaction) => {
                switch (interaction.type) {
                    // Handle slash commands
                    case InteractionTypes.ApplicationCommand:
                        if (!interaction.data?.name) {
                            return this.container.logger.debug(
                                "warn",
                                "InteractionCreate Handler",
                                "No interaction name found!",
                            );
                        }
                        try {
                            // get the command then run out checks before execution
                            const command = this.container.commands.get(
                                interaction.data.name!,
                            );
                            if (!command) {
                                return this.launcher.command.createCommandReply(
                                    interaction,
                                    {
                                        content:
                                            `Command ${interaction.data.name} not found! Please check the name and try again.`,
                                    },
                                    true,
                                );
                            }

                            // make sure the checks return true before running the command.
                            this.interactionCreateChecks(command, interaction);

                            this.container.logger.debug(
                                "info",
                                "Command Log",
                                `Command ${command.trigger} was executed by ${interaction.user.username}#${interaction.user.discriminator}`,
                            );
                        } catch (e) {
                            this.container.logger.debug(
                                "error",
                                "Interaction create",
                                `Error while running command. \n${e}`,
                            );
                        }
                        break;

                    // Handle autocomplete for commands

                    case InteractionTypes.ApplicationCommandAutocomplete:
                        if (!interaction.data?.name) {
                            return this.container.logger.debug(
                                "warn",
                                "InteractionCreate Handler",
                                "No interaction name found!",
                            );
                        }
                        try {
                            //TODO(#4) - Handler for autocomplete
                        } catch (e) {
                            this.container.logger.debug(
                                "error",
                                "Interaction create",
                                `Error while running command autocomplete. \n${e}`,
                            );
                        }
                        break;

                    // handler message components

                    case InteractionTypes.MessageComponent:
                        try {
                            await this.interactionComponentChecks(interaction);
                        } catch (e) {
                            this.container.logger.debug(
                                "error",
                                "Interaction create",
                                `Error while running command component. \n${e}`,
                            );
                        }
                        break;
                }
            };
        }
    }

    /**
     * Handlers the check system for the slash command handler.
     * @param command - The command to be run
     * @param interaction - The interaction to be run
     * @returns
     */
    private interactionCreateChecks(
        command: AkumaKodoCommand,
        interaction: DiscordenoInteraction,
    ) {
        // guild only check
        if (command.guildOnly && !interaction.guildId) {
            return this.launcher.command.createCommandReply(interaction, {
                content: `This command can only be used in a server!`,
            }, true);
        }

        // dm only check
        if (command.dmOnly && interaction.guildId) {
            return this.launcher.command.createCommandReply(interaction, {
                content: `This command can only be used in a DM!`,
            }, true);
        }

        // Owner only check
        if (
            command.ownerOnly &&
            !this.container.bot_owners_cache.has(interaction.user.id)
        ) {
            // if (!this.configuration.optional.bot_fetch_owners) {
            //     this.container.logger.debug(
            //         "warn",
            //         "Owner Only Command",
            //         "You do not have fetch bot owners enabled but you set a command as owner only. Make sure to enable this or fetch the owner Id yourself and save it.",
            //     );
            // }
            return this.launcher.command.createCommandReply(interaction, {
                content: `Only the bot owner can use this command!`,
            }, true);
        }

        // Dev only command check
        if (
            command.devOnly &&
            this.configuration.required.bot_development_server_id !==
                interaction.guildId
        ) {
            return this.launcher.command.createCommandReply(interaction, {
                content:
                    `This command is only available on the development server!`,
            }, true);
        }

        // nsfw check
        const nsfw_channel_check = this.instance.channels.get(
            interaction.channelId!,
        );
        if (command.nsfw && !nsfw_channel_check?.nsfw) {
            return this.launcher.command.createCommandReply(interaction, {
                content: `This command is only available in NSFW channels!`,
            }, true);
        }

        // check if the user has the permission to run this command
        if (command.userPermissions) {
            const validUserPermissions = validatePermissions(
                interaction.member?.permissions!,
                command.userPermissions,
            );

            // If the permission check returns false, we cancel the command.
            if (!validUserPermissions) {
                if (this.configuration.optional.bot_log_command_reply) {
                    return this.launcher.command.createCommandReply(
                        interaction,
                        {
                            content:
                                `You do not have the required permissions to run this command! Missing: ${
                                    command.userPermissions.join(", ")
                                }`,
                        },
                        true,
                    );
                }
            }
        }
        // Checks if the bot has permissions to run the command.
        if (command.botPermissions) {
            const validBotPermissions = botHasGuildPermissions(
                this.instance,
                this.instance.id,
                command.botPermissions,
            );

            if (!validBotPermissions) {
                if (this.configuration.optional.bot_log_command_reply) {
                    return this.launcher.command.createCommandReply(
                        interaction,
                        {
                            content:
                                `I do not have the required permissions to run this command! Missing: ${
                                    command.botPermissions?.join(", ")
                                }`,
                        },
                        true,
                    );
                }
            }
        }
        // handle rate limits

        const commandRateLimits = command.rateLimit ||
            this.container.defaultRateLimit;
        const memberId = interaction.member?.id;

        if (
            !commandRateLimits ||
            (memberId &&
                (this.container.ignoreRateLimit?.includes(memberId) ||
                    command.ignoreRateLimit?.includes(memberId)))
        ) {
            return true;
        }

        const key = `${interaction.guildId}-${memberId}-${command.trigger}`;
        const limit_check = this.commandCachePool.get(key);

        if (limit_check) {
            // Check if the user has used all their allowed limits for this command
            if (limit_check.hits >= (commandRateLimits.limit)) {
                if (limit_check.timestamp > Date.now()) {
                    return this.launcher.command.createCommandReply(
                        interaction,
                        {
                            content:
                                `This command can only be used __${commandRateLimits.limit}__ ${
                                    commandRateLimits.limit > 1
                                        ? "times"
                                        : "time"
                                } per ${
                                    commandRateLimits.duration / 1000
                                } seconds! Please try again in ${
                                    (limit_check.timestamp - Date.now()) / 1000
                                } seconds.`,
                        },
                        true,
                    );
                } else {
                    limit_check.hits = 0;
                }
            }

            this.commandCachePool.set(key, {
                hits: limit_check.hits++,
                timestamp: Date.now() + commandRateLimits.duration,
            });
            // TODO(#2) - Add a way to reply to ratelimit hits
            // return this.launcher.command.createCommandReply(interaction, {
            //   content: `You hit a rate-limit! Please try again in ${(limit_check.timestamp - Date.now()) / 1000} seconds.`,
            // }, true);
        }

        this.commandCachePool.set(key, {
            hits: 1,
            timestamp: Date.now() + commandRateLimits.duration,
        });

        return command.run(interaction);
    }

    /**
     * TODO(#5) - Get this working!
     * Handles the check system for the auto command handler.
     * @param command - The command to be run
     * @param interaction - The interaction to be run
     * @returns
     */
    private interactionAutoCompleteChecks(
        command: AkumaKodoCommand,
        interaction: DiscordenoInteraction,
    ) {
        if (!command) return;
    }

    private async interactionComponentChecks(
        interaction: DiscordenoInteraction,
    ) {
        const idToUse = interaction.message?.messageReference?.messageId ??
            interaction.message?.interaction?.id ??
            interaction.message?.id;

        const collector = idToUse && componentCollectors.get(idToUse);
        if (!collector) return;

        const collectorReturn = {
            customId: interaction.data?.customId!,
            interaction: interaction,
        };
        if (collector.collectCondition) {
            const passed = collector.collectCondition(collectorReturn);
            if (!passed) return;
        }

        collector.state?.collected?.push(interaction);

        // Acknowledge
        let shouldDefer = false;
        if (typeof collector.state.defer === "function") {
            shouldDefer = collector.state.defer(collectorReturn);
        } else {
            shouldDefer = collector.state.defer ?? true;
        }
        if (shouldDefer) {
            await this.instance.helpers
                .sendInteractionResponse(interaction.id, interaction.token, {
                    type: InteractionResponseTypes.DeferredUpdateMessage,
                })
                .catch(() => {});
        }
        if (collector.resolveCondition) {
            const passed = collector.resolveCondition(collectorReturn);
            if (!passed) return;
        }
        collector.resolve(collectorReturn);
        componentCollectors.delete(collector.key);
    }
}
