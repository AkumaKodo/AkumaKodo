# AkumaKodo

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/)
and this project adheres to [Semantic Versioning](http://semver.org/).

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