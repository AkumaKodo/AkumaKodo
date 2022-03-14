/** Options for the bot client */
import {
  Bot,
  BotWithCache,
  CacheProps,
  createBot,
  enableCachePlugin,
  enableCacheSweepers,
  enableHelpersPlugin,
  enablePermissionsPlugin,
  startBot,
} from "../../deps.ts";
import { validateCreateBotOptions } from "./AkumaKodoUtils.ts";
import { AkumaCreateBotOptions, AkumaKodoBotInterface } from "../interfaces/Client.ts";
import { AkumaKodoCollection } from "./utils/Collection.ts";
import { Milliseconds } from "./utils/Helpers.ts";
import { InternalCacheController } from "../../internal/controllers/cache.ts";
import { logger } from "../../internal/logger.ts";

/**
 * Creates a bot client and starts it.
 * This function is similar to a constructor, each option configures the bot client and its functions.
 * Almost everything is done in this create function, for configurations.
 * @param bot The bot interface from discordeno
 * @param options The options for the bot client
 * @returns The Bot
 */
export async function createAkumaKodoBot(
  bot: Bot,
  options?: AkumaCreateBotOptions,
): Promise<AkumaKodoBotInterface & CacheProps> {
  validateCreateBotOptions(options);

  // Creates the bot client with the cache plugin
  const internal_client = enableCachePlugin(createBot(
    <AkumaCreateBotOptions> {
      ...options,
    },
  )) as CacheProps & AkumaKodoBotInterface;

  // Enables the cache plugins
  enableHelpersPlugin(bot);
  enableCachePlugin(bot);
  enableCacheSweepers(bot as BotWithCache);
  enablePermissionsPlugin(bot as BotWithCache);

  // Initializes the bot values
  AkumaKodoBot.container.bot_owners_ids = options?.bot_owners_ids ?? [];
  AkumaKodoBot.container.bot_supporters_ids = options?.bot_supporters_ids ?? [];
  AkumaKodoBot.container.bot_staff_ids = options?.bot_staff_ids ?? [];
  AkumaKodoBot.container.bot_default_prefix = options?.bot_default_prefix ?? undefined;
  AkumaKodoBot.container.bot_development_server_id = options?.bot_development_server_id ?? undefined;
  AkumaKodoBot.container.bot_internal_logs = options?.bot_internal_logs ?? false;
  AkumaKodoBot.internalCacheController = new InternalCacheController();
  AkumaKodoBot.inhibitorCollection = new AkumaKodoCollection();
  AkumaKodoBot.taskCollection = new AkumaKodoCollection();
  AkumaKodoBot.monitorCollection = new AkumaKodoCollection();
  AkumaKodoBot.languageCollection = new AkumaKodoCollection();
  AkumaKodoBot.prefixCollection = new AkumaKodoCollection();
  AkumaKodoBot.argumentsCollection = new AkumaKodoCollection();
  AkumaKodoBot.messageCommands = new AkumaKodoCollection();
  AkumaKodoBot.slashCommands = new AkumaKodoCollection();
  AkumaKodoBot.ignoreCooldown = options?.bot_cooldown_bypass_ids ?? [];
  AkumaKodoBot.defaultCooldown = {
    seconds: Milliseconds.Second * 10,
    allowedUses: 1,
  };
  AkumaKodoBot.prefix = options?.bot_default_prefix ?? undefined;
  AkumaKodoBot.mentionWithPrefix = options?.bot_mention_with_prefix ?? false;
  AkumaKodoBot.runningTasks = {
    intervals: [],
    initialTimeouts: [],
  };
  AkumaKodoBot.logger = logger;
  AkumaKodoBot.fullyReady = false;

  // Start the bot
  await startBot(internal_client);
  return internal_client;
}

/**
 * The main bot client. You can access everything from here.
 */
export const AkumaKodoBot = createAkumaKodoBot as unknown as AkumaKodoBotInterface;

/**
 * Exports
 */

export * from "./utils/Collection.ts";
export * from "./utils/Embed.ts";
export * from "./utils/Component.ts";
export * from "./utils/Helpers.ts";
export * from "./task/mod.ts";
export * from "./messageCommands.ts"
export * from "./slashCommands.ts"