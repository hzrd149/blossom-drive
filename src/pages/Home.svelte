<script lang="ts">
  import SimpleCard from "../components/SimpleCard.svelte";
  import { drives } from "../services/drives";
  import { Badge } from "flowbite-svelte";
  import { FolderOutline, TagOutline } from "flowbite-svelte-icons";
</script>

<main class="flex flex-col gap-4 p-4">
  <h2 class="text-xl font-bold">Drives</h2>
  <div class="flex w-full flex-wrap gap-4">
    {#each Object.values($drives) as drive}
      <a
        href={`#/drive/${drive.address}`}
        class="flex w-full max-w-sm flex-row divide-gray-200 rounded-lg border border-gray-200 bg-white text-gray-500 shadow-md hover:bg-gray-100 dark:divide-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
      >
        <div class="flex aspect-square h-full w-32 items-center justify-center p-4">
          <FolderOutline class="h-full w-full text-purple-500" />
        </div>
        <div class="relative flex-1 py-4 pb-4 pr-4">
          <h5 class="mb-2 text-lg font-bold tracking-tight text-gray-900 dark:text-white">
            {drive.name}
          </h5>

          <p class="font-normal leading-tight text-gray-700 dark:text-gray-400">
            {drive.description}
          </p>
          <Badge color="purple" class="absolute bottom-2 right-2">Public</Badge>
        </div>
      </a>
    {/each}
  </div>

  <h2 class="text-xl font-bold">Other stuff</h2>
  <div class="flex w-full flex-wrap gap-4">
    <a
      href="#/blobs"
      class="flex w-full max-w-sm flex-row divide-gray-200 rounded-lg border border-gray-200 bg-white text-gray-500 shadow-md hover:bg-gray-100 dark:divide-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
    >
      <div class="flex aspect-square h-full w-32 items-center justify-center p-4">
        <TagOutline class="h-full w-full" />
      </div>
      <div class="relative flex-1 py-4 pb-4 pr-4">
        <h5 class="mb-2 text-lg font-bold tracking-tight text-gray-900 dark:text-white">Miscellaneous Blobs</h5>

        <p class="font-normal leading-tight text-gray-700 dark:text-gray-400">
          All your loose blobs that are not in drives
        </p>
      </div>
    </a>

    <SimpleCard href="#/files">
      <span slot="title">Published Files</span>
      <span slot="description">Blobs that are published as files</span>
    </SimpleCard>
  </div>
</main>
