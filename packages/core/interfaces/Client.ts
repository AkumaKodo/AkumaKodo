import {
  BotWithCache,
  BotWithHelpersPlugin,
  CreateBotOptions,
  createGatewayManager,
  DiscordenoMessage,
} from "../../../deps.ts";
import { AkumaKodoCollection } from "../lib/utils/Collection.ts";
import { InteractionCommand, MessageCommand } from "./Command.ts";
import { _runningTaskInterface, Task } from "./Task.ts";
import { Argument } from "./Arugment.ts";

/** Extends default options for the bot client */
export interface AkumaCreateBotOptions extends CreateBotOptions {
  /** The ID's of the bot owners */
  bot_owners_ids?: (bigint | string)[];
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
  container: AkumaCreateBotOptions;
  prefixCollection: AkumaKodoCollection<bigint, string>;
  languageCollection: AkumaKodoCollection<bigint, string>;
  argumentsCollection: AkumaKodoCollection<string, Argument>;
  inhibitorCollection: AkumaKodoCollection<
    string,
    (
      message: DiscordenoMessage,
      // deno-lint-ignore no-explicit-any
      command: MessageCommand<any> | InteractionCommand,
    ) => boolean
  >;
  taskCollection: AkumaKodoCollection<string, Task>;
  runningTasks: _runningTaskInterface;
}
