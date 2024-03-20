<script lang="ts">
  import type { NostrEvent } from "@nostr-dev-kit/ndk";
  import { nip19 } from "nostr-tools";
  import { Spinner, Timeline } from "flowbite-svelte";
  import { type Drive } from "blossom-drive-client";

  import { getDriveVersions } from "../services/db";
  import { drives } from "../services/drives";
  import { get } from "svelte/store";
  import DriveHistoryEntry from "../components/DriveHistoryEntry.svelte";

  export let params: Record<string, string | undefined> = {};
  const naddr = params["naddr"];

  let versions: NostrEvent[] = [];
  let drive: Drive | null = null;

  $: {
    const parsed = naddr && nip19.decode(naddr);
    if (parsed && parsed.type === "naddr") {
      drive = get(drives)[parsed.data.identifier];
      const cord = [parsed.data.kind, parsed.data.pubkey, parsed.data.identifier].join(":");
      getDriveVersions(cord).then((events) => (versions = events.sort((a, b) => b.created_at - a.created_at)));
    }
  }
</script>

{#if versions.length === 0}
  <Spinner />
{:else}
  <main class="flex flex-grow flex-col gap-4 p-4">
    <div class="flex justify-between gap-2">
      <h1 class="text-xl font-bold">{drive?.name} - History</h1>
    </div>

    <Timeline>
      {#each versions as version, i}
        {#if i >= 1}
          <DriveHistoryEntry {version} prev={versions[i - 1]} />
        {/if}
      {/each}
    </Timeline>
  </main>
{/if}
