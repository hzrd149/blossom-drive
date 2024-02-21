<script lang="ts">
  import type { NDKEvent } from "@nostr-dev-kit/ndk";
  import { SpeedDial, SpeedDialButton } from "flowbite-svelte";
  import { UploadSolid, FolderSolid, GiftBoxSolid } from "flowbite-svelte-icons";
  import UploadFileModal from "./UploadFileModal.svelte";
  import NewDriveModal from "./NewDriveModal.svelte";
  import NewFolderModal from "./NewFolderModal.svelte";

  export let drive: NDKEvent | undefined = undefined;
  export let path: string | undefined = undefined;

  let uploadFileModal = false;
  let newFolderModal = false;
  let newDriveModal = false;

  const createdDrive = (event: CustomEvent<NDKEvent>) => {
    location.hash = "#/drive/" + event.detail.encode;
  };
</script>

<SpeedDial defaultClass="absolute end-6 bottom-6">
  <SpeedDialButton name="Upload" on:click={() => (uploadFileModal = true)}>
    <UploadSolid class="h-6 w-6" />
  </SpeedDialButton>
  {#if drive}
    <SpeedDialButton name="Folder" on:click={() => (newFolderModal = true)}>
      <FolderSolid class="h-6 w-6" />
    </SpeedDialButton>
  {/if}
  <SpeedDialButton name="Drive" on:click={() => (newDriveModal = true)}>
    <GiftBoxSolid class="h-6 w-6" />
  </SpeedDialButton>
</SpeedDial>

{#if uploadFileModal}
  <UploadFileModal bind:open={uploadFileModal} {drive} {path} />
{/if}

{#if newFolderModal && drive}
  <NewFolderModal bind:open={newFolderModal} {drive} path={path || "/"} />
{/if}

{#if newDriveModal}
  <NewDriveModal bind:open={newDriveModal} on:created={createdDrive} />
{/if}
