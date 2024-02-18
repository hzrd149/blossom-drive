<script lang="ts">
  import { onDestroy } from "svelte";
  import NewFolderModal from "../components/NewFolderModal.svelte";
  import Sidebar from "../components/Sidebar.svelte";
  import SpeedDialMenu from "../components/SpeedDialMenu.svelte";
  import { activeUser, ndk } from "../services/ndk";
  import { Card } from "flowbite-svelte";
  import { getPackName } from "../helpers/packs";
  import NewPackModal from "../components/NewPackModal.svelte";
  import type { NDKEvent } from "@nostr-dev-kit/ndk";
  import SimpleCard from "../components/SimpleCard.svelte";

  let newFolder = false;
  let newPack = false;

  const packs = ndk.storeSubscribe({
    kinds: [30063 as number],
    authors: [$activeUser.pubkey],
  });

  onDestroy(() => {
    packs.unsubscribe();
  });

  const createPack = (event: CustomEvent<NDKEvent>) => {
    newPack = false;
    location.hash = "#/pack/" + event.detail.encode;
  };
</script>

<!-- <Sidebar /> -->
<main class="flex flex-col gap-4 p-4">
  <div class="flex w-full flex-wrap gap-4">
    {#each $packs as pack}
      <SimpleCard href={`#/pack/${pack.encode()}`}>
        <span slot="title">{getPackName(pack)}</span>
        <span slot="description">{pack.content}</span>
      </SimpleCard>
    {/each}
  </div>

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
  <SpeedDialMenu on:new-folder={() => (newFolder = true)} on:new-pack={() => (newPack = true)} />
{/if}

{#if newPack}
  <NewPackModal bind:open={newPack} on:create={createPack} />
{/if}
{#if newFolder}
  <NewFolderModal bind:open={newFolder} />
{/if}
