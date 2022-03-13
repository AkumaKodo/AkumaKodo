import { AkumaKodoBot } from "../../core/lib/AkumaKodo.ts";

/**
 * CacheController
 * @author ThatGuyJamal
 */
export class CacheController {
  public channels = AkumaKodoBot.channels;
  public guilds = AkumaKodoBot.guilds;
  public users = AkumaKodoBot.members;
  public messages = AkumaKodoBot.messages;
  public presences = AkumaKodoBot.presences;
  public dispatchedGuildIds = AkumaKodoBot.dispatchedGuildIds;
  public dispatchedChannelIds = AkumaKodoBot.dispatchedChannelIds;
  public activeGuildIds = AkumaKodoBot.activeGuildIds;
}
