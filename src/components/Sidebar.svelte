<script>
  import {
    Sidebar,
    SidebarGroup,
    SidebarItem,
    SidebarWrapper,
    SidebarDropdownItem,
    SidebarDropdownWrapper,
    Button,
    SidebarBrand,
  } from "flowbite-svelte";
  import { HomeSolid, ArchiveSolid, CogSolid, PlusSolid, TagSolid, DatabaseOutline } from "flowbite-svelte-icons";
  import { drives } from "../services/drives";

  let site = {
    name: "Blossom Drive",
    href: "/#/",
    img: "/pwa-192x192.png",
  };
</script>

<Sidebar class="h-full">
  <SidebarWrapper class="h-full">
    <SidebarBrand {site} />
    <Button size="lg" class="mb-2 w-full"><PlusSolid class="me-2 h-6 w-6" />New</Button>
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
      </SidebarItem>
      <!-- <SidebarItem label="Logout">
        <ArrowRightToBracketSolid slot="icon" class="h-5 w-5" />
      </SidebarItem> -->
    </SidebarGroup>
  </SidebarWrapper>
</Sidebar>
