<script lang="ts">
  import { Alert, Button, Input, Label, Modal, Select, Spinner } from "flowbite-svelte";
  import { BlossomClient, type BlobDescriptor } from "blossom-client";
  import { handleEvent, drives } from "../services/drives";
  import { servers } from "../services/servers";
  import { signEventTemplate } from "../services/ndk";
  import { cloneEvent } from "../helpers/event";
  import { getDriveName } from "../helpers/drives";
  import { InfoCircleSolid } from "flowbite-svelte-icons";
  import type Drive from "../blossom-drive-client/Drive";
  import { joinPath } from "../blossom-drive-client/FileTree/methods";

  export let open = false;
  export let drive: Drive | undefined = undefined;
  export let path: string = "";

  let driveId = "";
  let file: File | undefined = undefined;
  let name = "";

  let selectedDrive: Drive | undefined = undefined;
  $: selectedDrive = drive || $drives[driveId];

  function fileChange(e: Event) {
    if (e.target instanceof HTMLInputElement) {
      file = e.target.files?.[0];
      if (file) name = file.name;
    }
  }

  let loading = "";
  async function upload(e: SubmitEvent) {
    e.preventDefault();
    if (!file) return;
    if (!selectedDrive) return;

    loading = "Signing Auth";
    const auth = await BlossomClient.getUploadAuth(file, signEventTemplate);

    let blob: BlobDescriptor | null = null;
    for (const server of $servers) {
      loading = `Uploading to ${server}`;
      try {
        blob = await BlossomClient.uploadBlob(server, file, auth);
      } catch (e) {
        console.error(`Failed to upload to ${server}`);
        if (e instanceof Error) console.log(e.message);
      }
    }

    if (!blob) {
      console.error("Failed to upload");
      return;
    }

    loading = "Adding to drive...";
    selectedDrive.setFile(joinPath(path, name), { sha256: blob.sha256, size: blob.size, type: blob.type ?? "" });
    await selectedDrive.save();

    loading = "";
    open = false;
  }
</script>

<Modal bind:open size="md" outsideclose class="w-full" title="Upload File">
  {#if loading}
    <div class="flex items-center gap-4">
      <Spinner />
      <span>{loading}</span>
    </div>
  {:else}
    {#if $servers.length === 0}
      <Alert color="red">
        <InfoCircleSolid slot="icon" class="h-4 w-4" />
        <span class="font-medium">No Servers!</span>
        Go setup some <a href="#/servers" class="underline">servers</a> first before uploading
      </Alert>
    {/if}
    <form class="flex flex-col space-y-4" on:submit={upload}>
      <Input type="file" name="file" required on:change={fileChange} />
      {#if !drive}
        <Label>
          <span>Add to Drive</span>
          <Select bind:value={driveId} required>
            {#each Object.entries($drives) as [d, drive]}
              <option value={d}>{getDriveName(drive.event)}</option>
            {/each}
          </Select>
        </Label>
      {/if}
      <Label
        ><span>Filename</span>
        <Input type="text" name="name" required bind:value={name} />
      </Label>
      <Button type="submit" class="w-full" disabled={!file || $servers.length === 0}>Upload</Button>
    </form>
  {/if}
</Modal>
