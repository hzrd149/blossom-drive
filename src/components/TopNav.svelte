<script lang="ts">
  import { Button, DarkMode, Avatar, Input } from "flowbite-svelte";
  import { activeUser, loginWithExtension } from "../services/ndk";
  import _throttle from "lodash.throttle";
  import { FileSolid } from "flowbite-svelte-icons";
  import { searchForFiles, type FileResult } from "../services/search";
  import { getDriveName } from "../helpers/drives";

  let search = "";

  let results: FileResult[] = [];
  function doSearch(s: string) {
    if (s.length > 1) results = searchForFiles(s);
    else results = [];
  }
  function reset() {
    results = [];
    search = "";
  }

  const throttleSearch = _throttle(doSearch);

  $: throttleSearch(search);
</script>

<div class="flex flex-wrap items-center gap-2 bg-gray-50 px-6 py-2 text-gray-700 dark:bg-gray-800 dark:text-gray-200">
  <h1 class="text-lg font-bold">
    <a href="#/">🌸 Blossom Drive</a>
  </h1>

  <div class="mx-10 mr-auto flex max-w-lg flex-1 flex-col">
    <Input type="search" size="sm" placeholder="Search Drives" bind:value={search} />
    {#if results.length > 0}
      <div class="relative w-full">
        <div
          class="absolute left-0 right-0 top-1 z-50 flex flex-col gap-2 rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900"
        >
          {#each results as result}
            <a
              class="flex items-center gap-2 px-2 py-1 hover:bg-gray-200 dark:hover:bg-gray-800"
              href="#/drive/{result.drive.address}?path={encodeURIComponent(result.path)}"
              on:click={reset}
            >
              <FileSolid class="h-4 w-4" />
              <span>{result.filename}</span>
              <span class="text-xs text-gray-500">{getDriveName(result.drive.event)}{result.path}</span>
            </a>
          {/each}
        </div>
      </div>
    {/if}
  </div>

  <DarkMode size="sm" />
  {#if $activeUser}
    <Avatar src={$activeUser.profile?.image} />
  {:else}
    <Button on:click={loginWithExtension}>Login</Button>
  {/if}
</div>
