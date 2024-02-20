<script lang="ts">
  import { Button, DarkMode, Avatar } from "flowbite-svelte";
  import { activeUser, ndk } from "../services/ndk";
  import { NDKNip07Signer } from "@nostr-dev-kit/ndk";
  import { CogSolid } from "flowbite-svelte-icons";

  async function loginWithExt() {
    const signer: NDKNip07Signer = (ndk.signer = new NDKNip07Signer());
    await signer.blockUntilReady();
    const user = await signer.user();
    await user.fetchProfile();
    await user.relayList();
    $activeUser = user;
  }
</script>

<div class="flex items-center gap-2 bg-gray-50 px-6 py-2 text-gray-700 dark:bg-gray-800 dark:text-gray-200">
  <h1 class="mr-auto text-lg font-bold">
    <a href="#/">🌸 Blossom Drive</a>
  </h1>

  {#if $activeUser}
    <Button href="#/servers" size="sm" color="alternative"><CogSolid class="mr-2" /> Servers</Button>
  {/if}
  <DarkMode size="sm" />
  {#if $activeUser}
    <Avatar src={$activeUser.profile?.image} />
  {:else}
    <Button on:click={loginWithExt}>Login</Button>
  {/if}
</div>
