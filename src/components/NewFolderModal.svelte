<script>
  import { Button, Modal, Input } from "flowbite-svelte";
  export let open = false;
</script>

<Modal bind:open size="xs" class="w-full">
  <form id="new-folder-form`" class="flex flex-col gap-2 py-0" action="#">
    <h3 class="text-lg font-medium text-gray-900 dark:text-white">New Folder</h3>
    <Input placeholder="New Folder" required />
    <div class="flex justify-end gap-2">
      <Button color="alternative" on:click={() => (open = false)}>Cancel</Button>
      <Button type="submit" for="new-folder-form">Create</Button>
    </div>
  </form>
</Modal>
