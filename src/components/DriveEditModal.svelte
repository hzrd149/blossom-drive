<script lang="ts">
  import { Button, Modal, Input, Textarea, Spinner, Label, Checkbox } from "flowbite-svelte";
  import { type Drive } from "blossom-drive-sdk";
  import { servers } from "../services/servers";

  export let open = false;
  export let drive: Drive;

  let loading = false;
  let name = drive.name;
  let description = drive.description;
  let selectedServers = drive.servers.map((s) => new URL("/", s));

  const submit = async (e: SubmitEvent) => {
    loading = true;
    drive.name = name;
    drive.description = description;
    drive.servers = selectedServers.map((s) => s.toString());
    await drive.save();
    open = false;
    loading = false;
  };

  function toggleServer(server: URL) {
    if (selectedServers.some((s) => s.hostname === server.hostname))
      selectedServers = selectedServers.filter((s) => s.hostname !== server.hostname);
    else selectedServers = selectedServers.concat(server);
  }
</script>

<Modal bind:open size="xs" class="w-full" title="Edit Drive" outsideclose>
  {#if loading}
    <div class="flex items-center justify-center gap-4">
      <Spinner />
      <p class="text-lg font-bold">Saving...</p>
    </div>
  {:else}
    <form id="update-form" class="flex flex-col gap-2 py-0" on:submit|preventDefault={submit}>
      <Input placeholder="Drive name" required bind:value={name} />
      <Textarea name="about" rows={4} placeholder="A short description" bind:value={description} />

      <Label>Media Servers</Label>
      {#each $servers as server}
        <Checkbox
          checked={selectedServers.some((s) => s.hostname === server.hostname)}
          on:change={() => toggleServer(server)}>{new URL(server).hostname}</Checkbox
        >
      {/each}

      <div class="flex justify-end gap-2">
        <Button color="alternative" on:click={() => (open = false)}>Cancel</Button>
        <Button type="submit">Update</Button>
      </div>
    </form>
  {/if}
</Modal>
