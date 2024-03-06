<script lang="ts">
  import Router from "svelte-spa-router";
  import NotFound from "./pages/404.svelte";
  import Home from "./pages/Home.svelte";
  import TopNav from "./components/TopNav.svelte";
  import { activeUser, loginWithExtension } from "./services/ndk";
  import Servers from "./pages/Servers.svelte";
  import Files from "./pages/Files.svelte";
  import Misc from "./pages/Misc.svelte";
  import Drive from "./pages/Drive.svelte";
  import { Alert, Button, Checkbox } from "flowbite-svelte";
  import { InfoCircleSolid } from "flowbite-svelte-icons";
  import Hosting from "./pages/Hosting.svelte";
  import { lastError } from "./services/error";
  import History from "./pages/History.svelte";
  import Sidebar from "./components/Sidebar.svelte";

  let remember = localStorage.getItem("auto-login") === "true";

  $: {
    localStorage.setItem("auto-login", remember ? "true" : "false");
  }

  const routes = {
    "/files": Files,
    "/hosting": Hosting,
    "/servers": Servers,
    "/misc": Misc,
    "/drive/:naddr": Drive,
    "/history/:naddr": History,
    "/": Home,
    "*": NotFound,
  };
</script>

<div
  class="flex w-full flex-1 flex-col overflow-y-auto overflow-x-hidden bg-white text-gray-900 dark:bg-gray-900 dark:text-white"
>
  {#if $activeUser}
    <TopNav />
    <div class="flex h-full">
      <Sidebar />
      <div class="flex flex-1 flex-col gap-2">
        <Router {routes} />
      </div>
    </div>
  {:else}
    <div class="flex h-full w-full flex-col items-center gap-4">
      <h1 class="text-4xl" style="margin-bottom: 20vh; margin-top: 10vh;">🌸 Blossom Drive</h1>
      <Alert color="red">
        <InfoCircleSolid slot="icon" class="h-4 w-4" />
        <span class="font-medium">Warning!</span>
        Everything on blossom is public, don't upload private files
      </Alert>

      <Button size="xl" on:click={loginWithExtension}>Login with nostr</Button>
      <Checkbox bind:checked={remember}>Stay logged in</Checkbox>
    </div>
  {/if}
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
