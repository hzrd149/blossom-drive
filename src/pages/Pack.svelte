<script lang="ts">
  import { location, querystring } from "svelte-spa-router";
  import type { NDKEvent } from "@nostr-dev-kit/ndk";
  import SpeedDialMenu from "../components/SpeedDialMenu.svelte";
  import { nip19 } from "nostr-tools";
  import { Breadcrumb, BreadcrumbItem, Spinner } from "flowbite-svelte";

  import { ndk } from "../services/ndk";
  import {
    cloneTree,
    getFileTree,
    getFolder,
    parsePath,
    removeFile,
    setFile,
    setFolder,
    setPackFileTree,
    type TreeFile,
  } from "../helpers/tree";
  import { getPackName } from "../helpers/packs";
  import FileCard from "../components/FileCard.svelte";
  import FolderCard from "../components/FolderCard.svelte";
  import PathBreadcrumbs from "../components/PathBreadcrumbs.svelte";
  import { cloneEvent } from "../helpers/event";

  export let params: Record<string, string | undefined> = {};
  const naddr = params["naddr"];

  $: parsed = new URLSearchParams($querystring);

  let pack: NDKEvent | null = null;
  $: tree = pack ? getFileTree(pack) : {};
  $: subTree = getFolder(tree, parsePath(parsed.get("path")));

  let selected: string[] = [];
  function toggleSelect(e: CustomEvent<string>) {
    if (selected.includes(e.detail)) selected = selected.filter((s) => s !== e.detail);
    else selected = selected.concat(e.detail);
  }

  $: files = Object.entries(subTree)
    .filter(([name, entry]) => entry.type === "file")
    .map((e) => subTree[e[0]] as TreeFile);
  $: folders = Object.entries(subTree)
    .filter(([name, entry]) => entry.type !== "file")
    .map((e) => e[0]);

  if (naddr) {
    const decoded = nip19.decode(naddr);
    if (decoded.type !== "naddr") throw new Error("Unknown Type");
    ndk
      .fetchEvents({
        kinds: [decoded.data.kind],
        authors: [decoded.data.pubkey],
        "#d": [decoded.data.identifier],
      })
      .then((events) => {
        for (const event of events) {
          if (!pack || event.created_at! > pack.created_at!) pack = event;
        }
      });
  }

  async function moveBlob(e: CustomEvent<{ filename: string; folder: string }>) {
    if (!pack) return;
    const file = subTree[e.detail.filename] as TreeFile;
    if (!file) return;

    const path = parsePath(parsed.get("path"));
    const newTree = cloneTree(tree);
    setFile(newTree, [...path, e.detail.folder, e.detail.filename], file);
    removeFile(newTree, [...path, e.detail.filename]);

    const draft = cloneEvent(pack);
    setPackFileTree(draft, newTree);

    await draft.sign();
    await draft.publish();
  }
</script>

{#if !pack}
  <Spinner />
{:else}
  <main class="flex flex-col gap-4 p-4">
    <PathBreadcrumbs root={getPackName(pack) ?? "Pack"} />
    <div class="flex flex-wrap gap-4">
      {#each folders as folder}
        <FolderCard
          name={folder}
          on:move-blob={moveBlob}
          selected={selected.includes(folder)}
          on:select={toggleSelect}
          on:unselect={toggleSelect}
        />
      {/each}
      {#each files as file}
        <FileCard {file} selected={selected.includes(file.name)} on:select={toggleSelect} on:unselect={toggleSelect} />
      {/each}
    </div>
  </main>
  <!-- <code class="whitespace-pre">{JSON.stringify(tree, null, 2)}</code>
  <code class="whitespace-pre">{JSON.stringify(pack.rawEvent(), null, 2)}</code> -->
{/if}
<SpeedDialMenu pack={pack ?? undefined} path={parsed.get("path") || "/"} />
