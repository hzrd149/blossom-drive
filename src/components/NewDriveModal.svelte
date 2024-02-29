<script lang="ts">
  import { NDKEvent } from "@nostr-dev-kit/ndk";
  import { Button, Modal, Input, Textarea } from "flowbite-svelte";
  import { createEventDispatcher } from "svelte";
  import { ndk } from "../services/ndk";
  import { nanoid } from "nanoid";
  export let open = false;

  let name = "";
  let description = "";

  const dispatch = createEventDispatcher();

  const submit = async (e: SubmitEvent) => {
    e.preventDefault();

    const event = new NDKEvent(ndk);
    event.kind = 30563;
    event.content = "";
    event.tags.push(["d", name.toLowerCase().replaceAll(/\s/g, "-") || nanoid(8)]);
    event.tags.push(["name", name]);
    event.tags.push(["summary", description]);

    await event.publish();
    dispatch("created", event);
  };
</script>

<Modal bind:open size="xs" class="w-full" title="New Drive" outsideclose>
  <form id="new-folder-form`" class="flex flex-col gap-2 py-0" on:submit={submit}>
    <Input placeholder="Drive name" required bind:value={name} />
    <Textarea name="about" rows={4} placeholder="A short description" bind:value={description} />
    <div class="flex justify-end gap-2">
      <Button color="alternative" on:click={() => (open = false)}>Cancel</Button>
      <Button type="submit" for="new-folder-form">Create</Button>
    </div>
  </form>
</Modal>
