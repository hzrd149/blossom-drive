<script lang="ts">
  import { Progressbar, Spinner } from "flowbite-svelte";
  import { onMount } from "svelte";
  import { CheckOutline, InfoCircleOutline } from "flowbite-svelte-icons";
  import { type Upload } from "blossom-drive-sdk";

  export let upload: Upload;

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

  $: hasErrors = Object.values(status).some((f) => Object.values(f.results).some((r) => !r.success));

  updateProgress();

  onMount(() => {
    upload.on("progress", updateProgress);
    upload.on("complete", updateComplete);
    return () => {
      upload.off("progress", updateProgress);
      upload.off("complete", updateComplete);
    };
  });
</script>

<button class="flex flex-col gap-1 rounded-md p-2 hover:bg-gray-300 dark:hover:bg-gray-700" on:click>
  <div class="flex gap-2">
    <p>{complete ? "Uploaded" : "Uploading"} {upload.files.length} files to {upload.drive.name}</p>
    <div class="flex-1" />
    {#if hasErrors}
      <InfoCircleOutline class="h-6 w-6 text-yellow-500" />
    {/if}
    {#if complete}
      <CheckOutline class="h-6 w-6 text-green-500" />
    {:else}
      <Spinner size="6" />
    {/if}
  </div>
  {#if !complete}
    <Progressbar progress={progress * 100} />
  {/if}
</button>
