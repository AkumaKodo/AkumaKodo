import { AkumaKomoBot } from "../AkumaKodo.ts";
import { defaultEmojis, emojiUnicode } from "../utils/internal_emojis.ts";

AkumaKomoBot.argumentsCollection.set("emoji", {
  name: "emoji",
  execute: (_argument, params, message) => {
    if (!params.length) return;

    const emojis = params.map((e) =>
      e.startsWith("<:") || e.startsWith("<a:") ? BigInt(e.substring(e.lastIndexOf(":") + 1, e.length - 1)) : BigInt(e)
    );

    return emojis
      .map((emoji) => {
        if (defaultEmojis.has(String(emoji))) return emoji;

        let guildEmoji = AkumaKomoBot.guilds.get(message.id)?.emojis.find((e) => e.id === emoji) as any;
        if (!guildEmoji) {
          for (const guild of AkumaKomoBot.guilds.values()) {
            const global_emoji = guild.emojis.find((e) => e.id === emoji);
            if (!global_emoji?.id) continue;

            guildEmoji = global_emoji;
            break;
          }
        }

        if (!guildEmoji) return;

        return emojiUnicode(guildEmoji);
      })
      .filter((e) => e);
  },
});

AkumaKomoBot.argumentsCollection.set("...emojis", {
  name: "...emojis",
  execute: (_argument, params, message) => {
    let [id] = params;
    if (!id) return;

    if (defaultEmojis.has(id)) return id;

    if (id.startsWith("<:") || id.startsWith("<a:")) {
      id = id.substring(id.lastIndexOf(":") + 1, id.length - 1);
    }

    let emoji = AkumaKomoBot.guilds.get(message.id)?.emojis.find((e) => e.id === BigInt(id)) as any;
    if (!emoji) {
      for (const guild of AkumaKomoBot.guilds.values()) {
        const global_emoji = guild.emojis.find((e) => e.id === BigInt(id));
        if (!global_emoji) continue;

        emoji = global_emoji;
        break;
      }

      if (!emoji) return;
    }

    return emojiUnicode(emoji);
  },
});
