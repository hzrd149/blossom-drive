<script lang="ts">
  import Router from "svelte-spa-router";
  import NotFound from "./pages/404.svelte";
  import Home from "./pages/Home.svelte";
  import TopNav from "./components/TopNav.svelte";
  import Servers from "./pages/Servers.svelte";
  import Files from "./pages/Files.svelte";
  import Blobs from "./pages/Blobs.svelte";
  import Drive from "./pages/Drive/Drive.svelte";
  import { Alert } from "flowbite-svelte";
  import { InfoCircleSolid } from "flowbite-svelte-icons";
  import Hosting from "./pages/Hosting.svelte";
  import { lastError } from "./services/error";
  import History from "./pages/History.svelte";
  import Sidebar from "./components/Sidebar.svelte";
  import UploadDrawer from "./components/UploadDrawer/UploadDrawer.svelte";
  import Login from "./pages/Login.svelte";

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

<div
  class="flex w-full flex-1 overflow-y-auto overflow-x-hidden bg-white text-gray-900 dark:bg-gray-900 dark:text-white"
>
  <Sidebar />
  <div class="flex flex-1 flex-col overflow-hidden">
    <TopNav />
    <Router {routes} />
  </div>
  <UploadDrawer />
</div>

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
