import { AkumaKodoCollection } from "../Collection.ts";
import {
  Bot,
  DiscordenoChannel,
  DiscordenoGuild,
  DiscordenoMember,
  DiscordenoMessage,
  DiscordenoPresence,
  DiscordenoUser,
} from "../../../deps.ts";

export type BotWithCache<B extends Bot = Bot> = B & CacheProps;

export interface CacheProps extends Bot {
  guilds: AkumaKodoCollection<bigint, DiscordenoGuild>;
  users: AkumaKodoCollection<bigint, DiscordenoUser>;
  members: AkumaKodoCollection<bigint, DiscordenoMember>;
  channels: AkumaKodoCollection<bigint, DiscordenoChannel>;
  messages: AkumaKodoCollection<bigint, DiscordenoMessage>;
  presences: AkumaKodoCollection<bigint, DiscordenoPresence>;
  dispatchedGuildIds: Set<bigint>;
  dispatchedChannelIds: Set<bigint>;
  activeGuildIds: Set<bigint>;
}

export function addCacheCollections<B extends Bot>(bot: B): BotWithCache<B> {
  const cacheBot = bot as BotWithCache<B>;
  cacheBot.guilds = new AkumaKodoCollection();
  cacheBot.users = new AkumaKodoCollection();
  cacheBot.members = new AkumaKodoCollection();
  cacheBot.channels = new AkumaKodoCollection();
  cacheBot.messages = new AkumaKodoCollection();
  cacheBot.presences = new AkumaKodoCollection();
  cacheBot.dispatchedGuildIds = new Set();
  cacheBot.dispatchedChannelIds = new Set();
  cacheBot.activeGuildIds = new Set();

  return bot as BotWithCache<B>;
}
