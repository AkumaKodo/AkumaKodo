/** Versioning protection for the project. */
import { AkumaKodoLogger } from "./logger.ts";
import { AkumaCreateBotOptions } from "../core/interfaces/Client.ts";

export class AkumaKodoVersionControl {
  private logger: AkumaKodoLogger;
  private readonly RequiredDenoVersion: string;

  constructor(config: AkumaCreateBotOptions) {
    this.RequiredDenoVersion = "1.19.0";
    this.logger = new AkumaKodoLogger(config);
  }
  /**
   * Validates the version of the project.
   */
  public validate() {
    const internalVersion = this.RequiredDenoVersion.split(".");
    const _ = AkumaKodoVersionControl.getInternalVersion();
    const userVersion = _.split(".");

    // If 1 was returned, the user version is less than the internal version.
    // If -1 was returned, the user version is greater than the internal version.
    // If 0 was returned, the user version is equal to the internal version.

    for (let i = 0; i < 3; i++) {
      const o = Number(internalVersion[i]);
      const n = Number(userVersion[i]);
      if (o > n) {
        this.logger.create(
          "warn",
          "Version Control",
          "The version of the project is less than the required version. Please update to deno " +
            this.RequiredDenoVersion,
        );
        return 1;
      }
      if (o < n) {
        this.logger.create(
          "info",
          "Version Control",
          "The version of the project is greater than the required version. You can ignore this log. Recommended version: " +
            this.RequiredDenoVersion,
        );
        return -1;
      }
      if (!isNaN(o) && isNaN(n)) {
        this.logger.create(
          "debug",
          "Version Control",
          "The version of the project is greater than the required version. You can ignore this log. Recommended version: " +
            this.RequiredDenoVersion,
        );
        return 1;
      }
      if (isNaN(o) && !isNaN(n)) {
        this.logger.create(
          "debug",
          "Version Control",
          "The version of the project is greater than the required version. Please update to deno " +
            this.RequiredDenoVersion,
        );
        return -1;
      }
    }

    this.logger.create("debug", "VersionControl", "The version of the project is up to date.");

    return 0;
  }

  private static getInternalVersion() {
    return Deno.version.deno;
  }
}
