import { AkumaKodoBotCore } from "../../AkumaKodo.ts";
import { AkumaKodoCollection } from "../utils/Collection.ts";
import { AkumaKodoCommand } from "../../interfaces/Command.ts";
import { DiscordenoMessage, fetchMembers } from "../../../deps.ts";
import { Argument, Arguments } from "../../interfaces/Argument.ts";
import { MessageCollector } from "../utils/MessageCollector.ts";

export class AkumaArgumentGenorator {
  client: AkumaKodoBotCore;
  arguments: AkumaKodoCollection<string, Argument>;

  constructor(client: AkumaKodoBotCore) {
    this.client = client;
    this.arguments = new AkumaKodoCollection();
    this.preload();
  }

  /** Preload all the arguments to our cache */
  private preload() {
    this.arguments.set("3", (_, c) => [c, undefined]);
    this.arguments.set("4", (_, c) => [parseInt(c), undefined]);
    this.arguments.set("5", this.boolean);
    this.arguments.set("6", this.parseUser);
    this.arguments.set("7", this.parseChannel);
    this.arguments.set("8", this.parseRole);
  }

  /**
   * Parse the arguments from the message command
   * @param command
   * @param message
   * @param args
   */
  public async handleArguments(command: AkumaKodoCommand, message: DiscordenoMessage, args?: string) {
    if (!args) return {};
    const data: Arguments = {};
    const rest = args.split(" ");
    if (command?.options) {
      let restContent: string | undefined = rest.join(" ");

      for (const option of command.options) {
        const name = option.name;
        if (option.type && !option.customType && option.type !== 1) {
          const res: [returnItems, string | undefined] = await this.arguments.get(option.type.toString())!(
            message,
            restContent as string,
          );
          restContent = res[1];
          data[name] = res[0];
        }

        //Rest means that everything will be cut off
        if (option?.match == Matches.rest) {
          data[name] = args;
          if (option.customType) {
            const info: string = await option.customType(message, restContent as string);
            if (Array.isArray(info) && info.length == 2) {
              restContent = info[1];

              data[name] = info[0];
            } else {
              data[name] = info;
            }
          } else data[name] = restContent;
        } else if (option?.match == Matches.content) {
          if (option.customType) {
            data[name] = await option.customType(message, args);
          } else data[name] = args;
        }
      }
    }

    return data;
  }

  public async handleMissingArgs(message: DiscordenoMessage, command: NaticoCommand, args: Arguments) {
    const argKeys = Object.keys(args);

    let index = 0;

    for await (const arg of command.options as ArgOptions[]) {
      if (argKeys[index] !== arg.name && arg.required && arg.prompt) {
        const prompt = await message.reply(`${arg.prompt}\nThe command will be automatically cancelled in 30 seconds.`);

        const collector = new MessageCollector(this.client, message, undefined, { time: 30 * 1000 });
        const msg = (await collector.collect).first();

        if (!msg) return null;
        const fn = arg.customType ? arg.customType : this.arguments.get(arg.type.toString())!;
        args[arg.name] = (await fn(msg, msg.content))[0];
        await prompt.delete();
      }

      index++;
    }

    return args;
  }

  public boolean(_: DiscordenoMessage, args: string) {
    if (!args) return [undefined, args] as ReturnType;
    const trues = ["true", "on", "enable"];
    const falses = ["false", "off", "disable"];
    if (trues.includes(args.split(" ")[0])) {
      args = args.split(" ").slice(1).join(" ");
      return [true, args] as ReturnType;
    } else if (falses.includes(args.split(" ")[0])) {
      args = args.split(" ").slice(1).join(" ");
      return [false, args] as ReturnType;
    }
    return [undefined, args] as ReturnType;
  }

  public async parseUser(message: DiscordenoMessage, args: string) {
    if (!args) return [undefined, args] as ReturnType;
    const item = args?.trim()?.split(" ")[0]?.replace(/ /gi, "");
    const reg = /<@!?(\d{17,19})>/;
    const id = args?.match(reg);

    let user = message.guild!.members.find((member) => {
      if (id && member.id == BigInt(id[1])) return true;
      if (!item.length) return false;
      if (member.name(message.guildId).toLowerCase().includes(item)) {
        return true;
      }
      if (member.tag.toLowerCase().includes(item)) return true;
      return false;
    });

    if (user) return [user, args.split(" ").slice(1).join(" ")] as ReturnType;

    if (id && id[1]) {
      user = (
        await fetchMembers(message?.guild?.id!, message.guild?.shardId!, {
          userIds: [BigInt(id[1])],
          limit: 1,
        }).catch(() => undefined)
      )?.first();
    }
    if (user) return [user, args.split(" ").slice(1).join(" ")] as ReturnType;
    return [undefined, args] as ReturnType;
  }

  public parseChannel(message: DiscordenoMessage, args: string) {
    if (!args) return [undefined, args] as ReturnType;
    const guild = message.guild;

    const id = args.split(" ")[0].replace(/<|#|!|>|&|/gi, "");
    if ((id || args) && guild) {
      const channel = guild.channels.find((c) => {
        if (c.name == args.split(" ")[0]) return true;
        if (c.id.toString() == id || " ") return true;
        return false;
      });

      return [channel, args.split(" ").slice(1).join(" ")] as ReturnType;
    }
    return [undefined, args] as ReturnType;
  }

  public parseRole(message: DiscordenoMessage, args: string) {
    if (!args) return [undefined, args] as ReturnType;
    const guild = message.guild;

    const id = args.split(" ")[0].replace(/<|@|!|>|&|/gi, "");
    if ((id || args) && guild) {
      const role = guild.roles.find((c) => {
        if (c.name == args.split(" ")[0]) return true;
        return !!(c.id.toString() == id || " ");
      });

      return [role, args.split(" ").slice(1).join(" ")] as ReturnType;
    }
    return [undefined, args] as ReturnType;
  }
}
