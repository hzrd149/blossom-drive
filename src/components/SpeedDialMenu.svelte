<script>
  import { SpeedDial, SpeedDialButton } from "flowbite-svelte";
  import { UploadSolid, FolderSolid, GiftBoxSolid } from "flowbite-svelte-icons";
  import { createEventDispatcher } from "svelte";

  const dispatch = createEventDispatcher();
</script>

<SpeedDial defaultClass="absolute end-6 bottom-6">
  <SpeedDialButton name="Upload">
    <UploadSolid class="h-6 w-6" on:click={() => dispatch("new-file")} />
  </SpeedDialButton>
  <SpeedDialButton name="Folder" on:click={() => dispatch("new-folder")}>
    <FolderSolid class="h-6 w-6" />
  </SpeedDialButton>
  <SpeedDialButton name="Pack" on:click={() => dispatch("new-pack")}>
    <GiftBoxSolid class="h-6 w-6" />
  </SpeedDialButton>
</SpeedDial>
