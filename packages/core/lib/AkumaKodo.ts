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
} from "../../../deps.ts";
import { validateCreateBotOptions } from "./AkumaKodoUtils.ts";
import { AkumaCreateBotOptions, AkumaKomoBotInterface } from "../interfaces/Client.ts";
import { AkumaKodoCollection } from "./utils/Collection.ts";

/**
 * Creates a bot client and starts it.
 * This function is similar to a constructor, each option configures the bot client and its functions.
 * Almost everything is done in this create function, for configurations.
 * @param bot The bot interface from discordeno
 * @param options The options for the bot client
 * @returns The Bot
 */
export async function createAkumaKomoBot(
  bot: Bot,
  options?: AkumaCreateBotOptions,
): Promise<AkumaKomoBotInterface & CacheProps> {
  validateCreateBotOptions(options);

  // Creates the bot client with the cache plugin
  const internal_client = enableCachePlugin(createBot(
    <AkumaCreateBotOptions> {
      ...options,
    },
  )) as CacheProps & AkumaKomoBotInterface;

  // Enables the cache plugins
  enableHelpersPlugin(bot);
  enableCachePlugin(bot);
  enableCacheSweepers(bot as BotWithCache);
  enablePermissionsPlugin(bot as BotWithCache);

  // Initializes the bot values
  AkumaKomoBot.container.bot_owners_ids = options?.bot_owners_ids ?? [];
  AkumaKomoBot.container.bot_supporters_ids = options?.bot_supporters_ids ?? [];
  AkumaKomoBot.container.bot_staff_ids = options?.bot_staff_ids ?? [];
  AkumaKomoBot.container.bot_default_prefix = options?.bot_default_prefix ?? undefined;
  AkumaKomoBot.container.bot_development_server_id = options?.bot_development_server_id ?? undefined;
  AkumaKomoBot.inhibitor = new AkumaKodoCollection();
  AkumaKomoBot.task = new AkumaKodoCollection();
  AkumaKomoBot.languageCollection = new AkumaKodoCollection();
  AkumaKomoBot.prefixCollection = new AkumaKodoCollection();
  // Start the bot
  await startBot(internal_client);
  return internal_client;
}

/**
 * The main bot client. You can access everything from here.
 */
export const AkumaKomoBot = createAkumaKomoBot as unknown as AkumaKomoBotInterface;
