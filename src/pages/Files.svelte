<script lang="ts">
  import { onDestroy } from "svelte";
  import { Card } from "flowbite-svelte";
  import { NDKKind } from "@nostr-dev-kit/ndk";

  import { activeUser, ndk } from "../services/ndk";
  import { getFileHash, getFileName, getFileSummary } from "../helpers/files";

  const files = ndk.storeSubscribe({ kinds: [NDKKind.Media], authors: [$activeUser.pubkey] });

  onDestroy(() => {
    files.unsubscribe();
  });
</script>

<main class="flex flex-wrap gap-4 p-4">
  {#each $files as file}
    <Card>
      <h5 class="mb-2 text-xl font-bold tracking-tight text-gray-900 dark:text-white">
        {getFileName(file)}
      </h5>
      <p class="truncate text-xs">{getFileHash(file)}</p>
      <p class="font-normal leading-tight text-gray-700 dark:text-gray-400">
        {getFileSummary(file)}
      </p>
    </Card>
  {/each}
</main>
