import { AkumaKodoBotCore } from "../core/AkumaKodo.ts";
import { delay, dotEnvConfig } from "../deps.ts";

const env = dotEnvConfig({ export: true });
const TOKEN = env.DISCORD_BOT_TOKEN || "";

if (!TOKEN) {
  throw new Error("Token now found!");
}

const Bot = new AkumaKodoBotCore({
  botId: BigInt("946398697254703174"),
  events: {},
  intents: ["Guilds", "GuildMessages", "GuildMembers"],
  token: TOKEN,
}, {
  optional: {
    bot_development_server_id: BigInt("946461976408764476"),
    bot_debug_mode: true,
    providers: {
      type: "disabled",
    },
  },
});

await Bot.createBot();

Bot.instance.events.messageCreate = async (bot, payload) => {
  if (payload.content === "typescript-spammer") {
    const pSpam: number[] = [];
    for (let i = 0; i < 50; i++) {
      delay(3000);
      await Bot.instance.helpers.sendMessage(payload.channelId, {
        content: `typescript-spammer #${i}`,
      });
      Bot.container.logger.create("table", "Spammer v1", `Spamming #${i}`);
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
  trigger: "test",
  description: "test command!",
  scope: "Development",
  botPermissions: ["ADMINISTRATOR"],
  run: async (interaction) => {
    await Bot.container.utils.createCommandReply(Bot, interaction, {
      content: "test command ran!",
    }, true);
  },
});

Bot.container.utils.createCommand(Bot, {
  trigger: "ping",
  description: "ping pong me!",
  scope: "Development",
  run: async (interaction) => {
    await Bot.container.utils.createCommandReply(Bot, interaction, {
      embeds: [
        Bot.container.utils.embed().setColor("random").setDescription("pong!"),
      ]
    }, false);
  },
});

Bot.initializeInternalEvents();
