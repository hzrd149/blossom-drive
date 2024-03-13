<script lang="ts">
  import { querystring } from "svelte-spa-router";
  import { nip19 } from "nostr-tools";
  import { Spinner } from "flowbite-svelte";
  import { drives, handleEvent } from "../../services/drives";
  import type Drive from "../../blossom-drive-client/Drive";
  import DriveFiles from "./DriveFiles.svelte";
  import { ndk } from "../../services/ndk";

  export let params: Record<string, string>;
  let drive: Drive | null = null;

  async function loadDrive(naddr: string) {
    const decoded = nip19.decode(naddr);
    if (decoded.type !== "naddr") throw new Error("Unknown Type");
    if ($drives[decoded.data.identifier]) {
      drive = $drives[decoded.data.identifier];
    } else {
      const event = await ndk.fetchEvent({
        kinds: [decoded.data.kind],
        authors: [decoded.data.pubkey],
        "#d": [decoded.data.identifier],
      });

      if (event) {
        handleEvent(event);
        drive = $drives[decoded.data.identifier];
      }
    }
  }

  $: {
    if (params?.naddr) {
      loadDrive(params.naddr)
        .then(() => {
          console.log("Viewing", drive);
        })
        .catch((e) => {
          if (e instanceof Error) alert(e.message);
        });
    }
  }
</script>

{#if !drive}
  <Spinner />
{:else}
  <DriveFiles {drive} currentPath={new URLSearchParams($querystring).get("path") ?? ""} />
{/if}
