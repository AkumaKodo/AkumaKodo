# AkumaKodo

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/)
and this project adheres to [Semantic Versioning](http://semver.org/).

## 0.1.2 - 2022-03-23

Quality of life improvement and bug fixes

### Added

- Error handling for more modules.
- CommandScopeType for command scope options.

### Deprecated

- Removed command scope type Guild in favor of type Developments

### Removed

- The internal events methods is not becoming private. To avoid file import bugs, we will load it internally if the user wants to use it. If not they can disable it in the config settings.

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
