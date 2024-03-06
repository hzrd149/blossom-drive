<script>
  import {
    Sidebar,
    SidebarGroup,
    SidebarItem,
    SidebarWrapper,
    SidebarDropdownItem,
    SidebarDropdownWrapper,
  } from "flowbite-svelte";
  import { GridSolid, HomeSolid, ArchiveSolid, CogSolid } from "flowbite-svelte-icons";
  import { drives } from "../services/drives";
  import { getDriveName } from "../helpers/drives";
</script>

<Sidebar class="h-full">
  <SidebarWrapper class="h-full">
    <!-- <div class="mb-2 flex items-center gap-2">
      {#if $activeUser}
        <Avatar src={$activeUser.profile?.image} />
        <span class="font-bold">
          <Name user={$activeUser} />
        </span>
      {/if}
    </div> -->
    <SidebarGroup>
      <SidebarItem label="Home" href="#/">
        <HomeSolid slot="icon" class="h-5 w-5" />
      </SidebarItem>
      <SidebarDropdownWrapper label="Drives">
        <ArchiveSolid slot="icon" class="h-5 w-5" />
        {#each Object.values($drives) as drive}
          <SidebarDropdownItem label={getDriveName(drive)} href="#/drive/{drive.encode()}" />
        {/each}
      </SidebarDropdownWrapper>
      <SidebarItem label="Hosting" href="#/hosting">
        <GridSolid slot="icon" class="h-5 w-5" />
      </SidebarItem>
      <SidebarItem label="Servers" href="#/servers">
        <CogSolid class="h-5 w-5" slot="icon" />
      </SidebarItem>
      <!-- <SidebarItem label="Logout">
        <ArrowRightToBracketSolid slot="icon" class="h-5 w-5" />
      </SidebarItem> -->
    </SidebarGroup>
  </SidebarWrapper>
</Sidebar>
