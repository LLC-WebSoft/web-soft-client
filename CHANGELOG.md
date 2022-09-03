# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

<!-- ## [Unreleased] -->

## [1.1.0] - 2022-09-03

### Added

- Documentation in Russian.
- Typings.
- Example code for development purposes.
- CHANGELOG.md.

### Changed

- CLI bug when couldn't connect to secure server.

## [1.0.1] - 2022-03-11

### Changed

- Fix CLI bug when api file was generate incorrect loadApi function's signature.

## [1.0.0] - 2022-03-11

### Added

- Initial project structure.
- Connection class for handling JSONRPC messaging.
- JSONRPCReponseSchema for validating incoming server responses.
- HTTPConnection class for HTTP/S protocol support.
- Default fetch options for HTTP/S connection.
- Building modules from server schema method to Api class.
- CLI tool for creating api and types files.
- Subscription possibility.
- WSConnection class for WS protocol support.
- Api class for building and calling methods of api modules.

[unreleased]: https://github.com/web-soft-llc/web-soft-client/compare/v1.1.0...master
[1.1.0]: https://github.com/web-soft-llc/web-soft-client/compare/v.1.0.1...v1.1.0
[1.0.1]: https://github.com/web-soft-llc/web-soft-client/compare/v.1.0.0...v.1.0.1
[1.0.0]: https://github.com/web-soft-llc/web-soft-client/releases/tag/v.1.0.0
