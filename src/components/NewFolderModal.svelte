<script lang="ts">
  import { Button, Modal, Input } from "flowbite-svelte";
  import { type Drive, joinPath } from "blossom-drive-sdk";
  export let open = false;

  export let drive: Drive;
  export let path: string;

  let name = "";
  let loading = false;
  async function createFolder(e: SubmitEvent) {
    e.preventDefault();
    loading = true;

    drive.getFolder(joinPath(path, name), true);

    open = false;
    name = "";
    await drive.save();

    loading = false;
  }
</script>

<Modal bind:open size="xs" class="w-full" title="New Folder" outsideclose>
  <form id="new-folder-form`" class="flex flex-col gap-2 py-0" on:submit={createFolder}>
    <Input placeholder="New Folder" required bind:value={name} autofocus />
    <div class="flex justify-end gap-2">
      <Button color="alternative" on:click={() => (open = false)}>Cancel</Button>
      <Button type="submit" for="new-folder-form">Create</Button>
    </div>
  </form>
</Modal>
