<script lang="ts">
  import { querystring } from "svelte-spa-router";
  import { nip19 } from "nostr-tools";
  import { Spinner } from "flowbite-svelte";
  import { EncryptedDrive, type Drive } from "blossom-drive-sdk";
  import { drives, getReadableDrive, handleEvent } from "../../services/drives";
  import DrivePage from "./DrivePage.svelte";
  import { ndk } from "../../services/ndk";
  import UnlockDrive from "../../components/UnlockDrive.svelte";
  import type { Readable } from "svelte/store";

  export let params: Record<string, string>;
  let drive: Readable<Drive>;

  async function loadDrive(naddr: string) {
    const decoded = nip19.decode(naddr);
    if (decoded.type !== "naddr") throw new Error("Unknown Type");
    if ($drives[decoded.data.identifier]) {
      drive = getReadableDrive($drives[decoded.data.identifier]);
    } else {
      const event = await ndk.fetchEvent({
        kinds: [decoded.data.kind],
        authors: [decoded.data.pubkey],
        "#d": [decoded.data.identifier],
      });

      if (event) {
        handleEvent(event);
        drive = getReadableDrive($drives[decoded.data.identifier]);
      }
    }
  }

  $: {
    if (params?.naddr) {
      loadDrive(params.naddr).catch((e) => {
        if (e instanceof Error) alert(e.message);
      });
    }
  }

  $: currentPath = new URLSearchParams($querystring).get("path") ?? "";
  $: encrypted = $drive instanceof EncryptedDrive;
  $: locked = $drive instanceof EncryptedDrive ? $drive.locked : undefined;
  $: encryptedDrive = $drive instanceof EncryptedDrive ? ($drive as EncryptedDrive) : null;
</script>

{#if !drive}
  <Spinner />
{:else if encrypted && locked && encryptedDrive}
  <UnlockDrive drive={encryptedDrive} />
{:else}
  <DrivePage drive={$drive} {currentPath} />
{/if}
