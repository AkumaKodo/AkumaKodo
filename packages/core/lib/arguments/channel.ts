import { AkumaKodoBot } from "../AkumaKodo.ts";
import { snowflakeToBigint } from "../utils/Helpers.ts";
import { ChannelTypes } from "../../../../deps.ts";

AkumaKodoBot.argumentsCollection.set("textchannel", {
  name: "textchannel",
  execute: (_argument, params, message) => {
    const [id] = params;
    if (!id) return;

    const guild = AkumaKodoBot.guilds.get(message.id);
    if (!guild) return;

    const channelIdOrName = id.startsWith("<#") ? id.substring(2, id.length - 1) : id.toLowerCase();

    const channel = /^[\d+]{17,}$/.test(channelIdOrName)
      ? AkumaKodoBot.channels.get(snowflakeToBigint(channelIdOrName))
      : AkumaKodoBot.channels.find((channel) => channel.name === channelIdOrName && channel.guildId === guild.id);

    if (channel?.type !== ChannelTypes.GuildText) return;

    return channel;
  },
});

AkumaKodoBot.argumentsCollection.set("voicechannel", {
  name: "voicechannel",
  execute: (_argument, params, message) => {
    const [id] = params;
    if (!id) return;

    const guild = AkumaKodoBot.guilds.get(message.id);
    if (!guild) return;

    const channelIdOrName = id.startsWith("<#") ? id.substring(2, id.length - 1) : id.toLowerCase();

    const channel = /^[\d+]{17,}$/.test(channelIdOrName)
      ? AkumaKodoBot.channels.get(snowflakeToBigint(channelIdOrName))
      : AkumaKodoBot.channels.find((channel) => channel.name === channelIdOrName && channel.guildId === guild.id);

    if (channel?.type !== ChannelTypes.GuildVoice && channel?.type !== ChannelTypes.GuildStageVoice) {
      return;
    }

    return channel;
  },
});

AkumaKodoBot.argumentsCollection.set("newschannel", {
  name: "newschannel",
  execute: (_argument, params, message) => {
    const [id] = params;
    if (!id) return;

    const guild = AkumaKodoBot.guilds.get(message.id);
    if (!guild) return;

    const channelIdOrName = id.startsWith("<#") ? id.substring(2, id.length - 1) : id.toLowerCase();

    const channel = /^[\d+]{17,}$/.test(channelIdOrName)
      ? AkumaKodoBot.channels.get(snowflakeToBigint(channelIdOrName))
      : AkumaKodoBot.channels.find((channel) => channel.name === channelIdOrName && channel.guildId === guild.id);

    if (channel?.type !== ChannelTypes.GuildNews) return;

    return channel;
  },
});

AkumaKodoBot.argumentsCollection.set("categorychannel", {
  name: "categorychannel",
  execute: (_argument, params, message) => {
    const [id] = params;
    if (!id) return;

    const guild = AkumaKodoBot.guilds.get(message.id);
    if (!guild) return;

    const channelIdOrName = id.startsWith("<#") ? id.substring(2, id.length - 1) : id.toLowerCase();

    const channel = /^[\d+]{17,}$/.test(channelIdOrName)
      ? AkumaKodoBot.channels.get(snowflakeToBigint(channelIdOrName))
      : AkumaKodoBot.channels.find((channel) => channel.name === channelIdOrName && channel.guildId === guild.id);

    if (channel?.type !== ChannelTypes.GuildCategory) return;

    return channel;
  },
});
