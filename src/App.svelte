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

  let remember = localStorage.getItem("auto-login") === "true";

  $: {
    localStorage.setItem("auto-login", remember ? "true" : "false");
  }

  const routes = {
    "/files": Files,
    "/servers": Servers,
    "/misc": Misc,
    "/drive/:naddr": Drive,
    "/": Home,
    "*": NotFound,
  };
</script>

<div
  class="flex w-full flex-1 flex-col overflow-y-auto overflow-x-hidden bg-white text-gray-900 dark:bg-gray-900 dark:text-white"
>
  {#if $activeUser}
    <TopNav />
    <Router {routes} />
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
