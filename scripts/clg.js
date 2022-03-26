import {
    Changelog,
    Release,
} from "https://deno.land/x/changelog@v2.0.0/mod.ts";

/** Util to convert js into markdown for our change log files
 *
 * ? Options ~ Added, Changed, Deprecated, Removed, Fixed, and Security
 */
const changelog = new Changelog("AkumaKodo")
    .addRelease(
        new Release("0.1.0", "2022-3-19", "Initial release of AkumaKodo")
            .added("Interaction Command handling")
            .added("Lots of util functions")
            .changed(
                "Added internal slash command handling using events. You can now enable or disable this.",
            )
            .changed("Logger Errors to warn on un-stable modes.")
            .removed(
                "For now, until slash commands are fully implemented, I will not focus on message-based commands. You will have to implement them yourself.",
            ),
    )
    .addRelease(
        new Release(
            "0.1.1",
            "2022-3-22",
            "Quality of life improvements and documentation changes",
        )
            .changed(
                "Exporting only required classes from mod.ts and not everything.",
            )
            .changed(
                "base urls for documentation not start with index.md and not a topic name.",
            )
            .fixed("A spelling mistake in the documentation.")
            .added("Yoki section to the docs."),
    )
    .addRelease(
        new Release(
            "0.1.2",
            "2022-3-24",
            "Quality of life improvement and bug fixes",
        )
            .removed(
                "The internal events method is now becoming private. To avoid file import bugs, we will load it internally if the user wants to use it. If not they can disable it in the config settings.",
            )
            .added("Error handling for more modules.")
            .added("CommandScopeType for command scope options.")
            .fixed("Bug in logger emitting errors for unstable logs.")
            .fixed(
                "The internal event handler was made to accept asynchronous functions.",
            )
            .fixed("framework install url in documentation was incorrect.")
            .fixed("Bug with fileloader import paths")
            .deprecated(
                "Removed command scope type Guild in favor of type Developments",
            )
            .security(
                "If fs loader throws an error, we will end the bot process and not continue loading the process.",
            ),
    )
    .addRelease(
        new Release(
            "0.1.3",
            "2022-3-25",
            "Major revamp fixes for library and modules with more permission handling.",
        )
            .added("NSFW Command checks")
            .fixed(
                "Bot will fetch application owners on start up and cache them.",
            )
            .added("Owner Only command checks")
            .added("development server only checks")
            .added("Documentation page for begging users.")
            .added("Rate limit handling for commands.")
            .changed(
                "Configuration object added 'required' to props. This will make it more clear to the end user which options are required or optional.",
            )
            .changed(
                "Bot configuration options have not been given an option to enable and disable built in events",
            )
            .changed(
                "Version control function name from validate to validateDenoVersion.",
            )
            .fixed(
                "Permission handling for event handler. Events are enabled by default and the user can disable them if needed.",
            )
            .fixed(
                "Converted cooldown type names to rate limit for convenience, and understanding.",
            )
            .security(
                "Added more permission checks and caching of  the bot owner so we dont hit discord api ratelimit fetch request.",
            ),
    ).addRelease(
        "0.1.4",
        "2022-3-26",
        "Finishing up basic framework features, and making it stable for production.",
    )
    .added("Command guild only protection.").added(
        "Command DM only protection.",
    ).added("Components for commands: Button, TextInput, SelectMenu.")
    .added("More utility helper functions")
    .added("Added createButton Utility for commands")
    .fixed(
        "Owner Only command checks not caching owners from configuration or api.",
    ).changed("Added error handling to createBot function.")
    .changed("Provider object no longer needed in config by default.")
    .fixed("Provider checking for provider object before launching bot.")
    .security("Upgraded required pkg version to deno v1.20.3");

console.clear();
console.log("\n- - - COPY THE GENERATED LOG BELOW - - -\n");
console.log(changelog.toString());
console.log("\n- - - COPY THE GENERATED LOG ABOVE - - -\n");
