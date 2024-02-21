<script lang="ts">
  import { Table, TableBody, TableBodyCell, TableBodyRow, TableHead, TableHeadCell } from "flowbite-svelte";
  import { blobs } from "../services/blobs";
  import { drives } from "../services/drives";
  import { getDriveName } from "../helpers/drives";
  import type { NDKEvent } from "@nostr-dev-kit/ndk";
  import { formatBytes } from "../helpers/number";
  import dayjs from "dayjs";
  import { getBlobURL } from "../helpers/blob";
  import type { Blob } from "blossom-client";

  let miscBlobs: Blob[] = [];
  $: {
    miscBlobs = $blobs
      .map((s) => s.blobs)
      .flat()
      .sort((a, b) => b.created - a.created);
  }

  function getBlobDrives(blob: Blob): NDKEvent[] {
    return Object.values($drives).filter((d) => d.tags.some((t) => t[0] === "x" && t[1] === blob.sha256));
  }
</script>

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
    {#each miscBlobs as blob}
      <TableBodyRow>
        <TableBodyCell>
          <a href={getBlobURL(blob)} target="_blank" class="hover:underline">{blob.sha256}</a>
        </TableBodyCell>
        <TableBodyCell>{blob.type}</TableBodyCell>
        <TableBodyCell>{formatBytes(blob.size)}</TableBodyCell>
        <TableBodyCell>{dayjs.unix(blob.created).format("ll")}</TableBodyCell>
        <TableBodyCell>
          {#each getBlobDrives(blob) as drive, i (drive.id)}
            {#if i !== 0}<span>, </span>{/if}
            <a href="#/drive/{drive.encode()}" class="text-primary-200 hover:underline">{getDriveName(drive)}</a>
          {/each}
        </TableBodyCell>
        <TableBodyCell>
          <div class="flex gap-4">
            <a href={getBlobURL(blob)} target="_blank" class="font-medium text-blue-500 hover:underline">Open</a>
            <a href="/tables" class="font-medium text-red-600 hover:underline dark:text-red-500">Delete</a>
          </div>
        </TableBodyCell>
      </TableBodyRow>
    {/each}
  </TableBody>
</Table>
