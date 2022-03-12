import { AkumaKomoBot } from "../AkumaKodo.ts";
import { stringToMilliseconds } from "../utils/Helpers.ts";

const SNOWFLAKE_REGEX = /[0-9]{17,19}/;

AkumaKomoBot.argumentsCollection.set("boolean", {
  name: "boolean",
  execute: function (_, params) {
    const [boolean] = params;

    if (["true", "false", "on", "off", "enable", "disable"].includes(boolean)) {
      return ["true", "on", "enable"].includes(boolean);
    }
  },
});

AkumaKomoBot.argumentsCollection.set("snowflake", {
  name: "snowflake",
  execute: function (_, params) {
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
  execute: function (_argument, parameters) {
    const [time] = parameters;
    if (!time) return;

    return stringToMilliseconds(time);
  },
});

AkumaKomoBot.argumentsCollection.set("...snowflakes", {
  name: "...snowflakes",
  execute: function (_, params) {
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
