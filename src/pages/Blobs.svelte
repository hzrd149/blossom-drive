<script lang="ts">
  import { onMount } from "svelte";
  import { Select, Table, TableBody, TableBodyCell, TableBodyRow, TableHead, TableHeadCell } from "flowbite-svelte";
  import dayjs from "dayjs";
  import { type Drive } from "blossom-drive-sdk";
  import { BlossomClient, type BlobDescriptor } from "blossom-client-sdk";

  import { blobs, refreshBlobs } from "../services/blobs";
  import { drives } from "../services/drives";
  import { formatBytes } from "../helpers/number";
  import { getBlobURL } from "../helpers/blob";
  import { activeUser, signEventTemplate } from "../services/ndk";
  import { servers } from "../services/servers";
  import LoginPage from "../components/LoginPage.svelte";

  onMount(() => {
    refreshBlobs();
  });

  let selectedDrive = "";
  let selectedType = "";
  let selectedServer = "";

  $: filteredBlobs = $blobs
    .filter((s) => (selectedServer ? s.server === selectedServer : true))
    .map((s) => s.blobs)
    .flat()
    .reduce<BlobDescriptor[]>((arr, blob) => {
      if (!arr.some((b) => b.sha256 === blob.sha256)) return [...arr, blob];
      return arr;
    }, []);

  $: types = Array.from(
    filteredBlobs.reduce((set, b) => {
      if (b.type) set.add(b.type);
      return set;
    }, new Set<string>()),
  ).sort();

  $: sortedBlobs = filteredBlobs
    .filter((b) => {
      if (selectedDrive === "--none--") {
        if (getBlobDrives(b).length > 0) return false;
      } else if (selectedDrive) {
        const isInDrive = getBlobDrives(b).some((d) => d.identifier === selectedDrive);
        if (!isInDrive) return false;
      }
      if (selectedType) {
        if (b.type !== selectedType) return false;
      }

      return true;
    })
    .sort((a, b) => b.created - a.created);

  function getBlobDrives(blob: BlobDescriptor): Drive[] {
    return Object.values($drives).filter((d) => d.hasHash(blob.sha256));
  }
  function getBlobServers(blob: BlobDescriptor) {
    return $blobs.filter((s) => s.blobs.some((b) => b.sha256 === blob.sha256)).map((s) => s.server);
  }
  async function deleteBlob(blob: BlobDescriptor) {
    try {
      const auth = await BlossomClient.getDeleteAuth(blob.sha256, signEventTemplate);
      for (const server of $servers) await BlossomClient.deleteBlob(server, blob.sha256, auth);
    } catch (e) {
      console.log(e);
      if (e instanceof Error) alert(e.message);
    }

    refreshBlobs();
  }
</script>

{#if $activeUser}
  <div class="m-2 flex gap-2">
    <Select placeholder="Server..." bind:value={selectedServer} class="max-w-60" size="sm">
      <option value="">Any</option>
      <optgroup label="Servers">
        {#each $servers as server}
          <option value={server}>{new URL(server).hostname}</option>
        {/each}
      </optgroup>
    </Select>
    <Select placeholder="Drive..." bind:value={selectedDrive} class="max-w-60" size="sm">
      <option value="">Any</option>
      <option value="--none--">None</option>
      <optgroup label="Drives">
        {#each Object.entries($drives) as [id, drive]}
          <option value={id}>{drive.name}</option>
        {/each}
      </optgroup>
    </Select>
    <Select placeholder="Type..." bind:value={selectedType} class="max-w-60" size="sm">
      <option value="">Any</option>
      {#each types as type}
        <option value={type}>{type}</option>
      {/each}
    </Select>
  </div>
  <div class="h-0 flex-1 overflow-auto">
    <Table hoverable={true}>
      <TableHead>
        <TableHeadCell>ID</TableHeadCell>
        <TableHeadCell>Type</TableHeadCell>
        <TableHeadCell>Size</TableHeadCell>
        <TableHeadCell>Created</TableHeadCell>
        <TableHeadCell>Drives</TableHeadCell>
        <TableHeadCell>Servers</TableHeadCell>
        <TableHeadCell>
          <span class="sr-only">Edit</span>
        </TableHeadCell>
      </TableHead>
      <TableBody>
        {#each sortedBlobs as blob}
          <TableBodyRow>
            <TableBodyCell>
              <a href={getBlobURL(blob, getBlobServers(blob)[0])} target="_blank" class="hover:underline">
                {blob.sha256}
              </a>
            </TableBodyCell>
            <TableBodyCell>{blob.type}</TableBodyCell>
            <TableBodyCell>{formatBytes(blob.size)}</TableBodyCell>
            <TableBodyCell>{dayjs.unix(blob.created).format("ll")}</TableBodyCell>
            <TableBodyCell>
              {#each getBlobDrives(blob) as drive, i (drive.identifier)}
                {#if i !== 0}<span>, </span>{/if}
                <a href="#/drive/{drive.address}" class="text-primary-200 hover:underline">{drive.name}</a>
              {/each}
            </TableBodyCell>
            <TableBodyCell>
              {#each getBlobServers(blob) as server, i}
                {#if i !== 0}<span>, </span>{/if}
                <a href={server} target="_blank" class="text-primary-200 hover:underline">{new URL(server).hostname}</a>
              {/each}
            </TableBodyCell>
            <TableBodyCell>
              <div class="flex gap-4">
                <a
                  href="/#"
                  on:click={(e) => {
                    e.preventDefault();
                    deleteBlob(blob);
                  }}
                  class="font-medium text-red-600 hover:underline dark:text-red-500">Delete</a
                >
              </div>
            </TableBodyCell>
          </TableBodyRow>
        {/each}
      </TableBody>
    </Table>
  </div>
{:else}
  <LoginPage />
{/if}
