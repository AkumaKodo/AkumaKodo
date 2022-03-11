/** Options for the bot client */
import {
  Bot,
  BotWithCache,
  BotWithHelpersPlugin,
  CacheProps,
  createBot,
  CreateBotOptions,
  createGatewayManager,
  enableCachePlugin,
  enableCacheSweepers,
  enableHelpersPlugin,
  enablePermissionsPlugin,
  startBot,
} from "../../../deps.ts";

/** Extends default options for the bot client */
interface AkumaCreateBotOptions extends CreateBotOptions {
  /** The ID's of the bot owners */
  bot_owners_ids?: bigint[];
  /** The ID's of the bot supporters */
  bot_supporters_ids?: bigint[];
  /** The ID's of the bot staff */
  bot_staff_ids?: bigint[];
}

/**
 * Interface for all our custom bot options.
 * All options are invoked on the main bot object for easy access.
 */
interface AkumaKomoBotInterface extends BotWithCache<BotWithHelpersPlugin> {
  /** Allows access to the gateway manager */
  ws: ReturnType<typeof createGatewayManager>;
  /** Prefix for the bot to use on message commands */
  bot_prefix?: string;
}

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
  await startBot(internal_client);
  return internal_client;
}

/**
 * The main bot client. You can access everything from here.
 */
const AkumaKomoBot = createAkumaKomoBot as AkumaKomoBotInterface;

export { AkumaCreateBotOptions, AkumaKomoBot, AkumaKomoBotInterface };
