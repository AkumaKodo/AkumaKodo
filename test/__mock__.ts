import { AkumaKodoBotCore } from "../core/AkumaKodo.ts";
import { delay, dotEnvConfig } from "../deps.ts";

const env = dotEnvConfig({ export: true });
const TOKEN = env.DISCORD_BOT_TOKEN || "";

if (!TOKEN) {
    throw new Error("Token now found!");
}

export const Bot = new AkumaKodoBotCore({
    botId: BigInt("946398697254703174"),
    events: {},
    intents: ["Guilds", "GuildMessages", "GuildMembers"],
    token: TOKEN,
}, {
    optional: {
        bot_debug_mode: true,
        providers: {
            type: "disabled",
        },
    },
    required: {
        bot_development_server_id: BigInt("946461976408764476"),
    },
});

await Bot.createBot();

Bot.instance.events.messageCreate = async (_, payload) => {
    if (payload.content === "typescript-spammer") {
        const pSpam: number[] = [];
        for (let i = 0; i < 50; i++) {
            delay(3000);
            await Bot.instance.helpers.sendMessage(payload.channelId, {
                content: `typescript-spammer #${i}`,
            });
            Bot.container.logger.debug("table", "Spammer v1", `Spamming #${i}`);
            pSpam.push(i);
        }
        await Bot.instance.helpers.sendMessage(payload.channelId, {
            content: `\`typescript-spammer complete!\``,
        });
        // Bot.container.logger.create("info", "message Create", `Spam command ran in ${payload.channelId}`);
    } else if (payload.content === "ping") {
        await Bot.instance.helpers.sendMessage(payload.channelId, {
            content: "pong!",
        });
    }
};

Bot.instance.events.ready = (_, _payload) => {
    Bot.container.logger.log("info", "ready", "Online and ready to work!");
};

Bot.container.utils.createCommand(Bot, {
    trigger: "ping",
    description: "ping pong me!",
    scope: "Development",
    run: async (interaction) => {
        await Bot.container.utils.createCommandReply(Bot, interaction, {
            embeds: [
                Bot.container.utils.embed().setColor("random").setDescription(
                    "pong!",
                ).setTimestamp(),
            ],
        }, false);
    },
});

Bot.container.utils.createCommand(Bot, {
    trigger: "test2",
    description: "test2 command!",
    scope: "Development",
    run: async (interaction) => {
        await Bot.container.utils.createCommandReply(Bot, interaction, {
            content: "test command ran!",
        }, true);
    },
});
