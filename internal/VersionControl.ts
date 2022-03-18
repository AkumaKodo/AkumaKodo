/** Versioning protection for the project. */
import { AkumaKodoLogger } from "./logger.ts";
import { AkumaKodoConfigurationInterface } from "../core/interfaces/Client.ts";

export class AkumaKodoVersionControl {
  private logger: AkumaKodoLogger;
  private readonly RequiredDenoVersion: string;

  constructor(config: AkumaKodoConfigurationInterface) {
    this.RequiredDenoVersion = "1.20.1";
    this.logger = new AkumaKodoLogger(config);
  }
  /**
   * Validates the version of the project.
   *
   * This function will parse your deno version and compare it to the required version.
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
          "error",
          "Version Control",
          "The version of the project is less than the required version. Please update to deno " +
            this.RequiredDenoVersion,
        );
        return 1;
      }
      if (o < n) {
        this.logger.create(
          "warn",
          "Version Control",
          "The version of the project is greater than the recommended version. You can ignore this log. Recommended version: " +
            this.RequiredDenoVersion,
        );
        return -1;
      }
      if (!isNaN(o) && isNaN(n)) {
        this.logger.create(
          "error",
          "Version Control",
          "The version of the project is greater than the recommended version. You can ignore this log. Recommended version: " +
            this.RequiredDenoVersion,
        );
        return 1;
      }
      if (isNaN(o) && !isNaN(n)) {
        this.logger.create(
          "info",
          "Version Control",
          "The version of the project is greater than the required version. Please update to deno " +
            this.RequiredDenoVersion,
        );
        return -1;
      }
    }

    this.logger.create(
      "debug",
      "Version Control",
      "Deno version checks passed! Your version is up to date on deno v" + this.RequiredDenoVersion,
    );

    return 0;
  }

  private static getInternalVersion() {
    return Deno.version.deno;
  }
}
