import { AkumaCreateBotOptions } from "./AkumaKodo.ts";

/**
 * Helps validate the options passed to the AkumaKodoBot constructor.
 * @param o The options to validate.
 */
export function validateCreateBotOptions(o?: AkumaCreateBotOptions) {
  if (!o.token) {
    throw new Error("Missing token");
  }
}
