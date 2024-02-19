<script lang="ts">
  import Router from "svelte-spa-router";
  import NotFound from "./pages/404.svelte";
  import Home from "./pages/Home.svelte";
  import TopNav from "./components/TopNav.svelte";
  import { activeUser } from "./services/ndk";
  import Servers from "./pages/Servers.svelte";
  import Files from "./pages/Files.svelte";
  import Misc from "./pages/Misc.svelte";
  import Pack from "./pages/Pack.svelte";

  const routes = {
    "/files": Files,
    "/servers": Servers,
    "/misc": Misc,
    "/pack/:naddr": Pack,
    "/": Home,
    "*": NotFound,
  };
</script>

<TopNav />
<div class="flex w-full flex-1 flex-col gap-2 overflow-y-auto overflow-x-hidden bg-white dark:bg-gray-900">
  {#if $activeUser}
    <Router {routes} />
  {:else}
    <h1>Login first</h1>
  {/if}
</div>
