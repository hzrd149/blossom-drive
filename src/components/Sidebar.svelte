<script>
  import {
    Sidebar,
    SidebarGroup,
    SidebarItem,
    SidebarWrapper,
    SidebarDropdownItem,
    SidebarDropdownWrapper,
  } from "flowbite-svelte";
  import {
    GridSolid,
    MailBoxSolid,
    UserSolid,
    ArrowRightToBracketSolid,
    HomeSolid,
    FileSearchSolid,
  } from "flowbite-svelte-icons";
  let spanClass = "flex-1 ms-3 whitespace-nowrap";
</script>

<Sidebar class="h-full">
  <SidebarWrapper>
    <SidebarGroup>
      <SidebarItem label="Dashboard">
        <svelte:fragment slot="icon">
          <HomeSolid
            class="h-5 w-5 text-gray-500 transition duration-75 group-hover:text-gray-900 dark:text-gray-400 dark:group-hover:text-white"
          />
        </svelte:fragment>
      </SidebarItem>
      <SidebarDropdownWrapper label="E-commerce">
        <svelte:fragment slot="icon">
          <FileSearchSolid
            class="h-5 w-5 text-gray-500 transition duration-75 group-hover:text-gray-900 dark:text-gray-400 dark:group-hover:text-white"
          />
        </svelte:fragment>
        <SidebarDropdownItem label="Products" />
        <SidebarDropdownItem label="Billing" />
        <SidebarDropdownItem label="Invoice" />
      </SidebarDropdownWrapper>
      <SidebarItem label="Kanban" {spanClass}>
        <svelte:fragment slot="icon">
          <GridSolid
            class="h-5 w-5 text-gray-500 transition duration-75 group-hover:text-gray-900 dark:text-gray-400 dark:group-hover:text-white"
          />
        </svelte:fragment>
        <svelte:fragment slot="subtext">
          <span
            class="ms-3 inline-flex items-center justify-center rounded-full bg-gray-200 px-2 text-sm font-medium text-gray-800 dark:bg-gray-700 dark:text-gray-300"
          >
            Pro
          </span>
        </svelte:fragment>
      </SidebarItem>
      <SidebarItem label="Inbox" {spanClass}>
        <svelte:fragment slot="icon">
          <MailBoxSolid
            class="h-5 w-5 text-gray-500 transition duration-75 group-hover:text-gray-900 dark:text-gray-400 dark:group-hover:text-white"
          />
        </svelte:fragment>
        <svelte:fragment slot="subtext">
          <span
            class="ms-3 inline-flex h-3 w-3 items-center justify-center rounded-full bg-primary-200 p-3 text-sm font-medium text-primary-600 dark:bg-primary-900 dark:text-primary-200"
          >
            3
          </span>
        </svelte:fragment>
      </SidebarItem>
      <SidebarItem label="Users">
        <svelte:fragment slot="icon">
          <UserSolid
            class="h-5 w-5 text-gray-500 transition duration-75 group-hover:text-gray-900 dark:text-gray-400 dark:group-hover:text-white"
          />
        </svelte:fragment>
      </SidebarItem>
      <SidebarItem label="Sign In">
        <svelte:fragment slot="icon">
          <ArrowRightToBracketSolid
            class="h-5 w-5 text-gray-500 transition duration-75 group-hover:text-gray-900 dark:text-gray-400 dark:group-hover:text-white"
          />
        </svelte:fragment>
      </SidebarItem>
    </SidebarGroup>
  </SidebarWrapper>
</Sidebar>
