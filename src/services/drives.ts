import { writable, get, readable } from "svelte/store";
import type { NDKEvent, NDKSubscription } from "@nostr-dev-kit/ndk";
import type { SignedEvent } from "blossom-client";

import { activeUser, ndk, publishSignedEvent, signEventTemplate } from "./ndk";
import { backupDriveEvents } from "./db";
import Drive, { DRIVE_KIND } from "../blossom-drive-client/Drive";
import { ENCRYPTED_DRIVE_KIND, EncryptedDrive } from "../blossom-drive-client/EncryptedDrive";

export const drives = writable<Record<string, Drive>>({});

let sub: NDKSubscription;
activeUser.subscribe((user) => {
  if (sub) sub.stop();
  if (!user) return;

  drives.set({});
  sub = ndk.subscribe({ kinds: [DRIVE_KIND as number, ENCRYPTED_DRIVE_KIND as number], authors: [user.pubkey] });
  sub.on("event", handleEvent);
  sub.start();
});

async function handleDriveUpdate(drive: Drive) {
  await backupDriveEvents([drive.event as SignedEvent]);
}

export function getReadableDrive(drive: Drive) {
  return readable<Drive>(drive, (set) => {
    const listener = () => set(drive);
    drive.on("change", listener);

    set(drive);
    return () => {
      drive.off("change", listener);
    };
  });
}

export function handleEvent(event: NDKEvent) {
  const d = event.tags.find((t) => t[0] === "d")?.[1];
  if (d) {
    const existing = get(drives);

    if (existing[d]) {
      existing[d].update(event.rawEvent() as SignedEvent);
    } else {
      let drive: Drive;
      if (event.kind === ENCRYPTED_DRIVE_KIND) drive = new EncryptedDrive(signEventTemplate, publishSignedEvent);
      else drive = new Drive(signEventTemplate, publishSignedEvent);

      drive.update(event.rawEvent() as SignedEvent);

      console.log("Created drive", drive);

      // backup the event when the drive updates
      drive.on("update", handleDriveUpdate);

      // add the drive to the list
      drives.update((dir) => ({
        ...dir,
        [d]: drive,
      }));
    }
  }
}
