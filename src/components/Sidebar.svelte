<script lang="ts">
  import {
    Sidebar,
    SidebarGroup,
    SidebarItem,
    SidebarWrapper,
    SidebarDropdownItem,
    SidebarDropdownWrapper,
    Button,
    SidebarBrand,
    DropdownItem,
    DropdownDivider,
    Dropdown,
  } from "flowbite-svelte";
  import {
    HomeSolid,
    ArchiveSolid,
    PlusSolid,
    TagSolid,
    DatabaseOutline,
    FolderArrowRightOutline,
    FileImportOutline,
    InfoCircleOutline,
  } from "flowbite-svelte-icons";
  import type { NDKEvent } from "@nostr-dev-kit/ndk";

  import { drives } from "../services/drives";
  import { servers } from "../services/servers";
  import NewDriveModal from "./NewDriveModal.svelte";
  import { activeUser } from "../services/ndk";
  import type Drive from "../blossom-drive-client/Drive";

  let site = {
    name: "Blossom Drive",
    href: "/#/",
    img: "/pwa-192x192.png",
  };

  let newDriveModal = false;

  const createdDrive = (event: CustomEvent<Drive>) => {
    location.hash = "#/drive/" + event.detail.address;
  };
</script>

<Sidebar class="h-full">
  <SidebarWrapper class="h-full">
    <SidebarBrand {site} />

    <Button size="lg" class="mb-2 w-full" disabled={$activeUser === undefined}
      ><PlusSolid class="me-2 h-6 w-6" />New</Button
    >
    <Dropdown class="w-60">
      <DropdownItem on:click={() => (newDriveModal = true)}
        ><ArchiveSolid class="inline-block h-6 w-6" /> Drive</DropdownItem
      >
      <DropdownDivider />
      <DropdownItem><FileImportOutline class="inline-block h-6 w-6" /> Upload Files</DropdownItem>
      <DropdownItem><FolderArrowRightOutline class="inline-block h-6 w-6" /> Upload Folder</DropdownItem>
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
