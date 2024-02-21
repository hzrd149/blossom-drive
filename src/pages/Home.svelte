<script lang="ts">
  import SpeedDialMenu from "../components/SpeedDialMenu.svelte";
  import { activeUser } from "../services/ndk";
  import { getDriveName, getDriveSummary } from "../helpers/drives";
  import SimpleCard from "../components/SimpleCard.svelte";
  import { drives } from "../services/drives";
</script>

<main class="flex flex-col gap-4 p-4">
  <h2 class="text-xl font-bold">Drives</h2>
  <div class="flex w-full flex-wrap gap-4">
    {#each Object.values($drives) as drive}
      <SimpleCard href={`#/drive/${drive.encode()}`}>
        <span slot="title">{getDriveName(drive)}</span>
        <span slot="description">{getDriveSummary(drive)}</span>
      </SimpleCard>
    {/each}
  </div>

  <h2 class="text-xl font-bold">Other stuff</h2>
  <div class="flex w-full flex-wrap gap-4">
    <SimpleCard href="#/misc">
      <span slot="title">Miscellaneous</span>
      <span slot="description">All your loose blobs that are not in drives</span>
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
