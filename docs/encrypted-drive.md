# Encrypted Drives

encrypted drives are encrypted using a password and are stored using the event kind `30564`

encrypted drives reuse the same tag structure as normal [Drives](./drive.md) but the tags are encrypted and stored in the `content` of the event

## Encryption

Password encryption is done using [NIP-49](https://github.com/nostr-protocol/nips/blob/master/49.md) with a default LOG N of 10
