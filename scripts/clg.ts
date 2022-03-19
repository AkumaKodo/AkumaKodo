import { Changelog, Release } from "https://deno.land/x/changelog@v2.0.0/mod.ts";

/** Util to convert js into markdown for our change log files
 *
 * ? Options ~ Added, Changed, Deprecated, Removed, Fixed, and Security
 */
const changelog = new Changelog("AkumaKodo")
  .addRelease(
    new Release("0.1.0", "2022-3-19", "Initial release of AkumaKodo")
      .added("Interaction Command handling")
      .added("Lots of util functions")
      .changed("Added internal slash command handling using events. You can now enable or disable this.")
      .changed("Logger Errors to warn on un-stable modes.")
      .removed(
        "For now, until slash commands are fully implemented, I will not focus on message-based commands. You will have to implement them yourself.",
      ),
  );

console.clear();
console.log("\n- - - COPY THE GENERATED LOG BELOW - - -\n");
console.log(changelog.toString());
console.log("\n- - - COPY THE GENERATED LOG ABOVE - - -\n");
