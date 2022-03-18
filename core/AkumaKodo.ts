import {
  BotWithCache,
  ButtonData,
  createBot,
  enableCachePlugin,
  enableCacheSweepers,
  enableHelpersPlugin,
  enablePermissionsPlugin,
  InteractionTypes,
  MessageComponentTypes,
  startBot,
  stopBot,
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
import { AkumaKodoMongodbProvider } from "./providers/mongodb.ts";
import { AkumaKodoTaskModule } from "./lib/modules/TaskModule.ts";
import { AkumaKodoCommandModule } from "./lib/modules/CommandModule.ts";

/**
 * AkumaKodo is a discord bot framework, designed to be modular and easy to extend.
 *
 * @core AkumaKodoBotCore
 * @author ThatGuyJamal
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
  };
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

  public constructor(botOptions: AkumaCreateBotOptions, config: AkumaKodoConfigurationInterface) {
    if (!config.optional) {
      this.configuration = defaultConfigOptions;
    }

    this.versionControl = new AkumaKodoVersionControl(config);
    const validation = this.versionControl.validate();
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

    // If no optional values were passed
    config.optional.bot_owners_ids = config.optional.bot_owners_ids || [];
    config.optional.bot_mention_with_prefix = config.optional.bot_mention_with_prefix || false;
    config.optional.bot_default_prefix = config.optional.bot_default_prefix || undefined;
    config.optional.bot_development_server_id = config.optional.bot_development_server_id || undefined;
    config.optional.bot_cooldown_bypass_ids = config.optional.bot_cooldown_bypass_ids || [];
    config.optional.bot_debug_mode = config.optional.bot_debug_mode || false;
    config.optional.bot_supporters_ids = config.optional.bot_supporters_ids || [];

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
      providers: {
        type: config.optional.providers.type,
        // Checks if the provider was enabled or disabled by user
        mongodb: config.optional.providers?.type === "mongodb" || config.optional.providers?.type !== "disabled"
          ? new AkumaKodoMongodbProvider({
            provider: "mongodb",
            mongodb_connection_url: config.optional.providers?.mongodb_connection_url,
          }, { ...config })
          : undefined,
      },
      defaultCooldown: {
        seconds: Milliseconds.Second * 5,
        allowedUses: 1,
      },
      ignoreCooldown: config.optional.bot_cooldown_bypass_ids,
      prefix: config.optional.bot_default_prefix,
      runningTasks: {
        intervals: [],
        initialTimeouts: [],
      },
      commands: new AkumaKodoCollection(),
      taskCollection: new AkumaKodoCollection(),
      monitorCollection: new AkumaKodoCollection(),
      languageCollection: new AkumaKodoCollection(),
      fullyReady: false,
      logger: new AkumaKodoLogger(this.configuration),
      mentionWithPrefix: true,
      utils: {
        createEmbed(options) {
          createAkumaKodoEmbed(options);
        },
        createCommand(bot, command) {
          bot.launcher.command.createCommand(command);
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
    } as AkumaKodoContainerInterface;

    this.launcher = {
      task: new AkumaKodoTaskModule(this.container),
      command: new AkumaKodoCommandModule(this.instance, this.container, this.configuration),
    };

    this.container.logger.create("info", "AkumaKodo Bot Core", "Core initialized.");
  }

  /**
   * @description - Loads all internal event handlers for the bot client.
   * We handel Development scoped commands only by default. You can call this function again with your scope if you wish to use global commands.
   */
  public initializeInternalEvents(scope?: "Global" | "Development") {
    this.launcher.command.updateApplicationCommands("Development").then(() => {
      this.container.logger.create("info", "AkumaKodo Bot Core", "Application commands updated!");
    });

    if (scope === "Global") {
      if (this.configuration.optional.bot_debug_mode) this.container.logger.create("warn", "initialize Internal Events", "Global scope not recommended while in development mode!")
      this.launcher.command.updateApplicationCommands("Global").then(() => {
        this.container.logger.create("info", "AkumaKodo Bot Core", "Application commands updated!");
      });
    }

    // Runs the interactionCreate event for all active slash commands in the bot.
    this.instance.events.interactionCreate = (_, interaction) => {
      if (!interaction.data) return;

      switch (interaction.type) {
        case InteractionTypes.ApplicationCommand:
          this.container.commands.get(interaction.data.name!)?.run(interaction);
          break;
      }
    };
  }

  /**
   * Creates the bot process and starts the bot
   */
  public async createBot() {
    await startBot(this.instance);
    this.instance.events.ready = (_, payload) => {
      // Wait till shards are loaded to start the bot
      if (payload.shardId + 1 === this.instance.gateway.maxShards) {
        this.launcher.task.initializeTask();
        this.container.fullyReady = true;
        this.container.logger.create("info", "createBot", "AkumaKodo Connection successful!");
      }
    };
  }

  /**
   * KIlls the bot process
   */
  public async destroyBot() {
    await delay(1000);
    await stopBot(this.instance);
    this.container.logger.create("info", "destroyBot", "Connection destroy successful!");
  }
}
