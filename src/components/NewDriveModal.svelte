<script lang="ts">
  import { Button, Modal, Input, Textarea, Spinner, Checkbox, Label, Alert } from "flowbite-svelte";
  import { createEventDispatcher } from "svelte";
  import { publishSignedEvent, signEventTemplate } from "../services/ndk";
  import { nanoid } from "nanoid";
  import Drive from "../blossom-drive-client/Drive";
  import { EncryptedDrive } from "../blossom-drive-client/EncryptedDrive";
  import { servers } from "../services/servers";
  export let open = false;

  let name = "";
  let description = "";
  let selectedServers: string[] = [];
  let encrypted = false;
  let password = "";
  let pwd2 = "";

  let loading = false;

  const dispatch = createEventDispatcher();

  function toggleServer(server: string) {
    if (selectedServers.includes(server)) selectedServers = selectedServers.filter((s) => s !== server);
    else selectedServers = selectedServers.concat(server);
  }

  const submit = async (e: SubmitEvent) => {
    try {
      e.preventDefault();
      loading = true;

      let drive: Drive;
      if (encrypted) {
        const e = (drive = new EncryptedDrive(signEventTemplate, publishSignedEvent));
        e.setPassword(password);
      } else drive = new Drive(signEventTemplate, publishSignedEvent);

      drive.name = name;
      drive.description = description;
      drive.identifier = encrypted ? nanoid(8) : name.toLowerCase().replaceAll(/\s/g, "-") || nanoid(8);

      await drive.save();
      dispatch("created", drive);
      open = false;
      loading = false;
    } catch (error) {
      if (error instanceof Error) alert(error.message);
      console.log(error);
    }
  };
</script>

<Modal bind:open size="sm" class="w-full" title="New Drive" outsideclose>
  {#if loading}
    <div class="flex items-center justify-center gap-4">
      <Spinner />
      <p class="text-lg font-bold">Saving...</p>
    </div>
  {:else}
    <form id="new-folder-form" class="flex flex-col gap-2 py-0" on:submit={submit}>
      <Input placeholder="Drive name" required bind:value={name} />
      <Textarea name="about" rows={4} placeholder="A short description" bind:value={description} />

      <Checkbox bind:checked={encrypted}>Encrypted</Checkbox>
      {#if encrypted}
        <p>Encrypted drives are password protected. anyone with the password will be able to decrypt and view files</p>
        <Alert color="yellow" border>
          <span class="font-medium">Warning!</span>
          Once the drive is created the password CAN NOT be changed
        </Alert>
        <Input type="password" bind:value={password} placeholder="Password" />
        <Input
          type="password"
          color={password ? (password === pwd2 ? "green" : "red") : undefined}
          bind:value={pwd2}
          placeholder="Retype password"
        />
      {/if}

      <Label class="mt-2 text-lg">Media Servers</Label>
      {#each $servers as server}
        <Checkbox checked={selectedServers.includes(server)} on:change={() => toggleServer(server)}
          >{new URL(server).hostname}</Checkbox
        >
      {/each}

      <div class="flex justify-end gap-2">
        <Button color="alternative" on:click={() => (open = false)}>Cancel</Button>
        <Button type="submit">Create</Button>
      </div>
    </form>
  {/if}
</Modal>
