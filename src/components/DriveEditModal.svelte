<script lang="ts">
  import { Button, Modal, Input, Textarea } from "flowbite-svelte";
  import type Drive from "../blossom-drive-client/Drive";

  export let open = false;
  export let drive: Drive;

  let name = drive.name;
  let description = drive.description;

  const submit = async (e: SubmitEvent) => {
    drive.name = name;
    drive.description = description;
    await drive.save();
    open = false;
  };
</script>

<Modal bind:open size="xs" class="w-full" title="Edit Drive" outsideclose>
  <form id="update-form" class="flex flex-col gap-2 py-0" on:submit|preventDefault={submit}>
    <Input placeholder="Drive name" required bind:value={name} />
    <Textarea name="about" rows={4} placeholder="A short description" bind:value={description} />
    <div class="flex justify-end gap-2">
      <Button color="alternative" on:click={() => (open = false)}>Cancel</Button>
      <Button type="submit">Update</Button>
    </div>
  </form>
</Modal>
