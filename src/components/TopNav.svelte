<script lang="ts">
  import _throttle from "lodash.throttle";
  import { FileSolid } from "flowbite-svelte-icons";
  import { Name } from "@nostr-dev-kit/ndk-svelte-components";
  import {Button, DarkMode, Avatar, Search, Dropdown, DropdownItem, SidebarBrand} from "flowbite-svelte";
  import { activeUser, logout } from "../services/ndk";
  import { searchForFiles, type FileResult } from "../services/search";
  import {toggleSidebar} from "../helpers/sidebar";

  let site = {
    name: "Blossom Drive",
    href: "/#/",
    img: "/pwa-192x192.png",
  };

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

<header id="topnav" class="relative z-20 flex flex-wrap items-center justify-between bg-gray-50 p-2 text-gray-700 dark:bg-gray-800 dark:text-gray-200">

  <div class="flex items-center gap-2">
    <button id="toggleSidebarMobile" on:click={toggleSidebar} aria-expanded="true" aria-controls="sidebar" class="p-2 text-gray-600 rounded cursor-pointer lg:hidden hover:text-gray-900 hover:bg-gray-100 focus:bg-gray-100 dark:focus:bg-gray-700 focus:ring-2 focus:ring-gray-100 dark:focus:ring-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white">
      <svg id="toggleSidebarMobileHamburger" class="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
        <path stroke="currentColor" stroke-linecap="round" stroke-width="2" d="M5 7h14M5 12h14M5 17h10"/>
      </svg>
      <svg id="toggleSidebarMobileClose" class="hidden w-6 h-6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path></svg>
    </button>
    <SidebarBrand class="mb-0" spanClass="hidden lg:inline-block" {site} />
  </div>
  {#if $activeUser}
    <div class="hidden lg:flex max-w-lg flex-1 flex-col">
      <Search type="search" size="sm" placeholder="Search Drives" bind:value={search} />
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
                <span class="text-xs text-gray-500">{result.drive.name}{result.path}</span>
              </a>
            {/each}
          </div>
        </div>
      {/if}
    </div>
  {/if}

  <div class="flex items-center justify-end gap-2">
    <DarkMode size="sm" />
    {#if $activeUser}
      <Avatar src={$activeUser.profile?.image} class="cursor-pointer" />
      <Dropdown>
        <div slot="header" class="px-4 py-2">
          <span class="block text-sm text-gray-900 dark:text-white"><Name user={$activeUser} /></span>
          {#if $activeUser.profile?.nip05}
            <span class="block truncate text-sm font-medium">{$activeUser.profile?.nip05}</span>
          {/if}
        </div>
        <DropdownItem href="https://nosta.me/{$activeUser.npub}" target="_blank">Profile</DropdownItem>
        <DropdownItem slot="footer" on:click={logout}>Logout</DropdownItem>
      </Dropdown>
    {:else}
      <Button href="#/login">Login</Button>
    {/if}
  </div>

</header>
