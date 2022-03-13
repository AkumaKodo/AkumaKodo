import { AkumaKodoBot } from "../../core/lib/AkumaKodo.ts";
import {
  DiscordenoChannel,
  DiscordenoGuild,
  DiscordenoMember,
  DiscordenoMessage,
  DiscordenoPresence,
} from "../../deps.ts";

/**
 * CacheController
 * @author ThatGuyJamal
 */
export class InternalCacheController {
  public channels = AkumaKodoBot.channels;
  public guilds = AkumaKodoBot.guilds;
  public users = AkumaKodoBot.members;
  public messages = AkumaKodoBot.messages;
  public presences = AkumaKodoBot.presences;
  public dispatchedGuildIds = AkumaKodoBot.dispatchedGuildIds;
  public dispatchedChannelIds = AkumaKodoBot.dispatchedChannelIds;
  public activeGuildIds = AkumaKodoBot.activeGuildIds;

  /**
   * Get a channel by ID
   * @param id The ID of the channel
   */
  public getChannel(id: bigint): DiscordenoChannel | undefined {
    return this.channels.get(id);
  }

  /**
   * Get a guild by ID
   * @param id The ID of the guild
   */
  public getGuild(id: bigint): DiscordenoGuild | undefined {
    return this.guilds.get(id);
  }

  /**
   * Get a user by ID
   * @param id The ID of the user
   */
  public getUser(id: bigint): DiscordenoMember | undefined {
    return this.users.get(id);
  }

  /**
   * Get a message by ID
   * @param id The ID of the message
   */
  public getMessage(id: bigint): DiscordenoMessage | undefined {
    return this.messages.get(id);
  }

  /**
   * Get a presence by ID
   * @param id The ID of the presence
   */
  public getPresence(id: bigint): DiscordenoPresence | undefined {
    return this.presences.get(id);
  }

  public get getDispatchedGuildIds(): Set<bigint> {
    return this.dispatchedGuildIds;
  }

  public get getDispatchedChannelIds(): Set<bigint> {
    return this.dispatchedChannelIds;
  }

  public get getActiveGuildIds(): Set<bigint> {
    return this.activeGuildIds;
  }
}
