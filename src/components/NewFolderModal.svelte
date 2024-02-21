<script lang="ts">
  import type { NDKEvent } from "@nostr-dev-kit/ndk";
  import { Button, Modal, Input } from "flowbite-svelte";
  import { getFileTree, getFolder, parsePath, setDriveFileTree } from "../helpers/tree";
  import { cloneEvent } from "../helpers/event";
  import { handleEvent } from "../services/drives";
  export let open = false;

  export let drive: NDKEvent;
  export let path: string;

  let name = "";
  let loading = false;
  async function createFolder(e: SubmitEvent) {
    e.preventDefault();
    loading = true;

    const draft = cloneEvent(drive);
    const tree = getFileTree(draft);
    getFolder(tree, parsePath(path).concat(name));
    setDriveFileTree(draft, tree);
    await draft.sign();
    handleEvent(draft);
    open = false;
    await draft.publish();
    loading = false;
  }
</script>

<Modal bind:open size="xs" class="w-full" title="New Folder" outsideclose>
  <form id="new-folder-form`" class="flex flex-col gap-2 py-0" on:submit={createFolder}>
    <Input placeholder="New Folder" required bind:value={name} />
    <div class="flex justify-end gap-2">
      <Button color="alternative" on:click={() => (open = false)}>Cancel</Button>
      <Button type="submit" for="new-folder-form">Create</Button>
    </div>
  </form>
</Modal>
