import {AkumaKomoBot} from "../AkumaKodo.ts";
import {snowflakeToBigint} from "../utils/Helpers.ts";
import {ChannelTypes} from "../../../../deps.ts";


AkumaKomoBot.argumentsCollection.set('textchannel', {
    name: "textchannel",
    execute: (_argument, params, message) => {
        const [id] = params;
        if (!id) return;

        const guild = AkumaKomoBot.guilds.get(message.id);
        if (!guild) return;

        const channelIdOrName = id.startsWith("<#") ? id.substring(2, id.length - 1) : id.toLowerCase();

        const channel = /^[\d+]{17,}$/.test(channelIdOrName)
            ? AkumaKomoBot.channels.get(snowflakeToBigint(channelIdOrName))
            : AkumaKomoBot.channels.find((channel) => channel.name === channelIdOrName && channel.guildId === guild.id);

        if (channel?.type !== ChannelTypes.GuildText) return;

        return channel;
    },
})

AkumaKomoBot.argumentsCollection.set('voicechannel', {
    name: "voicechannel",
    execute: (_argument, params, message) => {
        const [id] = params;
        if (!id) return;

        const guild = cache.guilds.get(message.id);
        if (!guild) return;

        const channelIdOrName = id.startsWith("<#") ? id.substring(2, id.length - 1) : id.toLowerCase();

        const channel = /^[\d+]{17,}$/.test(channelIdOrName)
            ? AkumaKomoBot.channels.get(snowflakeToBigint(channelIdOrName))
            : AkumaKomoBot.channels.find((channel) => channel.name === channelIdOrName && channel.guildId === guild.id);

        if (channel?.type !== ChannelTypes.GuildVoice && channel?.type !== ChannelTypes.GuildStageVoice) {
            return;
        }

        return channel;
    },
})

AkumaKomoBot.argumentsCollection.set('newschannel', {
    name: "newschannel",
    execute: (_argument, params, message) => {
        const [id] = params;
        if (!id) return;

        const guild = cache.guilds.get(message.id);
        if (!guild) return;

        const channelIdOrName = id.startsWith("<#") ? id.substring(2, id.length - 1) : id.toLowerCase();

        const channel = /^[\d+]{17,}$/.test(channelIdOrName)
            ? AkumaKomoBot.channels.get(snowflakeToBigint(channelIdOrName))
            : AkumaKomoBot.channels.find((channel) => channel.name === channelIdOrName && channel.guildId === guild.id);

        if (channel?.type !== ChannelTypes.GuildNews) return;

        return channel;
    },
})