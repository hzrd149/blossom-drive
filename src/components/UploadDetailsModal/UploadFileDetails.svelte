<script lang="ts">
  import { Progressbar, Spinner } from "flowbite-svelte";
  import { CheckOutline, CloseCircleOutline } from "flowbite-svelte-icons";
  import { type Upload, type UploadFileStatus } from "blossom-drive-client";

  export let upload: Upload;
  export let file: Upload["files"][0];
  export let status: UploadFileStatus | undefined;

  let open = false;
</script>

<div class="flex flex-col gap-1">
  <button class="flex rounded-md p-2 hover:bg-gray-200 dark:hover:bg-gray-800" on:click={() => (open = !open)}>
    <p class="text-gray-800 dark:text-gray-200">{file.path}</p>
    <div class="flex-1" />
    {#if !status}
      <Spinner size="6" />
    {:else}
      {#each Object.entries(status.results) as [server, result]}
        {#if result !== undefined}
          {#if result.success}
            <CheckOutline class="h-6 w-6 text-green-500" />
          {:else if result}
            <CloseCircleOutline class="h-6 w-6 text-red-500" />
          {/if}
        {:else}
          <Spinner size="6" />
        {/if}
      {/each}
    {/if}
  </button>
  {#if status && !status.pending && !status.complete}
    <Progressbar progress={(status.serversComplete / upload.servers.length) * 100} />
  {/if}

  {#if open && status}
    <div class="flex- flex-col gap-2 px-2 pb-4">
      {#each Object.entries(status.results) as [server, result]}
        {#if result}
          <div class="flex gap-1">
            {#if result.success}
              <CheckOutline class="h-6 w-6 text-green-500" />
            {:else}
              <CloseCircleOutline class="h-6 w-6 text-red-500" />
            {/if}
            <a href={server} target="_blank" class="text-gray-800 hover:underline dark:text-gray-200"
              >{new URL(server).hostname}</a
            >
            <span> - </span>
            {#if result.success}
              <span>{result.blob.sha256}</span>
            {:else}
              <span>{result.error.message}</span>
            {/if}
          </div>
        {/if}
      {/each}
    </div>
  {/if}
</div>
