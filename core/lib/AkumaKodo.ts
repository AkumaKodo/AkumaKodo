/**
 * Root file for the library and its source code.
 */
import {
  BotWithCache,
  createBot,
  enableCachePlugin,
  enableCacheSweepers,
  enableHelpersPlugin,
  enablePermissionsPlugin,
  startBot,
  stopBot,
} from "../../deps.ts";
import { AkumaCreateBotOptions, AkumaKodoBotInterface } from "../interfaces/Client.ts";
import { AkumaKodoCollection } from "./utils/Collection.ts";
import { AkumaKodoLogger } from "../../internal/logger.ts";
import { delay } from "../../internal/utils.ts";
import { Milliseconds } from "./utils/helpers.ts";
import { AkumaKodoTaskModule } from "./task/mod.ts";
import { createAkumaKodoEmbed } from "./utils/Embed.ts";

export class AkumaKodoBotCore {
  private launcher: {
    task: AkumaKodoTaskModule;
  };
  public configuration: AkumaCreateBotOptions;
  public client: BotWithCache;
  public container: AkumaKodoBotInterface;
  public constructor(config: AkumaCreateBotOptions) {
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
    this.client = enableCachePlugin(createBot(config));

    enableHelpersPlugin(this.client);
    enableCachePlugin(this.client);
    enableCacheSweepers(this.client);
    enablePermissionsPlugin(this.client);

    this.container = {
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
      slashCommands: new AkumaKodoCollection(),
      taskCollection: new AkumaKodoCollection(),
      monitorCollection: new AkumaKodoCollection(),
      languageCollection: new AkumaKodoCollection(),
      fullyReady: false,
      logger: new AkumaKodoLogger(this.configuration),
      mentionWithPrefix: true,
      utilities: {
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
      },
    } as AkumaKodoBotInterface;

    this.launcher = {
      task: new AkumaKodoTaskModule(this.client, this.container),
    };

    this.container.logger.create("info", "initializeCoreClient", "Core initialized.");
  }

  public async createBot() {
    await startBot(this.client);
    this.client.events.ready = async (bot, payload) => {
      await delay(1000);
      const Bot = bot as BotWithCache;
      if (payload.shardId + 1 === Bot.gateway.maxShards) {
        // Start task indexer on startup
        this.launcher.task.initializeTask();
        this.container.fullyReady = true;
        this.container.logger.create("info", "createBot", "Connection successful!");
      }
    };
  }

  public async destroyBot() {
    await delay(1000);
    await stopBot(this.client);
    this.container.logger.create("info", "destroyBot", "Connection destroy successful!");
  }
}
