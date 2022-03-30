# AkumaKodo

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/)
and this project adheres to [Semantic Versioning](http://semver.org/).

## 0.1.5 - 2022-03-28
Stable release for production.

### Added
- Updated documentation for v0.1.5

### Fixed
- More export options to mod.ts file

## 0.1.4 - 2022-03-27
Finishing up basic framework features, and making it stable for production.

### Added
- Command guild only protection.
- Command DM only protection.
- Components for commands: Button, TextInput, SelectMenu.
- More utility helper functions
- Application component handler

### Changed
- Added error handling to createBot function.
- Provider object no longer needed in config by default.
- Providers no longer automatically register using the bot configuration.

### Deprecated
- Removed provider configurations from the bot object. From now on users will have to import and manage their own providers.

### Removed
- Button creation utility.
- Task initialization on bot startup by default.
- Mongodb provider until i fix it.

### Fixed
- Owner Only command checks not caching owners from configuration or api.
- Provider checking for provider object before launching bot.
- Owner Only function working!

### Security
- Upgraded required deno version to deno v1.20.3

## 0.1.3 - 2022-03-25
Major revamp fixes for library and modules with more permission handling.

### Added
- NSFW Command checks
- Owner Only command checks
- development server only checks
- Documentation page for begging users.
- Rate limit handling for commands.

### Changed
- Configuration object added 'required' to props. This will make it more clear to the end user which options are required or optional.
- Bot configuration options have not been given an option to enable and disable built in events
- Version control function name from validate to validateDenoVersion.

### Fixed
- Bot will fetch application owners on start up and cache them.
- Permission handling for event handler. Events are enabled by default and the user can disable them if needed.
- Converted cooldown type names to rate limit for convenience, and understanding.

### Security
- Added more permission checks and caching of  the bot owner so we dont hit discord api ratelimit fetch request.

## 0.1.2 - 2022-03-24
Quality of life improvement and bug fixes

### Added
- Error handling for more modules.
- CommandScopeType for command scope options.

### Deprecated
- Removed command scope type Guild in favor of type Developments

### Removed
- The internal events method is now becoming private. To avoid file import bugs, we will load it internally if the user wants to use it. If not they can disable it in the config settings.

### Fixed
- Bug in logger emitting errors for unstable logs.
- The internal event handler was made to accept asynchronous functions.
- framework install url in documentation was incorrect.
- Bug with fileloader import paths

### Security
- If fs loader throws an error, we will end the bot process and not continue loading the process.

## 0.1.1 - 2022-03-22
Quality of life improvements and documentation changes

### Added
- Yoki section to the docs.

### Changed
- Exporting only required classes from mod.ts and not everything.
- base urls for documentation not start with index.md and not a topic name.

### Fixed
- A spelling mistake in the documentation.

## 0.1.0 - 2022-03-19
Initial release of AkumaKodo

### Added
- Interaction Command handling
- Lots of util functions

### Changed
- Added internal slash command handling using events. You can now enable or disable this.
- Logger Errors to warn on un-stable modes.

### Removed
- For now, until slash commands are fully implemented, I will not focus on message-based commands. You will have to implement them yourself.