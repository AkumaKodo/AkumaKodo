import { AkumaKodoBot } from "../AkumaKodo.ts";

AkumaKodoBot.argumentsCollection.set("string", {
  name: "string",
  execute: (args, params) => {
    const [text] = params;

    const valid =
      // If the argument required literals and some string was provided by user
      args.literals?.length && text ? (args.literals.includes(text.toLowerCase()) ? text : undefined) : text;

    if (valid) {
      return args.lowercase ? valid.toLowerCase() : valid;
    }
  },
});

AkumaKodoBot.argumentsCollection.set("...string", {
  name: "",
  execute: (args, params) => {
    if (!params.length) return;

    return args.lowercase ? params.join(" ").toLowerCase() : params.join(" ");
  },
});
