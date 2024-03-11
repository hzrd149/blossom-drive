<script lang="ts">
  import { querystring } from "svelte-spa-router";
  import { nip19 } from "nostr-tools";
  import { Spinner } from "flowbite-svelte";
  import { drives } from "../../services/drives";
  import type Drive from "../../blossom-drive-client/Drive";
  import DriveFiles from "./DriveFiles.svelte";

  export let params: Record<string, string>;
  let drive: Drive | null = null;

  $: {
    if (params?.naddr) {
      const decoded = nip19.decode(params?.naddr);
      if (decoded.type !== "naddr") throw new Error("Unknown Type");

      drive = $drives[decoded.data.identifier];
      console.log("Viewing", drive);
    }
  }
</script>

{#if !drive}
  <Spinner />
{:else}
  <DriveFiles {drive} currentPath={new URLSearchParams($querystring).get("path") ?? ""} />
{/if}
