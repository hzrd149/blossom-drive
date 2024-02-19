<script lang="ts">
  import { Button, Modal, Input } from "flowbite-svelte";
  import { createEventDispatcher } from "svelte";
  export let open = false;

  export let name: string = "";

  const dispatch = createEventDispatcher();

  let newName = "";
  $: {
    newName = name;
  }

  function submit(e: SubmitEvent) {
    e.preventDefault();
    dispatch("submit", newName);
    open = false;
  }
</script>

<Modal bind:open size="xs" class="w-full" title="Rename" outsideclose>
  <form id="new-folder-form`" class="flex flex-col gap-2 py-0" on:submit={submit}>
    <Input placeholder="New Folder" required bind:value={newName} />
    <div class="flex justify-end gap-2">
      <Button color="alternative" on:click={() => (open = false)}>Cancel</Button>
      <Button type="submit" for="new-folder-form">Rename</Button>
    </div>
  </form>
</Modal>
