import { AkumaKomoBotWithCache } from "../../core/lib/mod.ts";

/**
 * CacheController
 * @author ThatGuyJamal
 */
export class CacheController {
  public channels = AkumaKomoBotWithCache.channels;
  public guilds = AkumaKomoBotWithCache.guilds;
  public users = AkumaKomoBotWithCache.members;
  public messages = AkumaKomoBotWithCache.messages;
  public presences = AkumaKomoBotWithCache.presences;
  public dispatchedGuildIds = AkumaKomoBotWithCache.dispatchedGuildIds;
  public dispatchedChannelIds = AkumaKomoBotWithCache.dispatchedChannelIds;
  public activeGuildIds = AkumaKomoBotWithCache.activeGuildIds;
}
