import { AkumaKodoBotCore } from "../core/AkumaKodo.ts";

import {
  ButtonData,
  dotEnvConfig,
  InteractionResponseTypes,
  InteractionTypes,
  MessageComponentTypes,
} from "../deps.ts";
const env = dotEnvConfig({ export: true });
const TOKEN = env.DISCORD_BOT_TOKEN || "";

const Bot = new AkumaKodoBotCore({
  botId: 946398697254703174n,
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
});

await Bot.createBot();

// Bot.instance.events.messageCreate = async (bot, payload) => {
//   Bot.container.logger.create("info", "messageCreate", payload.content);
//   if (payload.content === "!ping") {
//     await Bot.instance.helpers.sendMessage(payload.channelId, {
//       content: "pong!",
//     });
//     Bot.container.logger.create("info", "messageCreate", `Ping command ran in ${payload.channelId}`);
//   }
// };

Bot.instance.events.ready = (_, payload) => {
  Bot.container.logger.create("info", "ready", "Online and ready to work!");
};

// Bot.instance.events.interactionCreate = (_, interaction) => {
//   if (!interaction.data) return;
//
//   switch (interaction.type) {
//     case InteractionTypes.ApplicationCommand:
//       Bot.container.commands.get(interaction.data.name!)?.run(interaction);
//       break;
//   }
// };

Bot.container.utils.createCommand(Bot, {
  trigger: "ping",
  description: "ping me!",
  scope: "Development",
  run: async (interaction) => {
    await Bot.instance.helpers.sendInteractionResponse(interaction.id, interaction.token, {
      type: InteractionResponseTypes.ChannelMessageWithSource,
      data: {
        content: "pong!",
      },
    });
  },
});
