<script lang="ts">
  import {
    Sidebar,
    SidebarGroup,
    SidebarItem,
    SidebarWrapper,
    SidebarDropdownItem,
    SidebarDropdownWrapper,
    Button,
    Search,
    DropdownItem,
    Dropdown,
  } from "flowbite-svelte";
  import {
    HomeSolid,
    ArchiveSolid,
    PlusOutline,
    TagSolid,
    DatabaseOutline,
    InfoCircleOutline,
    FileSolid
  } from "flowbite-svelte-icons";
  import { type Drive } from "blossom-drive-sdk";
  import {onMount} from "svelte";
  import { drives } from "../services/drives";
  import { servers } from "../services/servers";
  import NewDriveModal from "./NewDriveModal.svelte";
  import { activeUser } from "../services/ndk";
  import {doHideSidebar, doToggleSidebar} from "../helpers/sidebar";
  import { searchForFiles, type FileResult } from "../services/search";

  let newDriveModal = false;

  let search = "";

  let results: FileResult[] = [];
  function doSearch(s: string) {
    if (s.length > 1) results = searchForFiles(s);
    else results = [];
  }
  function reset() {
    results = [];
    search = "";
  };

  onMount(() => doToggleSidebar());
  onMount(() => doHideSidebar());

  const createdDrive = (event: CustomEvent<Drive>) => {
    location.hash = "#/drive/" + event.detail.address;
  };
</script>

<Sidebar id="sidebar" class="flex -translate-x-56 lg:translate-x-0 fixed z-10 top-0 pt-14 left-0 flex-col flex-shrink-0 w-56 h-full duration-75 transition-transform">
  <SidebarWrapper class="h-full rounded-none">
    {#if $activeUser}
      <div class="flex lg:hidden max-w-lg flex-1 flex-col mb-5">
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
    <Button size="lg" class="mb-2 w-full" disabled={$activeUser === undefined}>
      <PlusOutline class="me-2 h-6 w-6" />New
    </Button>
    <Dropdown class="w-60">
      <DropdownItem on:click={() => (newDriveModal = true)}>
        <ArchiveSolid class="inline-block h-6 w-6" /> Drive
      </DropdownItem>
      <!-- <DropdownDivider />
      <DropdownItem><FileImportOutline class="inline-block h-6 w-6" /> Upload Files</DropdownItem>
      <DropdownItem><FolderArrowRightOutline class="inline-block h-6 w-6" /> Upload Folder</DropdownItem> -->
    </Dropdown>

    {#if $activeUser}
      <SidebarGroup>
        <SidebarItem label="Home" href="#/">
          <HomeSolid slot="icon" class="h-5 w-5" />
        </SidebarItem>
        <SidebarDropdownWrapper label="Drives">
          <ArchiveSolid slot="icon" class="h-5 w-5" />
          {#each Object.values($drives) as drive}
            <SidebarDropdownItem label={drive.name} href="#/drive/{drive.address}" />
          {/each}
        </SidebarDropdownWrapper>
        <!-- <SidebarItem label="Hosting" href="#/hosting">
        <GridSolid slot="icon" class="h-5 w-5" />
      </SidebarItem> -->
        <SidebarItem label="Blobs" href="#/blobs">
          <TagSolid class="h-5 w-5" slot="icon" />
        </SidebarItem>
        <SidebarItem label="Servers" href="#/servers">
          <DatabaseOutline class="h-5 w-5" slot="icon" />
          {#if $servers.length === 0}
            <InfoCircleOutline slot="subtext" class="ml-auto h-5 w-5 text-red-500" />
          {/if}
        </SidebarItem>
        <!-- <SidebarItem label="Logout">
        <ArrowRightToBracketSolid slot="icon" class="h-5 w-5" />
      </SidebarItem> -->
      </SidebarGroup>
    {/if}
  </SidebarWrapper>
</Sidebar>

{#if newDriveModal}
  <NewDriveModal bind:open={newDriveModal} on:created={createdDrive} />
{/if}
