<script lang="ts">
  import { Progressbar, Spinner } from "flowbite-svelte";
  import type Upload from "../blossom-drive-client/Upload";
  import { onMount } from "svelte";
  import { CheckOutline } from "flowbite-svelte-icons";

  export let upload: Upload;

  let complete = upload.complete;
  function updateComplete() {
    complete = upload.complete;
  }

  let progress = upload.totalProgress;
  function updateProgress() {
    progress = upload.totalProgress;
  }

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
  <div class="flex justify-between">
    <p>Uploaded {upload.files.length} files</p>
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
