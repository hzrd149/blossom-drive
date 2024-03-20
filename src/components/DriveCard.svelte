<script lang="ts">
  import { FolderOutline, LockSolid } from "flowbite-svelte-icons";
  import { Badge } from "flowbite-svelte";
  import { type Drive, EncryptedDrive } from "blossom-drive-client";

  export let drive: Drive;

  $: isEncrypted = drive instanceof EncryptedDrive;

  $: locked = drive instanceof EncryptedDrive && drive.locked;
  $: name = !(drive instanceof EncryptedDrive) || !drive.locked ? drive.name : drive.identifier;
  $: description = !(drive instanceof EncryptedDrive) || !drive.locked ? drive.description : "[Locked]";
</script>

<a
  href={`#/drive/${drive.address}`}
  class="flex w-full max-w-sm flex-row divide-gray-200 rounded-lg border border-gray-200 bg-white text-gray-500 shadow-md hover:bg-gray-100 dark:divide-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
>
  <div class="flex aspect-square h-full w-32 items-center justify-center p-4">
    {#if isEncrypted}
      {#if locked}
        <LockSolid class="h-full w-full text-green-500" />
      {:else}
        <FolderOutline class="h-full w-full text-green-500" />
      {/if}
    {:else}
      <FolderOutline class="h-full w-full text-purple-500" />
    {/if}
  </div>
  <div class="relative flex-1 py-4 pb-4 pr-4">
    <h5 class="mb-2 text-lg font-bold tracking-tight text-gray-900 dark:text-white">
      {name}
    </h5>

    <p class="font-normal leading-tight text-gray-700 dark:text-gray-400">
      {description}
    </p>
    {#if isEncrypted}
      <Badge color="green" class="absolute bottom-2 right-2">Encrypted</Badge>
    {:else}
      <Badge color="purple" class="absolute bottom-2 right-2">Public</Badge>
    {/if}
  </div>
</a>
