import { DiscordenoUser, editMessage, fetchMembers, getMember, sendMessage } from "../../../../deps.ts";
import { AkumaKodoEmbed } from "./Embed.ts";
import { AkumaKodoBot } from "../AkumaKodo.ts";

export enum Milliseconds {
  Year = 1000 * 60 * 60 * 24 * 30 * 12,
  Month = 1000 * 60 * 60 * 24 * 30,
  Week = 1000 * 60 * 60 * 24 * 7,
  Day = 1000 * 60 * 60 * 24,
  Hour = 1000 * 60 * 60,
  Minute = 1000 * 60,
  Second = 1000,
}

export const SNOWFLAKE_REGEX = /[0-9]{17,19}/;

export function chooseRandom<T>(array: T[]) {
  return array[Math.floor(Math.random() * array.length)]!;
}

export function getUserTag(user: DiscordenoUser) {
  return `${user.username}#${user.discriminator.toString().padStart(4, "0")}`;
}

export function toTitleCase(text: string) {
  return text
    .split(" ")
    .map((
      word,
    ) => (word[0] ? `${word[0].toUpperCase()}${word.substring(1).toLowerCase()}` : word))
    .join(" ");
}

/** This function should be used when you want to convert milliseconds to a human readable format like 1d5h. */
export function humanizeMilliseconds(milliseconds: number) {
  const years = Math.floor(milliseconds / Milliseconds.Year);
  const months = Math.floor(
    (milliseconds % Milliseconds.Year) / Milliseconds.Month,
  );
  const weeks = Math.floor(
    ((milliseconds % Milliseconds.Year) % Milliseconds.Month) /
      Milliseconds.Week,
  );
  const days = Math.floor(
    (((milliseconds % Milliseconds.Year) % Milliseconds.Month) %
      Milliseconds.Week) / Milliseconds.Day,
  );
  const hours = Math.floor(
    ((((milliseconds % Milliseconds.Year) % Milliseconds.Month) %
      Milliseconds.Week) % Milliseconds.Day) /
      Milliseconds.Hour,
  );
  const minutes = Math.floor(
    (((((milliseconds % Milliseconds.Year) % Milliseconds.Month) %
      Milliseconds.Week) % Milliseconds.Day) %
      Milliseconds.Hour) /
      Milliseconds.Minute,
  );
  const seconds = Math.floor(
    ((((((milliseconds % Milliseconds.Year) % Milliseconds.Month) %
      Milliseconds.Week) % Milliseconds.Day) %
      Milliseconds.Hour) %
      Milliseconds.Minute) /
      Milliseconds.Second,
  );

  const YearString = years ? `${years}y ` : "";
  const monthString = months ? `${months}mo ` : "";
  const weekString = weeks ? `${weeks}w ` : "";
  const dayString = days ? `${days}d ` : "";
  const hourString = hours ? `${hours}h ` : "";
  const minuteString = minutes ? `${minutes}m ` : "";
  const secondString = seconds ? `${seconds}s ` : "";

  return (
    `${YearString}${monthString}${weekString}${dayString}${hourString}${minuteString}${secondString}`
      .trimEnd() || "1s"
  );
}

/** This function helps convert a string like 1d5h to milliseconds. */
export function stringToMilliseconds(text: string) {
  const matches = text.match(/\d+(y|mo|w|d|h|m|s){1}/gi);
  if (!matches) return;

  let total = 0;

  for (const match of matches) {
    // Finds the first of these letters
    const validMatch = /(y|mo|w|d|h|m|s)/.exec(match);
    // if none of them were found cancel
    if (!validMatch) return;
    // Get the number which should be before the index of that match
    const number = match.substring(0, validMatch.index);
    // Get the letter that was found
    const [letter] = validMatch;
    if (!number || !letter) return;

    let multiplier = Milliseconds.Second;
    switch (letter.toLowerCase()) {
      case "y":
        multiplier = Milliseconds.Year;
        break;
      case "mo":
        multiplier = Milliseconds.Month;
        break;
      case "w":
        multiplier = Milliseconds.Week;
        break;
      case "d":
        multiplier = Milliseconds.Day;
        break;
      case "h":
        multiplier = Milliseconds.Hour;
        break;
      case "m":
        multiplier = Milliseconds.Minute;
        break;
    }

    const amount = number ? parseInt(number, 10) : undefined;
    if (!amount) return;

    total += amount * multiplier;
  }

  return total;
}

export function chunkStrings(
  array: string[],
  size = 2000,
  lineSeperator = "\n",
) {
  const responses: string[] = [];
  let response = "";
  for (const text of array) {
    const nextText = response.length && lineSeperator ? `${lineSeperator}${text}` : text;
    if (response.length + nextText.length >= size) {
      responses.push(response);
      response = "";
    }
    response += nextText;
  }
  responses.push(response);
  return responses;
}

export const timestamps = {
  ShortTime: "t",
  LongTime: "T",
  ShortDate: "d",
  LongDate: "D",
  ShortDateTime: "f",
  LongDateTime: "F",
  Relative: "R",
} as const;

export function snowflakeToTimestamp(id: bigint) {
  return Number(id / 4194304n + 1420070400000n);
}

/** Use this function to send an embed with ease. */
export function sendEmbed(channelId: bigint, embed: AkumaKodoEmbed) {
  return sendMessage(AkumaKodoBot, channelId, {
    embeds: [embed],
  });
}

/** Use this function to edit an embed with ease. */
export function editEmbed(channelId: bigint, messageId: bigint, embed: AkumaKodoEmbed) {
  return editMessage(AkumaKodoBot, channelId, messageId, {
    embeds: [embed],
  });
}

export const DISCORD_TIME_FORMATS = {
  "Short Time": "t",
  "Long Time": "T",
  "Short Date": "d",
  "Long Date": "D",
  "Short Date/Time": "f",
  "Long Date/Time": "F",
  "Relative Time": "R",
};

export type DISCORD_TIME_TYPES = keyof typeof DISCORD_TIME_FORMATS;

/**
 * Creates a discord timestamp formatted string.
 *
 * `Date` can be unix timestamp (`number`) or `Date`
 *
 * **Formats**:
 *
 * **Short Time** - 16:20
 *
 * **Long Time** - 16:20:30
 *
 * **Short Date** - 20/04/2021 ( Default format )
 *
 * **Long Date** - 20 April 2021
 *
 * **Short Date/Time** - 20 April 2021 16:20
 *
 * **Long Date/Time** - Tuesday, 20 April 2021 16:20
 *
 * **Relative Time** - 2 months ago
 */

export function dateToDiscordTimestamp(date: Date | number, format?: DISCORD_TIME_TYPES): string {
  const value = date instanceof Date ? Math.floor(date.getTime() / 1000) : date;

  return `<t:${value}${format ? `:${DISCORD_TIME_FORMATS[format]}` : ""}>`;
}

export function snowflakeToBigint(snowflake: string) {
  return BigInt(snowflake) | 0n;
}

export function bigintToSnowflake(snowflake: bigint) {
  return snowflake === 0n ? "" : snowflake.toString();
}

export async function fetchMember(guildId: bigint, id: bigint | string) {
  const userId = typeof id === "string"
    ? id.startsWith("<@") ? BigInt(id.substring(id.startsWith("<@!") ? 3 : 2, id.length - 1)) : BigInt(id)
    : id;

  const guild = AkumaKodoBot.guilds.get(guildId);
  if (!guild) return;

  const cachedMember = AkumaKodoBot.members.get(userId);
  if (cachedMember) return cachedMember;

  const shardId = calculateShardId(guildId);

  const shard = AkumaKodoBot.ws.shards.get(shardId);
  // When gateway is dying
  if (shard?.queueCounter && shard.queueCounter > 110) {
    return getMember(AkumaKodoBot, guildId, userId).catch(() => undefined);
  }

  // Fetch from gateway as it is much better than wasting limited HTTP calls.
  return await fetchMembers(AkumaKodoBot, guildId, shardId, {
    userIds: [userId],
    limit: 1,
  }).catch(() => undefined);
}

export function calculateShardId(guildId: bigint) {
  if (AkumaKodoBot.ws.maxShards === 1) return 0;

  return Number((guildId >> 22n) % BigInt(AkumaKodoBot.ws.maxShards - 1));
}
