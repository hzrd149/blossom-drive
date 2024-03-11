<script lang="ts">
  import { onMount } from "svelte";
  import { Select, Table, TableBody, TableBodyCell, TableBodyRow, TableHead, TableHeadCell } from "flowbite-svelte";
  import dayjs from "dayjs";
  import { blobs, refreshBlobs } from "../services/blobs";
  import { drives } from "../services/drives";
  import { formatBytes } from "../helpers/number";
  import { getBlobURL } from "../helpers/blob";
  import { BlossomClient, type BlobDescriptor } from "blossom-client";
  import { signEventTemplate } from "../services/ndk";
  import { servers } from "../services/servers";
  import type Drive from "../blossom-drive-client/Drive";

  onMount(() => {
    refreshBlobs();
  });

  let selectedDrive = "";
  let selectedType = "";
  $: miscBlobs = $blobs.map((s) => s.blobs).flat();
  $: types = miscBlobs.reduce((set, b) => {
    if (b.type) set.add(b.type);
    return set;
  }, new Set<string>());

  $: sortedBlobs = miscBlobs
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

<div class="m-2 flex gap-2">
  <Select placeholder="Select Drive..." bind:value={selectedDrive}>
    <option value="">Any</option>
    <option value="--none--">None</option>
    <optgroup label="Drives">
      {#each Object.entries($drives) as [id, drive]}
        <option value={id}>{drive.name}</option>
      {/each}
    </optgroup>
  </Select>
  <Select placeholder="Select Type..." bind:value={selectedType}>
    <option value="">Any</option>
    {#each types as type}
      <option value={type}>{type}</option>
    {/each}
  </Select>
</div>
<Table hoverable={true}>
  <TableHead>
    <TableHeadCell>ID</TableHeadCell>
    <TableHeadCell>Type</TableHeadCell>
    <TableHeadCell>Size</TableHeadCell>
    <TableHeadCell>Created</TableHeadCell>
    <TableHeadCell>Drives</TableHeadCell>
    <TableHeadCell>
      <span class="sr-only">Edit</span>
    </TableHeadCell>
  </TableHead>
  <TableBody>
    {#each sortedBlobs as blob}
      <TableBodyRow>
        <TableBodyCell>
          <a href={getBlobURL(blob)} target="_blank" class="hover:underline">{blob.sha256}</a>
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
          <div class="flex gap-4">
            <a href={getBlobURL(blob)} target="_blank" class="font-medium text-blue-500 hover:underline">Open</a>
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
