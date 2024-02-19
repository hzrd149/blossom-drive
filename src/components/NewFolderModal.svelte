<script lang="ts">
  import type { NDKEvent } from "@nostr-dev-kit/ndk";
  import { Button, Modal, Input } from "flowbite-svelte";
  import { getFileTree, getFolder, parsePath, setPackFileTree } from "../helpers/tree";
  import { cloneEvent } from "../helpers/event";
  import { handleEvent } from "../services/packs";
  export let open = false;

  export let pack: NDKEvent;
  export let path: string;

  let name = "";
  let loading = false;
  async function createFolder(e: SubmitEvent) {
    e.preventDefault();
    loading = true;

    const draft = cloneEvent(pack);
    const tree = getFileTree(draft);
    getFolder(tree, parsePath(path).concat(name));
    setPackFileTree(draft, tree);
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
