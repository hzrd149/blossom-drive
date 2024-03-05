<script lang="ts">
  import { Button, DarkMode, Avatar } from "flowbite-svelte";
  import { activeUser, loginWithExtension } from "../services/ndk";
  import { CogSolid } from "flowbite-svelte-icons";
</script>

<div class="flex flex-wrap items-center gap-2 bg-gray-50 px-6 py-2 text-gray-700 dark:bg-gray-800 dark:text-gray-200">
  <h1 class="text-lg font-bold">
    <a href="#/">🌸 Blossom Drive</a>
  </h1>
  {#if $activeUser}
    <Button href="#/" size="sm" color="alternative">Drives</Button>
    <!-- <Button href="#/hosting" size="sm" color="alternative">Hosting</Button> -->
  {/if}

  <div class="mx-auto" />

  {#if $activeUser}
    <Button href="#/servers" size="sm" color="alternative"><CogSolid class="mr-2" /> Servers</Button>
  {/if}
  <DarkMode size="sm" />
  {#if $activeUser}
    <Avatar src={$activeUser.profile?.image} />
  {:else}
    <Button on:click={loginWithExtension}>Login</Button>
  {/if}
</div>
