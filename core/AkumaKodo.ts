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
import { AkumaCreateBotOptions, AkumaKodoBotInterface, defaultConfigOptions } from "./interfaces/Client.ts";
import { AkumaKodoCollection } from "./lib/utils/Collection.ts";
import { AkumaKodoLogger } from "../internal/logger.ts";
import { delay } from "../internal/utils.ts";
import { Milliseconds } from "./lib/utils/helpers.ts";
import { AkumaKodoTaskModule } from "./lib/task/mod.ts";
import { AkumaKodoEmbed, createAkumaKodoEmbed } from "./lib/utils/Embed.ts";
import { AkumaKodoVersionControl } from "../internal/VersionControl.ts";
import { AkumaKodoMongodbProvider } from "./providers/mongodb.ts";

export class AkumaKodoBotCore {
  private launcher: {
    task: AkumaKodoTaskModule;
  };
  private versionControl: AkumaKodoVersionControl;
  public configuration: AkumaCreateBotOptions;
  public instance: BotWithCache;
  public container: AkumaKodoBotInterface;

  public constructor(config: AkumaCreateBotOptions) {
    if (!config) {
      this.configuration = defaultConfigOptions;
    }

    this.versionControl = new AkumaKodoVersionControl(config);
    this.versionControl.validate();

    // If no optional values were passed
    config.optional.bot_owners_ids = config.optional.bot_owners_ids || [];
    config.optional.bot_mention_with_prefix = config.optional.bot_mention_with_prefix || false;
    config.optional.bot_default_prefix = config.optional.bot_default_prefix || undefined;
    config.optional.bot_development_server_id = config.optional.bot_development_server_id || undefined;
    config.optional.bot_cooldown_bypass_ids = config.optional.bot_cooldown_bypass_ids || [];
    config.optional.bot_internal_logs = config.optional.bot_internal_logs || false;
    config.optional.bot_supporters_ids = config.optional.bot_supporters_ids || [];

    // Sets the configuration settings
    this.configuration = config;

    // Sets the container for the bot
    this.instance = enableCachePlugin(createBot(config));

    enableHelpersPlugin(this.instance);
    enableCachePlugin(this.instance);
    enableCacheSweepers(this.instance);
    enablePermissionsPlugin(this.instance);

    this.container = {
      providers: {
        type: config.providers.type,
        // Checks if the provider was enabled or disabled by user
        mongodb: config.providers?.type === "mongodb" || config.providers?.type !== "disabled" ? new AkumaKodoMongodbProvider({
          provider: "mongodb",
          mongodb_connection_url: config.providers?.mongodb_connection_url,
        }, { ...config }) : undefined,
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
    } as AkumaKodoBotInterface;

    this.launcher = {
      task: new AkumaKodoTaskModule(this.instance, this.container),
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
