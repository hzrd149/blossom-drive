<script lang="ts">
  import { Card } from "flowbite-svelte";
  import { blobs, type Blob } from "../services/blobs";

  let miscBlobs: Blob[] = [];
  $: {
    miscBlobs = $blobs.map((s) => s.blobs).flat();
  }
</script>

<main class="flex flex-wrap gap-4 p-4">
  {#each miscBlobs as blob}
    <Card>
      <h5 class="mb-2 text-xl font-bold tracking-tight text-gray-900 dark:text-white">
        {blob.mimeType}
        <!-- {getFileName(file)} -->
      </h5>
      <p class="truncate text-xs">{blob.created}</p>
      <p class="font-normal leading-tight text-gray-700 dark:text-gray-400">
        {blob.sha256}
      </p>
    </Card>
  {/each}
</main>
