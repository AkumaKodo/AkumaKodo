import { bold, cyan, gray, italic, red, yellow } from "../deps.ts";
import { AkumaKodoBot } from "../core/lib/AkumaKodo.ts";

export enum Loglevels {
  Debug,
  Info,
  Warn,
  Error,
  Fatal,
}

const prefixes = new Map<Loglevels, string>([
  [Loglevels.Debug, "DEBUG"],
  [Loglevels.Info, "INFO"],
  [Loglevels.Warn, "WARN"],
  [Loglevels.Error, "ERROR"],
  [Loglevels.Fatal, "FATAL"],
]);

const noColor: (str: string) => string = (msg) => msg;
const colorFunctions = new Map<Loglevels, (str: string) => string>([
  [Loglevels.Debug, gray],
  [Loglevels.Info, cyan],
  [Loglevels.Warn, yellow],
  [Loglevels.Error, (str: string) => red(str)],
  [Loglevels.Fatal, (str: string) => red(bold(italic(str)))],
]);

interface ll {
  logLevel?: Loglevels;
  name?: string;
}

export function logger({
  logLevel = Loglevels.Info,
  name,
}: ll = {}) {
  function log(level: Loglevels, ...args: any[]) {
    if (level < logLevel) return;

    let color = colorFunctions.get(level);
    if (!color) color = noColor;

    const date = new Date();
    const log = [
      `[${date.toLocaleDateString()} ${date.toLocaleTimeString()}]`,
      color(prefixes.get(level) || "DEBUG"),
      name ? `${name} >` : ">",
      ...args,
    ];

    switch (level) {
      case Loglevels.Debug:
        return console.debug(...log);
      case Loglevels.Info:
        return console.info(...log);
      case Loglevels.Warn:
        return console.warn(...log);
      case Loglevels.Error:
        return console.error(...log);
      case Loglevels.Fatal:
        return console.error(...log);
      default:
        return console.log(...log);
    }
  }

  function setLevel(level: Loglevels) {
    logLevel = level;
  }

  function debug(...args: any[]) {
    log(Loglevels.Debug, ...args);
  }

  function info(...args: any[]) {
    log(Loglevels.Info, ...args);
  }

  function warn(...args: any[]) {
    log(Loglevels.Warn, ...args);
  }

  function error(...args: any[]) {
    log(Loglevels.Error, ...args);
  }

  function fatal(...args: any[]) {
    log(Loglevels.Fatal, ...args);
  }

  return {
    log,
    setLevel,
    debug,
    info,
    warn,
    error,
    fatal,
  };
}

export const log = logger;

/**
 * The internal logger for AkumaKomoBot
 * It can be enabled by the user in the bot config
 * @param level The log level to use
 * @param event The event to log
 * @param message The message to log
 * @constructor
 */
export function AkumaKodoLogger(level: "debug" | "info" | "warn" | "error" | "fatal", event: string, message: string) {
  // Check if the user enabled internal logging.
  if (!AkumaKodoBot) return;
  try {
    // check if internal logging is enabled, if not return
    switch (level) {
      case "debug":
        log({
          logLevel: Loglevels.Debug,
          name: `AkumaKodo Internal - ${event.toUpperCase()}`,
        }).debug(message);
        break;
      case "info":
        log({
          logLevel: Loglevels.Info,
          name: `AkumaKodo Internal - ${event.toUpperCase()}`,
        }).info(message);
        break;
      case "warn":
        log({
          logLevel: Loglevels.Warn,
          name: `AkumaKodo Internal - ${event.toUpperCase()}`,
        }).warn(message);
        break;
      case "error":
        log({
          logLevel: Loglevels.Error,
          name: `AkumaKodo Internal - ${event.toUpperCase()}`,
        }).error(message);
        break;
      case "fatal":
        log({
          logLevel: Loglevels.Fatal,
          name: `AkumaKodo Internal - ${event.toUpperCase()}`,
        }).fatal(message);
        break;
      default:
        log({
          logLevel: Loglevels.Info,
          name: `AkumaKodo Internal - ${event.toUpperCase()}`,
        }).info(message);
        break;
    }
  } catch (e) {
    log({
      logLevel: Loglevels.Error,
      name: `AkumaKodo Internal - ${event.toUpperCase()}`,
    }).error(e);
  }
}
