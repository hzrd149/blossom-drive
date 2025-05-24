<script lang="ts">
  import { Alert } from "flowbite-svelte";
  import { InfoCircleSolid } from "flowbite-svelte-icons";
  import Router from "svelte-spa-router";
  import Sidebar from "./components/Sidebar.svelte";
  import TopNav from "./components/TopNav.svelte";
  import UploadDrawer from "./components/UploadDrawer/UploadDrawer.svelte";
  import { hideSidebar } from "./helpers/sidebar";
  import NotFound from "./pages/404.svelte";
  import Blobs from "./pages/Blobs.svelte";
  import Drive from "./pages/Drive/Drive.svelte";
  import Files from "./pages/Files.svelte";
  import History from "./pages/History.svelte";
  import Home from "./pages/Home.svelte";
  import Hosting from "./pages/Hosting.svelte";
  import Login from "./pages/Login.svelte";
  import Servers from "./pages/Servers.svelte";
  import { lastError } from "./services/error";

  const routes = {
    "/files": Files,
    "/hosting": Hosting,
    "/servers": Servers,
    "/blobs": Blobs,
    "/drive/:naddr": Drive,
    "/history/:naddr": History,
    "/login": Login,
    "/": Home,
    "*": NotFound,
  };
</script>

<main
  class="flex w-full flex-1 overflow-y-auto overflow-x-hidden bg-white text-gray-900 dark:bg-gray-900 dark:text-white"
>
  <div class="flex flex-1 flex-col overflow-hidden">
    <Sidebar />
    <TopNav />
    <div on:click={hideSidebar} class="flex flex-1 flex-col overflow-hidden lg:ml-56">
      <Alert dismissable>
        <span class="font-medium">Abandoned project!</span>
        This project is no longer maintained.
        <a
          href="https://github.com/hzrd149/blossom-drive"
          class="font-semibold underline hover:text-blue-800 dark:hover:text-blue-900">See more</a
        >
        Please use the
        <a
          href="https://bouquet.slidestr.net"
          class="font-semibold underline hover:text-blue-800 dark:hover:text-blue-900">Bouquet</a
        > to manage your blossom blobs.
      </Alert>
      <Router {routes} />
    </div>
  </div>
  <UploadDrawer />
</main>

{#if $lastError}
  <Alert class="!items-start" dismissable on:close={() => ($lastError = null)}>
    <span slot="icon">
      <InfoCircleSolid slot="icon" class="h-4 w-4" />
      <span class="sr-only">Error</span>
    </span>
    <p class="font-medium">{$lastError.message}</p>
    <p class="whitespace-pre">{$lastError.stack}</p>
  </Alert>
{/if}
