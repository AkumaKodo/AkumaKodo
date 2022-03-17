import {
  BotWithCache,
  createBot,
  enableCachePlugin,
  enableCacheSweepers,
  enableHelpersPlugin,
  enablePermissionsPlugin,
  startBot,
  stopBot,
} from "../deps.ts";
import { AkumaCreateBotOptions, AkumaKodoContainerInterface, defaultConfigOptions } from "./interfaces/Client.ts";
import { AkumaKodoCollection } from "./lib/utils/Collection.ts";
import { AkumaKodoLogger } from "../internal/logger.ts";
import { delay } from "../internal/utils.ts";
import { Milliseconds } from "./lib/utils/helpers.ts";
import { AkumaKodoTaskModule } from "./lib/task/mod.ts";
import { AkumaKodoEmbed, createAkumaKodoEmbed } from "./lib/utils/Embed.ts";
import { AkumaKodoVersionControl } from "../internal/VersionControl.ts";
import { AkumaKodoMongodbProvider } from "./providers/mongodb.ts";
import { AkumaKodoModule } from "./lib/modules/mod.ts";

/**
 * AkumaKodo is a discord bot framework.
 * It is designed to be modular and easy to extend.
 * It is also designed to be easy to use.
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
    modules: AkumaKodoModule;
  };
  /**
   * A utility function to check your version of deno for booting the bot.
   * @private
   */
  private versionControl: AkumaKodoVersionControl;
  /**
   * @description - The configuration - Any configuration options passed to the bot will be stored here. Allowing easy access to the configuration options and data for developers.
   */
  public configuration: AkumaCreateBotOptions;
  /**
   * @description - The instance - The bot itself and all its functions from discordeno.
   */
  public instance: BotWithCache;
  /**
   * @description The container - a collection of all the instance modules, classes, and utils that cen be used by the bot developer.
   */
  public container: AkumaKodoContainerInterface;

  public constructor(config: AkumaCreateBotOptions) {
    if (!config) {
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
    this.instance = enableCachePlugin(createBot(config));

    // Enables the plugins on the instance of the bot
    // This needs to be done before other setup functions
    enableHelpersPlugin(this.instance);
    enableCachePlugin(this.instance);
    enableCacheSweepers(this.instance);
    enablePermissionsPlugin(this.instance);

    this.container = {
      providers: {
        type: config.providers.type,
        // Checks if the provider was enabled or disabled by user
        mongodb: config.providers?.type === "mongodb" || config.providers?.type !== "disabled"
          ? new AkumaKodoMongodbProvider({
            provider: "mongodb",
            mongodb_connection_url: config.providers?.mongodb_connection_url,
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
        // createSlashCommand(bot, command) {
        //   createSlashCommand(bot, command);
        // },
        // createSlashSubcommand(bot, command, subcommandGroup, options) {
        //   createSlashSubcommand(bot, command, subcommandGroup, options);
        // },
        // createSlashSubcommandGroup(bot, command, subcommandGroup, retries) {
        //   createSlashSubcommandGroup(bot, command, subcommandGroup, retries);
        // },
        createTask(client, task) {
          client.launcher.task.createAkumaKodoTask(task);
        },
        destroyTasks(client) {
          client.launcher.task.destroyTask();
        },
        embed() {
          return new AkumaKodoEmbed();
        },
      },
    } as AkumaKodoContainerInterface;

    this.launcher = {
      task: new AkumaKodoTaskModule(this.instance, this.container),
      modules: new AkumaKodoModule(this.instance, this.configuration),
    };

    this.container.logger.create("info", "AkumaKodo Bot Core", "Core initialized.");
  }

  /**
   * Creates the bot process and starts the bot
   */
  public async createBot() {
    await startBot(this.instance);
    this.instance.events.ready = (bot, payload) => {
      const Bot = bot as BotWithCache;
      if (payload.shardId + 1 === Bot.gateway.maxShards) {
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
