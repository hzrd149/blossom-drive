<script lang="ts">
  import { Progressbar, Spinner } from "flowbite-svelte";
  import { CheckOutline, InfoCircleOutline } from "flowbite-svelte-icons";
  import type Upload from "../../blossom-drive-client/Upload";

  export let upload: Upload;
  export let file: Upload["files"][0];
  export let progress: Upload["progress"][string] | undefined;

  $: servers = progress ? Object.keys(progress).length : 0;
</script>

<div class="flex flex-col gap-1">
  <div class="flex gap-1">
    <p>{file.path}</p>
    <div class="flex-1" />
    {#if progress}
      {#each Object.entries(progress) as [url, status]}
        {#if status.blob}
          <CheckOutline class="h-6 w-6 text-green-500" />
        {:else if status.error}
          <InfoCircleOutline class="h-6 w-6 text-red-500" />
        {:else}
          <Spinner size="6" />
        {/if}
      {/each}
    {:else}
      <Spinner size="6" />
    {/if}
  </div>
  {#if servers !== 0 && servers !== upload.servers.length}
    <Progressbar progress={(servers / upload.servers.length) * 100} />
  {/if}
</div>
