<script lang="ts">
  import { ChevronDownOutline, ChevronUpOutline, UploadOutline } from "flowbite-svelte-icons";
  import { uploads, drawerOpen } from "../../services/uploads";
  import UploadRow from "./UploadRow.svelte";
  import type Upload from "../../blossom-drive-client/Upload";
  import UploadDetailsModal from "../UploadDetailsModal/UploadDetailsModal.svelte";

  let uploadDetails = false;
  let selectedUpload: Upload;
</script>

{#if $uploads.length > 0}
  <div
    id="upload-drawer"
    class="fixed bottom-0 right-4 flex flex-col rounded-t-lg border-2 border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-800"
  >
    <button class="flex flex-1 items-center p-2" on:click={() => ($drawerOpen = !$drawerOpen)}>
      <UploadOutline class="mx-2 h-6 w-6" />
      <span class="text-lg font-bold">Uploads</span>
      {#if $drawerOpen}
        <ChevronDownOutline class="ml-auto h-6 w-6" />
      {:else}
        <ChevronUpOutline class="ml-auto h-6 w-6" />
      {/if}
    </button>
    {#if $drawerOpen}
      <div class="flex h-96 flex-col overflow-auto p-2">
        {#each $uploads as upload}
          <UploadRow
            {upload}
            on:click={() => {
              selectedUpload = upload;
              uploadDetails = true;
            }}
          />
        {/each}
      </div>
    {/if}
  </div>
{/if}

{#if uploadDetails}
  <UploadDetailsModal bind:open={uploadDetails} upload={selectedUpload} />
{/if}

<style>
  #upload-drawer {
    width: 25vw;
    min-width: 20rem;
  }
</style>
