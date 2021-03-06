import {
    BotWithCache,
    createBot,
    DiscordenoShard,
    enableCachePlugin,
    enableCacheSweepers,
    enableHelpersPlugin,
    enablePermissionsPlugin,
    startBot,
} from "../deps.ts";
import {
    AkumaCreateBotOptions,
    AkumaKodoConfigurationInterface,
    AkumaKodoContainerInterface,
    defaultConfigOptions,
} from "./interfaces/Client.ts";
import { AkumaKodoCollection } from "./lib/utils/Collection.ts";
import { AkumaKodoLogger } from "../internal/logger.ts";
import { delay } from "../internal/utils.ts";
import { Milliseconds } from "./lib/utils/helpers.ts";
import { AkumaKodoEmbed, createAkumaKodoEmbed } from "./lib/utils/Embed.ts";
import { AkumaKodoVersionControl } from "../internal/VersionControl.ts";
import { AkumaKodoTaskModule } from "./lib/modules/TaskModule.ts";
import { AkumaKodoCommandModule } from "./lib/modules/CommandModule.ts";
import { FileSystemModule } from "../internal/fs.ts";
import { AkumaKodoEventModule } from "./lib/modules/EventModule.ts";

/**
 * AkumaKodo is a discord bot framework, designed to be modular and easy to extend.
 *
 * @core AkumaKodoBotCore
 * @author ThatGuyJamal ~
 *
 * This is the core of the framework and the gateway to all other modules.
 */
export class AkumaKodoBotCore {
    /**
     * An internal method used to fire Core functions. This is not used by the external developer.
     * @private
     */
    private launcher: {
        task: AkumaKodoTaskModule;
        command: AkumaKodoCommandModule;
        event: AkumaKodoEventModule;
    };

    /**
     * Internal file system module
     * @private
     */
    private fs: FileSystemModule;
    /**
     * A utility function to check your version of deno for booting the bot.
     * @private
     */
    private versionControl: AkumaKodoVersionControl;
    /**
     * @description - The configuration - Any configuration options passed to the bot will be stored here. Allowing easy access to the configuration options and data for developers.
     */
    public configuration: AkumaKodoConfigurationInterface;
    /**
     * @description - The instance - The bot itself and all its functions from discordeno.
     */
    public instance: BotWithCache;
    /**
     * @description The container - a collection of all the instance modules, classes, and utils that cen be used by the bot developer.
     */
    public container: AkumaKodoContainerInterface;
    // public mongodb: AkumaKodoMongodbProvider;

    public constructor(
        botOptions: AkumaCreateBotOptions,
        config: AkumaKodoConfigurationInterface,
    ) {
        if (!config.optional) {
            this.configuration = defaultConfigOptions;
        }

        this.versionControl = new AkumaKodoVersionControl(config);
        const validation = this.versionControl.validateDenoVersion();
        // Stop the progress if the version is not valid.
        // We will only warn on debug for other options as they will not break the bot.
        if (validation === 1) {
            // In case debug is not enabled we will still send an error message.
            if (!config.optional.bot_debug_mode) {
                console.error(
                    `[AkumaKodo] - Your version of Deno is not supported. Please update to the latest version of Deno ~ deno upgrade`,
                );
            }
            Deno.exit(0);
        }

        // Sets the configuration settings
        this.configuration = config;

        // Sets the container for the bot
        this.instance = enableCachePlugin(createBot(botOptions));

        // Enables the plugins on the instance of the bot
        // This needs to be done before other setup functions
        enableHelpersPlugin(this.instance);
        enableCachePlugin(this.instance);
        enableCacheSweepers(this.instance);
        enablePermissionsPlugin(this.instance);

        this.container = {
            defaultRateLimit: {
                duration: Milliseconds.Second * 5,
                limit: 1,
            },
            ignoreRateLimit: config.optional.bot_ratelimit_bypass_ids,
            prefix: config.optional.bot_default_prefix,
            runningTasks: {
                intervals: [],
                initialTimeouts: [],
            },
            commands: new AkumaKodoCollection(),
            taskCollection: new AkumaKodoCollection(),
            monitorCollection: new AkumaKodoCollection(),
            languageCollection: new AkumaKodoCollection(),
            bot_owners_cache: new Set(),
            bot_supporters_cache: new Set(),
            fullyReady: false,
            logger: new AkumaKodoLogger(this.configuration),
            mentionWithPrefix: true,
            utils: {
                createEmbed(options) {
                    return createAkumaKodoEmbed(options);
                },
                createCommand(bot, command) {
                    bot.launcher.command.createCommand(command);
                },
                async createCommandReply(bot, interaction, hidden, ctx, type) {
                    await bot.launcher.command.createCommandReply(
                        interaction,
                        hidden,
                        ctx,
                        type,
                    );
                },
                // createSlashSubcommand(bot, command, subcommandGroup, options) {
                //   createSlashSubcommand(bot, command, subcommandGroup, options);
                // },
                // createSlashSubcommandGroup(bot, command, subcommandGroup, retries) {
                //   createSlashSubcommandGroup(bot, command, subcommandGroup, retries);
                // },
                createTask(client, task, callback) {
                    client.launcher.task.createAkumaKodoTask(task, callback);
                },
                destroyTasks(client, callback) {
                    client.launcher.task.destroyTask(callback);
                },
                embed() {
                    return new AkumaKodoEmbed();
                },
            },
            fs: {
                import(bot, path) {
                    bot.fs.import(path);
                },
                load(bot) {
                    bot.fs.load();
                },
                fastLoader(bot, paths, between, before) {
                    bot.fs.fastLoader(paths, between, before);
                },
            },
        } as AkumaKodoContainerInterface;

        this.fs = new FileSystemModule(this.container);

        this.launcher = {
            task: new AkumaKodoTaskModule(this.container),
            command: new AkumaKodoCommandModule(
                this.instance,
                this.container,
                this.configuration,
            ),
            event: new AkumaKodoEventModule(
                this.instance,
                this.container,
                this.configuration,
            ),
        };

        // If the user provided users in the option, we save them to cache
        if (this.configuration.optional.bot_owners_ids!.length > 0) {
            for (
                const owners of this.configuration.optional.bot_owners_ids
                    ?.values()!
            ) {
                this.container.bot_owners_cache.add(BigInt(owners));
                this.container.logger.debug(
                    "info",
                    "Bot Owner Cache",
                    `Added ID of [${owners}] to bot owners cache.`,
                );
            }
        }

        // Saves all the bot supporters to the cache
        if (this.configuration.optional.bot_supporters_ids!.length > 0) {
            for (
                const supporters of this.configuration.optional
                    .bot_supporters_ids?.values()!
            ) {
                this.container.bot_supporters_cache.add(BigInt(supporters));
                this.container.logger.debug(
                    "info",
                    "Bot Supporter Cache",
                    `Added ID of [${supporters}] to bot supporters cache.`,
                );
            }
        }

        this.container.logger.debug(
            "info",
            "AkumaKodo Bot Core",
            "Core initialized.",
        );
    }

    /**
     * Creates the bot process and starts the bot.
     */
    public async createBot(): Promise<void> {
        try {
            await startBot(this.instance);
            this.instance.events.ready = async (_, payload) => {
                // Wait till shards are loaded to start the bot
                if (payload.shardId + 1 === this.instance.gateway.maxShards) {
                    // if the internal events are enabled run this code:
                    if (this.configuration.optional.bot_internal_events) {
                        await this.handleInternalEvents();
                    } else {
                        this.container.logger.debug(
                            "warn",
                            "createBot",
                            "No internal events were enabled. All handlers will have to be created manually.",
                        );
                    }
                    if (this.configuration.optional.bot_fetch_owners) {
                        await this.fetchBotOwnersFromDiscordApi();
                    }
                    this.container.fullyReady = true;
                    this.container.logger.debug(
                        "info",
                        "create Bot",
                        "AkumaKodo Connection successful!",
                    );
                }
            };
        } catch (err) {
            this.container.logger.debug(
                "fatal",
                "AkumaKodo Bot Core",
                `An error occurred while starting the bot.\n${err}`,
            );
            Deno.exit(1);
        }
    }

    /**
     * Kills the bot process
     */
    public async destroyBot(): Promise<void> {
        this.instance.gateway.shards.forEach((shard: DiscordenoShard) => {
            clearInterval(shard.heartbeat.intervalId);
            this.instance.gateway.closeWS(
                shard.ws,
                3061,
                "Logging off! Do Not RESUME!",
            );
        });

        await delay(3000);
        this.container.logger.debug(
            "info",
            "destroy Bot",
            "Connection destroy successful!",
        );
    }

    /** handles the internal events */
    private async handleInternalEvents(): Promise<void> {
        if (
            this.configuration.optional.bot_internal_events?.interactionCreate
        ) {
            this.container.logger.debug(
                "info",
                "handle Internal Events",
                "Creating interactionCreate event.",
            );
            await this.launcher.event.interactionCreateHandler();
        }
    }

    private async fetchBotOwnersFromDiscordApi() {
        // Check if this was enabled
        if (!this.configuration.optional.bot_fetch_owners) {
            return this.container.logger.debug(
                "warn",
                "Bot API Owner Fetch",
                "Fetch bot owners disabled. Skipping fetch...",
            );
        } else {
            this.container.logger.debug(
                "info",
                "Bot API Owner Fetch",
                "Fetching bot owners from Discord API.",
            );
            const data = await this.instance.helpers.getApplicationInfo().catch(
                (err) => {
                    this.container.logger.debug(
                        "error",
                        "Bot API Owner Fetch",
                        err,
                    );
                    return undefined;
                },
            );

            if (data) {
                // If there are more than one bot owners we need to cache them all from the array
                if (data.team) {
                    data.team.members.forEach((t) => {
                        if (!t.user.id) return;
                        this.container.logger.debug(
                            "info",
                            "Bot API Owner Fetch",
                            `Adding bot owner ${t.user.username}#${t.user.discriminator} to the cache.`,
                        );
                        this.container.bot_owners_cache.add(t.user.id);
                    });
                } else {
                    const ownerId = data.owner?.id!;
                    this.container.logger.debug(
                        "info",
                        "Bot API Owner Fetch",
                        `Adding bot owner ${data.owner?.username}#${data.owner
                            ?.discriminator} | ID: ${ownerId} - to the cache.`,
                    );
                    this.container.bot_owners_cache.add(ownerId);
                }
            } else {
                this.container.logger.debug(
                    "warn",
                    "Bot API Owner Fetch",
                    "No data was returned from Discord API.",
                );
            }
            this.container.logger.debug(
                "info",
                "Bot API Owner Fetch",
                "Bot owners fetched.",
            );
        }
    }
}
