import { AkumaKomoBot } from "../AkumaKodo.ts";
import { snowflakeToBigint } from "../utils/Helpers.ts";
import {ChannelTypes} from "../../../../deps.ts";

const textChannelTypes = [
    ChannelTypes.GuildText,
    ChannelTypes.GuildNews,
    ChannelTypes.GuildNewsThread,
    ChannelTypes.GuildPrivateThread,
    ChannelTypes.GuildPublicThread,
];

AkumaKomoBot.argumentsCollection.set("guild", {
  name: "guild",
  execute: (_argument, params)=> {
    const [id] = params;
    if (!id) return;

    return AkumaKomoBot.guilds.get(snowflakeToBigint(id));
  },
});

AkumaKomoBot.argumentsCollection.set('guildtextchannel', {
  name: 'guildtextchannel',
    execute: (_argument, params, message)=> {
        const [id] = params;
        if (!id) return;

        const guild = AkumaKomoBot.guilds.get(message.id);
        if (!guild) return;

        const channelIdOrName = id.startsWith("<#") ? id.substring(2, id.length - 1) : id.toLowerCase();

        const channel = /^[\d+]{17,}$/.test(channelIdOrName)
            ? AkumaKomoBot.channels.get(snowflakeToBigint(channelIdOrName))
            : AkumaKomoBot.channels.find((channel) => channel.name === channelIdOrName && channel.guildId === guild.id);

        if (channel?.type === undefined || !textChannelTypes.includes(channel.type)) {
            return;
        }

        return channel;
    },
})