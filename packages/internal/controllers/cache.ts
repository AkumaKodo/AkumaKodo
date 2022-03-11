import { AkumaKomoBot } from "../../core/lib/mod.ts";

/**
 * CacheController
 * @author ThatGuyJamal
 */
export class CacheController {
  public channels = AkumaKomoBot.channels;
  public guilds = AkumaKomoBot.guilds;
  public users = AkumaKomoBot.members;
  public messages = AkumaKomoBot.messages;
  public presences = AkumaKomoBot.presences;
  public dispatchedGuildIds = AkumaKomoBot.dispatchedGuildIds;
  public dispatchedChannelIds = AkumaKomoBot.dispatchedChannelIds;
  public activeGuildIds = AkumaKomoBot.activeGuildIds;
}
