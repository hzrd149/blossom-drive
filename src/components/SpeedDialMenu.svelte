<script lang="ts">
  import type { NDKEvent } from "@nostr-dev-kit/ndk";
  import { SpeedDial, SpeedDialButton } from "flowbite-svelte";
  import { UploadSolid, FolderSolid, GiftBoxSolid, UserHeadsetOutline } from "flowbite-svelte-icons";
  import UploadFileModal from "./UploadFileModal.svelte";
  import NewPackModal from "./NewPackModal.svelte";
  import NewFolderModal from "./NewFolderModal.svelte";

  export let pack: NDKEvent | undefined = undefined;
  export let path: string | undefined = undefined;

  let uploadFileModal = false;
  let newFolderModal = false;
  let newPackModal = false;

  const createdPack = (event: CustomEvent<NDKEvent>) => {
    newPackModal = false;
    location.hash = "#/pack/" + event.detail.encode;
  };
</script>

<SpeedDial defaultClass="absolute end-6 bottom-6">
  <SpeedDialButton name="Upload" on:click={() => (uploadFileModal = true)}>
    <UploadSolid class="h-6 w-6" />
  </SpeedDialButton>
  {#if pack}
    <SpeedDialButton name="Folder" on:click={() => (newFolderModal = true)}>
      <FolderSolid class="h-6 w-6" />
    </SpeedDialButton>
  {/if}
  <SpeedDialButton name="Pack" on:click={() => (newPackModal = true)}>
    <GiftBoxSolid class="h-6 w-6" />
  </SpeedDialButton>
</SpeedDial>

{#if uploadFileModal}
  <UploadFileModal bind:open={uploadFileModal} {pack} {path} />
{/if}

{#if newFolderModal && pack}
  <NewFolderModal bind:open={newFolderModal} {pack} path={path || "/"} />
{/if}

{#if newPackModal}
  <NewPackModal bind:open={newPackModal} on:created={createdPack} />
{/if}
