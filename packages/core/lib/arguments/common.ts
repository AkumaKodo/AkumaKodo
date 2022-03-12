// AkumaKomoBot.argumentsCollection.set('', {
//   name: "",
//   execute: (_argument, params, message) => {
//
//   },
// })

import { AkumaKomoBot } from "../AkumaKodo.ts";
import { fetchMember, snowflakeToBigint, stringToMilliseconds } from "../utils/Helpers.ts";

const SNOWFLAKE_REGEX = /[0-9]{17,19}/;

AkumaKomoBot.argumentsCollection.set("boolean", {
  name: "boolean",
  execute: (_, params) => {
    const [boolean] = params;

    if (["true", "false", "on", "off", "enable", "disable"].includes(boolean)) {
      return ["true", "on", "enable"].includes(boolean);
    }
  },
});

AkumaKomoBot.argumentsCollection.set("snowflake", {
  name: "snowflake",
  execute: (_, params) => {
    let [text] = params;
    if (!text) return;
    // If it's a nickname mention or role mention
    if (text.startsWith("<@!") || text.startsWith("<@&")) {
      text = text.substring(3, text.length - 1);
    }
    // If it's a user mention or channel mention
    if (text.startsWith("<@") || text.startsWith("<#")) {
      text = text.substring(2, text.length - 1);
    }

    if (text.length < 17 || text.length > 19) return;

    return SNOWFLAKE_REGEX.test(text) ? text : undefined;
  },
});

AkumaKomoBot.argumentsCollection.set("duration", {
  name: "duration",
  execute: (_argument, parameters) => {
    const [time] = parameters;
    if (!time) return;

    return stringToMilliseconds(time);
  },
});

AkumaKomoBot.argumentsCollection.set("...snowflakes", {
  name: "...snowflakes",
  execute: (_, params) => {
    const cleaned = params.map((p) => {
      // If its just a normal id number
      if (!p.startsWith("<")) return p;
      // If its a nickname mention or role mention
      if (p.startsWith("<@!") || p.startsWith("<@&")) {
        return p.substring(3, p.length - 1);
      }
      // If it's a user mention or channel mention
      if (p.startsWith("<@") || p.startsWith("<#")) {
        return p.substring(2, p.length - 1);
      }

      // Unknown
      return p;
    });

    return cleaned.filter((text) => SNOWFLAKE_REGEX.test(text));
  },
});

AkumaKomoBot.argumentsCollection.set("number", {
  name: "number",
  execute: (argument, params) => {
    const [number] = params;

    const valid = Number(number);
    if (!valid) return;

    if (valid < (argument.minimum || 0)) return;
    if (argument.maximum && valid > argument.maximum) return;
    if (!argument.allowDecimals) return Math.floor(valid);

    if (valid) return valid;
  },
});

AkumaKomoBot.argumentsCollection.set("member", {
  name: "member",
  execute: (_argument, params, message) => {
    const [id] = params;
    if (!id) return;

    const guild = AkumaKomoBot.guilds.get(message.id);
    if (!guild) return;

    const userId = id.startsWith("<@") ? id.substring(id.startsWith("<@!") ? 3 : 2, id.length - 1) : id;

    if (/^[\d+]{17,}$/.test(userId)) {
      const cachedMember = AkumaKomoBot.members.get(snowflakeToBigint(userId));
      if (cachedMember?.guilds.has(message.id)) return cachedMember;
    }

    const cached = AkumaKomoBot.members.find(
      (member) => member.guilds.has(message.id) && member.tag.toLowerCase().startsWith(userId.toLowerCase()),
    );
    if (cached) return cached;

    if (!/^[\d+]{17,}$/.test(userId)) return;

    log.debug("Fetching a member with Id from gateway", userId);

    return await fetchMember(guild.id, userId);
  },
});
