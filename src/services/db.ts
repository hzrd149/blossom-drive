import type { NostrEvent } from "@nostr-dev-kit/ndk";
import { openDB } from "idb";

interface Schema {
  drives: { key: string; value: NostrEvent; indexes: { cord: string; created_at: number } };
}

const version = 1;
const db = await openDB<Schema>("blossom-drive-backup", version, {
  upgrade(db, oldVersion, newVersion, transaction, event) {
    if (oldVersion < 1) {
      const drives = db.createObjectStore("drives", { keyPath: "event.id" });
      drives.createIndex("cord", "cord", { unique: false });
      drives.createIndex("created_at", "event.created_at", { unique: false });
    }
  },
});

export async function addDriveEvents(events: NostrEvent[]) {
  const transaction = db.transaction("drives", "readwrite");

  for (const event of events) {
    const cord = [event.kind!, event.pubkey, event.tags.find((t) => t[0] === "d")?.[1]].filter(Boolean).join(":");
    await transaction.store.put({
      cord,
      event,
    });
  }
}

export async function getDriveVersions(cord: string) {
  return (await db.getAllFromIndex("drives", "cord", cord)).map((r) => r.event as NostrEvent);
}

export default db;
