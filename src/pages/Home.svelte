<script lang="ts">
  import { onDestroy } from "svelte";
  import SpeedDialMenu from "../components/SpeedDialMenu.svelte";
  import { activeUser, ndk } from "../services/ndk";
  import { getPackName } from "../helpers/packs";
  import SimpleCard from "../components/SimpleCard.svelte";

  const packs = ndk.storeSubscribe({
    kinds: [30563 as number],
    authors: [$activeUser.pubkey],
  });

  onDestroy(() => {
    packs.unsubscribe();
  });
</script>

<main class="flex flex-col gap-4 p-4">
  <h2 class="text-xl font-bold">Packs</h2>
  <div class="flex w-full flex-wrap gap-4">
    {#each $packs as pack}
      <SimpleCard href={`#/pack/${pack.encode()}`}>
        <span slot="title">{getPackName(pack)}</span>
        <span slot="description">{pack.content}</span>
      </SimpleCard>
    {/each}
  </div>

  <h2 class="text-xl font-bold">Other stuff</h2>
  <div class="flex w-full flex-wrap gap-4">
    <SimpleCard href="#/misc">
      <span slot="title">Miscellaneous</span>
      <span slot="description">All your loose blobs that are not in packs</span>
    </SimpleCard>
    <SimpleCard href="#/files">
      <span slot="title">Published Files</span>
      <span slot="description">Blobs that are published as files</span>
    </SimpleCard>
  </div>
</main>
{#if $activeUser}
  <SpeedDialMenu />
{/if}
