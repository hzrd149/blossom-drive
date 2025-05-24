# 🌸 Blossom Drive

> [!IMPORTANT]
> This was an experimental project and is no longer maintained.

Blossom drive is a public cloud drive built on [blossom servers](https://github.com/hzrd149/blossom) and [nostr](https://github.com/nostr-protocol/nips)

## Deprecation notice

This app is no longer maintained. Please use [Bouquet](https://bouquet.slidestr.net) to manage your blossom blobs.

I havent updated this app in over a year and with the pace of nostr development it is now outdated.

The app started as an experiment to demonstrate how blossom could be used. The design of the [drive events](./docs/drive.md) is limited in how many files it can hold and does not scale well due to how replaceable nostr events are handled. Because of this I've decided to abaondon the app to continue focusing on [blossom](https://github.com/hzrd149/blossom) protocol.

If some other developer wants to continue the work on this app, it will need to be completely redesigned in order to work well. Probably using some kind of append-only log of file operations instead of a single event.

## Blossom implementation

blossom drive uses [blossom-client-sdk](https://github.com/hzrd149/blossom-client-sdk) to mange blobs on servers

## Nostr integration

See [nostr.md](./docs/nostr.md) for event definitions
