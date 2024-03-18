# Drives

blossom drives are a nostr event that defines a collection of blobs stored in a folder structure

## Drive event (30563)

This event stores the metadata and folder structure of a drive

There are 4 notable tags

- `d` The identifier of the drive (see [parameterized replaceable events](https://github.com/nostr-protocol/nips/blob/master/01.md#kinds))
- `name` The name of the drive
- `description` A short description of the drive
- `r` (multiple) blossom servers clients should use when downloading blobs
- `x` A file in the drive
- `folder` An empty folder in the drive

### The `x` tag

The `x` tag defines a file and what path it lives at in the drive

The structure should be as follows

```
["x", "<sha256>", "<absolute file path>, "<size in bytes>", "<optional MIME type>"]
```

Example `x` tags

```json
// A file at the root of the drive
["x", "b1674191a88ec5cdd733e4240a81803105dc412d6c6708d53ab94fc248f4f553", "/bitcoin.pdf", "184292", "application/pdf"]

// A file in a Screenshots folder
["x", "592f38083fe91c83bf3ab558eff153e27361f28c3b778934d368e385285e1b5f", "/Screenshots/Screenshot from 2024-02-22 21-01-25.png", "477328", "image/png"]
```

### The `folder` tag

The folder tag is used to define EMPTY folders. think of it like a placeholder. once the user has put a file at the same path the placeholder can be removed

The structure should be

```
["folder", "<path>"]
```

An example of when a `folder` tag would be used:

- User clicks "new folder" button and enters "documents" as a name
- App creates a `["folder", "/documents"]` tag in the drive event
- User uploads `bitcoin.pdf` file to the new "documents" folder
- App create a `["x", "<sha256>", "/documents/bitcoin.pdf", "184292", "application/pdf"]` tag
- App removes the previously created `folder` now that there is a file at the `/documents` path

### The `r` tag

The `r` tag may be used to specify specific blossom servers that clients should use when downloading blobs stored in the drive

## Example Drive events

A drive with a single file in it

```json
{
  "id": "4e95a65fd81cfa59bbd8a0f8a751c8bcb2d3c2effe0e5edb7c946044c6ee8193",
  "pubkey": "266815e0c9210dfa324c6cba3573b14bee49da4209a9456f9484e5106cd408a5",
  "created_at": 1709031020,
  "kind": 30563,
  "tags": [
    ["d", "other-drive"],
    ["name", "Other Drive"],
    [
      "x",
      "b1674191a88ec5cdd733e4240a81803105dc412d6c6708d53ab94fc248f4f553",
      "/bitcoin.pdf",
      "184292",
      "application/pdf"
    ]
  ],
  "content": "",
  "sig": "6a3b99c86ee1b5d0568cbd2d529ed7a53fe0c470964faf0ace0668192c141200297f4c81b2fd3f242e2c6d680e39be193ef6f0a25070a70249dab6ce9e7ea99b"
}
```
