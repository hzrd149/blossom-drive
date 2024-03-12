<script lang="ts">
  import { Progressbar } from "flowbite-svelte";
  import type Upload from "../blossom-drive-client/Upload";
  import { onMount } from "svelte";
  import { CheckOutline } from "flowbite-svelte-icons";

  export let upload: Upload;

  let complete = upload.complete;
  function updateComplete() {
    complete = upload.complete;
  }

  let progress: Record<string, number> = {};
  function updateProgress() {
    for (const [id, fileProgress] of Object.entries(upload.progress)) {
      const done = Object.values(fileProgress).filter((v) => !!v.blob).length;
      progress = { ...progress, [id]: (done / upload.servers.length) * 100 };
    }
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

{#if upload.complete}
  <div class="flex h-10 items-center gap-2 rounded-md p-2 hover:bg-gray-300 dark:hover:bg-gray-700">
    <p>Uploaded {upload.files.length} files to {upload.servers.map((s) => new URL(s).hostname).join(", ")}</p>
    <CheckOutline class="ml-auto h-6 w-6 text-green-500" />
  </div>
{:else}
  {#each upload.files as file}
    <div class="flex flex-col gap-1">
      <p>{file.path}</p>
      <Progressbar progress={progress[file.id] ?? 0} />
    </div>
  {/each}
{/if}
