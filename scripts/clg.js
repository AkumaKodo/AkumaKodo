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
  ).addRelease(
    new Release("0.1.1", "2022-3-22", "Quality of life improvements and documentation changes")
      .changed("Exporting only required classes from mod.ts and not everything.")
      .changed("base urls for documentation not start with index.md and not a topic name.")
      .fixed("A spelling mistake in the documentation.")
      .added("Yoki section to the docs."),
  ).addRelease(
    new Release("0.1.2", "2022-3-23", "Quality of life improvement and bug fixes")
      .removed(
        "The internal events methods is not becoming private. To avoid file import bugs, we will load it internally if the user wants to use it. If not they can disable it in the config settings.",
      )
      .added("Error handling for more modules.")
      .added("CommandScopeType for command scope options.")
      .fixed("Bug in logger emitting errors for unstable logs.")
      .fixed("The internal event handler was made to accept asynchronous functions.")
      .fixed("framework install url in documentation was incorrect.")
      .fixed("Bug with fileloader import paths")
      .deprecated("Removed command scope type Guild in favor of type Developments")
      .security("If fs loader throws an error, we will end the bot process and not continue loading the process."),
  );

console.clear();
console.log("\n- - - COPY THE GENERATED LOG BELOW - - -\n");
console.log(changelog.toString());
console.log("\n- - - COPY THE GENERATED LOG ABOVE - - -\n");
