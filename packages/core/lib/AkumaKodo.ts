/** Options for the bot client */
import {
  Bot,
  BotWithHelpersPlugin,
  CacheProps,
  createBot,
  CreateBotOptions, createGatewayManager, enableHelpersPlugin,
  enablePermissionsPlugin,
  startBot,
} from "../../../deps.ts";
import {BotWithCache, enableCachePlugin, enableCacheSweepers} from "../../internal/cache/mod.ts";
import {validateCreateBotOptions} from "./AkumaKodoUtils.ts";
import {Collection} from "../../internal/Collection.ts";

/** Extends default options for the bot client */
export interface AkumaCreateBotOptions extends CreateBotOptions {
  /** The ID's of the bot owners */
  bot_owners_ids?: bigint[];
  /** The ID's of the bot supporters */
  bot_supporters_ids?: bigint[];
  /** The ID's of the bot staff */
  bot_staff_ids?: bigint[];
  bot_default_prefix?: string;
  /** The development server for your bot */
  bot_development_server_id?: bigint;

}

/**
 * Interface for all our custom bot options.
 * All options are invoked on the main bot object for easy access.
 */
export interface AkumaKomoBotInterface extends BotWithCache<BotWithHelpersPlugin> {
  /** Allows access to the gateway manager */
  ws: ReturnType<typeof createGatewayManager>;
  /** Container for bot config options */
  container: AkumaCreateBotOptions
  prefixCollection: Collection<bigint, string>
  languageCollection: Collection<bigint, string>
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

  await startBot(internal_client);
  return internal_client;
}

/**
 * The main bot client. You can access everything from here.
 */
export const AkumaKomoBot = createAkumaKomoBot as unknown as AkumaKomoBotInterface;
