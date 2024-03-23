<script lang="ts">
  import { Button, Modal } from "flowbite-svelte";
  import { onMount } from "svelte";
  import { type Upload } from "blossom-drive-sdk";
  import UploadFileDetails from "./UploadFileDetails.svelte";

  export let open = false;
  export let upload: Upload;

  let running = upload.running;
  function updateRunning() {
    running = upload.running;
  }
  let complete = upload.complete;
  function updateComplete() {
    complete = upload.complete;
  }

  let progress = upload.progress;
  let status = upload.status;
  function updateProgress() {
    progress = upload.progress;
    status = upload.status;
  }

  onMount(() => {
    upload.on("progress", updateProgress);
    upload.on("complete", updateComplete);
    upload.on("start", updateRunning);
    return () => {
      upload.off("progress", updateProgress);
      upload.off("complete", updateComplete);
      upload.off("start", updateRunning);
    };
  });
</script>

<Modal bind:open size="lg" title="Upload Progress" outsideclose>
  <p class="text-base leading-relaxed text-gray-800 dark:text-gray-200">
    Uploading {upload.files.length} files to {upload.drive.name}
  </p>
  <div class="flex flex-col">
    {#each upload.files as file}
      <UploadFileDetails {upload} {file} status={status[file.id] ? { ...status[file.id] } : undefined} />
    {/each}
  </div>
  {#if !running}
    <Button slot="footer" on:click={() => upload.upload()}>Start Upload</Button>
  {/if}
</Modal>
