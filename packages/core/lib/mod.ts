/** Options for the bot client */
import { Bot, createBot, CreateBotOptions, startBot } from "https://deno.land/x/discordeno@13.0.0-rc20/bot.ts";
import { createGatewayManager } from "https://deno.land/x/discordeno@13.0.0-rc20/gateway/gateway_manager.ts";
import { BotWithHelpersPlugin, enableHelpersPlugin } from "https://deno.land/x/discordeno_helpers_plugin@0.0.8/mod.ts";
import {
  BotWithCache,
  CacheProps,
} from "https://deno.land/x/discordeno_cache_plugin@0.0.21/src/addCacheCollections.ts";
import enableCachePlugin, { enableCacheSweepers } from "https://deno.land/x/discordeno_cache_plugin@0.0.21/mod.ts";
import enablePermissionsPlugin from "https://deno.land/x/discordeno_permissions_plugin@0.0.15/mod.ts";

// Local exports
export * from "../../internal/controllers/mod.ts";

/** Extends default options for the bot client */
interface create_bot_options extends CreateBotOptions {
  /** The ID's of the bot owners */
  bot_owners_ids?: bigint[];
  /** The ID's of the bot supporters */
  bot_supporters_ids?: bigint[];
  /** The ID's of the bot staff */
  bot_staff_ids?: bigint[];
  /**
   * If caching is enabled in the framework. If disabled you will have to cache things yourself.
   * Default: true
   */
  cache_by_default?: boolean;
}

/**
 * Interface for all our custom bot options.
 * All options are invoked on the main bot object for easy access.
 */
interface extended_bot_client extends Bot {
  /** Allows access to the gateway manager */
  ws: ReturnType<typeof createGatewayManager>;
}

/**
 * Interface for all our custom bot options.
 * All options are invoked on the main bot object for easy access.
 */
interface extended_bot_client_cached extends BotWithCache<BotWithHelpersPlugin> {
  /** Allows access to the gateway manager */
  ws: ReturnType<typeof createGatewayManager>;
  default_prefix?: string;
}

/**
 * Creates a bot client and starts it.
 * This function is similar to a constructor, each option configures the bot client and its functions.
 * Almost everything is done in this create function, for configurations.
 * @param bot
 * @link https://deno.land/x/discordeno@13.0.0-rc20/bot.ts#L270
 * @param options
 * @param login if you want to log in the bot. default: true
 * @link https://deno.land/x/discordeno@13.0.0-rc20/bot.ts#L70
 * @returns The Bot
 */
export async function createAkumaKomoBot(
  bot: extended_bot_client_cached | extended_bot_client,
  options?: create_bot_options,
  login?: boolean = true,
): Promise<extended_bot_client_cached | extended_bot_client> {
  let cache_option = options.cache_by_default ?? true;
  if (cache_option) {
    // Creates the bot client with the cache plugin
    const internal_cached_client = enableCachePlugin(createBot(bot, {
      ...options,
    })) as CacheProps & extended_bot_client_cached;
    // Enables the cache plugins
    enableHelpersPlugin(bot);
    enableCachePlugin(bot);
    enableCacheSweepers(bot as BotWithCache);
    enablePermissionsPlugin(bot as BotWithCache);
    if (login) await startBot(internal_cached_client);
    return internal_cached_client;
  } else {
    // Create a new bot client
    const internal_client = createBot(bot, {
      ...options,
      ws: bot.gateway,
    }) as extended_bot_client;
    if (login) await startBot(internal_client);
    return internal_client;
  }
}

/** If you want to use the cached bot options, you can use this function */
export const AkumaKomoBotWithCache = createAkumaKomoBot as extended_bot_client_cached;

/** If you want to use the non cached bot options, you can use this function */
export const AkumaKomoBot = createAkumaKomoBot as extended_bot_client;
