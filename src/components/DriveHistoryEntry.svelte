<script lang="ts">
  import type { NostrEvent } from "@nostr-dev-kit/ndk";
  import dayjs from "dayjs";
  import { getDriveName } from "../helpers/drives";
  import { TimelineItem } from "flowbite-svelte";

  export let version: NostrEvent;
  export let prev: NostrEvent;

  $: hashes = version.tags.filter((t) => t[0] === "x").reduce((arr, t) => [...arr, t[1]], []);
  $: prevHashes = prev.tags.filter((t) => t[0] === "x").reduce((arr, t) => [...arr, t[1]], []);

  $: removedHashes = prevHashes.filter((h) => !hashes.includes(h));
  $: addedHashes = hashes.filter((h) => !prevHashes.includes(h));

  // $: tree = getFileTree(version);
  // $: prevTree = getFileTree(prev);
</script>

<TimelineItem date={dayjs.unix(version.created_at).format("llll")}>
  <ul class="text-base font-normal">
    {#if getDriveName(version) !== getDriveName(prev)}
      <li>Renamed {getDriveName(prev)} to {getDriveName(version)}</li>
    {/if}

    {#each addedHashes as hash}
      <li>
        <span>Added {version.tags.find((t) => t[0] === "x" && t[1] === hash)?.[2]}</span>
        <br />
        <code>{hash}</code>
      </li>
    {/each}
    {#each removedHashes as hash}
      <span>Removed {prev.tags.find((t) => t[0] === "x" && t[1] === hash)?.[2]}</span>
      <br />
      <code>{hash}</code>
    {/each}
  </ul>
</TimelineItem>
