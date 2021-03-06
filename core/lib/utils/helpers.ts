import { DiscordenoUser } from "../../../deps.ts";

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
        ) => (word[0]
            ? `${word[0].toUpperCase()}${word.substring(1).toLowerCase()}`
            : word)
        )
        .join(" ");
}

/** This function should be used when you want to convert milliseconds to a human-readable format like 1d5h. */
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
        const nextText = response.length && lineSeperator
            ? `${lineSeperator}${text}`
            : text;
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

export function dateToDiscordTimestamp(
    date: Date | number,
    format?: DISCORD_TIME_TYPES,
): string {
    const value = date instanceof Date
        ? Math.floor(date.getTime() / 1000)
        : date;

    return `<t:${value}${format ? `:${DISCORD_TIME_FORMATS[format]}` : ""}>`;
}

export function snowflakeToBigint(snowflake: string) {
    return BigInt(snowflake) | 0n;
}

export function bigintToSnowflake(snowflake: bigint) {
    return snowflake === 0n ? "" : snowflake.toString();
}

// Length starts from the index
export function shortenArray<T>(
    array: T[],
    length: number,
    startIndex = 0,
): T[] {
    return array.slice(startIndex, startIndex + length);
}
export function getEnumKeyFromEnumValue<T>(
    enumx: T,
    value: T[keyof T],
): keyof T | undefined {
    const foundKey = Object.keys(enumx).find((e) =>
        enumx[e as keyof T] == value
    );
    return foundKey as keyof T | undefined;
}
/** Allows easy way to add a prop to a base object when needing to use complicated getters solution. */
// deno-lint-ignore no-explicit-any
export function createNewProp(value: any): PropertyDescriptor {
    // Source: 2021 Discordeno - https://github.com/discordeno/discordeno/blob/37d63133dccd83f46a375192dbc779ce36a379db/src/util/utils.ts#L27
    return { configurable: true, enumerable: true, writable: true, value };
}
// Length starts from the index
export function shortenString(
    text: string,
    length: number,
    startIndex = 0,
): string {
    if (startIndex + text.length < length) return text;
    return text.substring(startIndex, startIndex + length);
}

/* Separates an array into parts */
export function separateArray<T>(
    array: T[],
    chunkSize: number,
    affectOriginalArray = false,
): T[][] {
    // Clone the array to not affect the original one
    if (!affectOriginalArray) array = array.slice();
    const results: T[][] = [];
    while (array.length > 0) {
        results.push([...array.splice(0, chunkSize)]);
    }
    return results;
}
export function createMentionString(
    id: string | bigint,
    type: "channel" | "user",
) {
    return type === "channel" ? `<#${id}>` : `<@!${id}>`;
}
export type caseConvertingTypes = "lowercase" | "capitalize" | "uppercase";
/** Convert word cases.
 *
 * **lowercase** - `hello world`
 *
 * **capitalize** - `Hello World`
 *
 * **uppercase** - `HELLO WORLD`
 */
export function convertCase(str: string, type: caseConvertingTypes): string {
    return type === "lowercase"
        ? str.toLowerCase()
        : type === "uppercase"
        ? str.toUpperCase()
        : str
            .split(" ")
            .map((word) => (!word[0]
                ? word
                : `${word[0].toUpperCase()}${word.substring(1).toLowerCase()}`)
            )
            .join(" ");
}
