<script lang="ts">
  import type { NDKEvent } from "@nostr-dev-kit/ndk";
  import { querystring } from "svelte-spa-router";
  import SpeedDialMenu from "../components/SpeedDialMenu.svelte";
  import { nip19 } from "nostr-tools";
  import { Button, Spinner } from "flowbite-svelte";
  import { BlossomClient, type Blob } from "blossom-client";

  import {
    cloneTree,
    getFileTree,
    getFolder,
    moveEntry,
    parsePath,
    removeEntry,
    setFile,
    setPackFileTree,
    type TreeFile,
  } from "../helpers/tree";
  import { getPackName } from "../helpers/packs";
  import FileCard from "../components/FileCard.svelte";
  import FolderCard from "../components/FolderCard.svelte";
  import PathBreadcrumbs from "../components/PathBreadcrumbs.svelte";
  import { cloneEvent } from "../helpers/event";
  import { handleEvent, packs } from "../services/packs";
  import { TrashBinSolid } from "flowbite-svelte-icons";
  import DeleteModal from "../components/DeleteModal.svelte";
  import RenameModal from "../components/RenameModal.svelte";
  import { signEventTemplate } from "../services/ndk";
  import { servers } from "../services/servers";

  export let params: Record<string, string | undefined> = {};
  const naddr = params["naddr"];

  $: parsed = new URLSearchParams($querystring);

  let pack: NDKEvent | null = null;
  $: tree = pack ? getFileTree(pack) : {};
  $: subTree = getFolder(tree, parsePath(parsed.get("path")));

  let confirmDelete = false;
  let selected: string[] = [];
  function toggleSelect(e: CustomEvent<string>) {
    if (selected.includes(e.detail)) selected = selected.filter((s) => s !== e.detail);
    else selected = selected.concat(e.detail);
  }

  $: {
    // reset selected when path changes
    parsed;
    selected = [];
  }

  $: files = Object.entries(subTree)
    .filter(([name, entry]) => entry.t === "file")
    .map((e) => subTree[e[0]] as TreeFile);
  $: folders = Object.entries(subTree)
    .filter(([name, entry]) => entry.t !== "file")
    .map((e) => e[0]);

  $: {
    if (naddr) {
      const decoded = nip19.decode(naddr);
      if (decoded.type !== "naddr") throw new Error("Unknown Type");

      pack = $packs[decoded.data.identifier];
    }
  }

  async function move(e: CustomEvent<{ src: string; dest: string }>) {
    if (!pack) return;
    const path = parsePath(parsed.get("path"));
    const newTree = cloneTree(tree);
    moveEntry(newTree, [...path, e.detail.src], [...path, e.detail.dest, e.detail.src]);

    const draft = cloneEvent(pack);
    setPackFileTree(draft, newTree);

    await draft.sign();
    await draft.publish();
    handleEvent(draft);
  }

  async function deleteSelected() {
    if (!pack) return;
    const path = parsePath(parsed.get("path"));
    const newTree = cloneTree(tree);
    for (const name of selected) removeEntry(newTree, [...path, name]);

    const draft = cloneEvent(pack);
    setPackFileTree(draft, newTree);

    await draft.sign();
    await draft.publish();
    handleEvent(draft);
  }

  let renameModal = false;
  async function renameEntry(e: CustomEvent<string>) {
    if (!pack) return;
    const name = selected[0];
    if (!name) return;
    const newName = e.detail;

    const path = parsePath(parsed.get("path"));
    const newTree = cloneTree(tree);
    moveEntry(newTree, [...path, name], [...path, newName]);

    const draft = cloneEvent(pack);
    setPackFileTree(draft, newTree);

    await draft.sign();
    await draft.publish();
    handleEvent(draft);
  }

  function drop(e: DragEvent) {
    e.preventDefault();
    if (e.dataTransfer?.files.length) uploadFiles(e.dataTransfer.files);
  }
  function dragover(e: DragEvent) {
    e.preventDefault();
  }
  async function uploadFiles(files: FileList, folder?: string) {
    if (!pack) return;
    const newTree = cloneTree(tree);
    const path = parsePath(parsed.get("path"));

    for (const file of files) {
      try {
        const auth = await BlossomClient.getUploadAuth(file, signEventTemplate);
        let blob: Blob | undefined = undefined;
        for (const server of $servers) {
          try {
            blob = await BlossomClient.uploadBlob(server, file, auth);
          } catch (e) {
            console.log("Failed to upload to", server);
            console.log(e);
          }
        }

        if (blob) {
          setFile(newTree, folder ? [...path, folder, file.name] : [...path, file.name], {
            hash: blob.sha256,
            size: blob.size,
            mimeType: blob.type,
          });
        }
      } catch (e) {
        console.log("Failed to upload" + file.name);
        console.log(e);
      }
    }

    const draft = cloneEvent(pack);
    setPackFileTree(draft, newTree);
    await draft.sign();
    handleEvent(draft);
    await draft.publish();
  }
</script>

{#if !pack}
  <Spinner />
{:else}
  <main class="flex flex-grow flex-col gap-4 p-4">
    <div class="flex justify-between gap-2">
      <PathBreadcrumbs root={getPackName(pack) ?? "Pack"} />
      {#if selected.length > 0}
        <div class="flex items-center gap-2">
          <p>{selected.length} selected</p>
          <Button size="sm" on:click={() => (selected = [])}>Clear</Button>
          <Button size="sm" class="!p-2" on:click={() => (confirmDelete = true)}><TrashBinSolid /></Button>
        </div>
      {/if}
    </div>
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <div class="flex flex-grow flex-wrap items-start gap-4" on:drop={drop} on:dragover={dragover}>
      {#each folders as folder}
        <FolderCard
          name={folder}
          on:move-blob={move}
          selected={selected.includes(folder)}
          on:select={toggleSelect}
          on:unselect={toggleSelect}
          on:rename={(e) => {
            selected = [e.detail];
            renameModal = true;
          }}
          on:delete={(e) => {
            selected = [e.detail];
            confirmDelete = true;
          }}
          on:upload-files={(e) => {
            uploadFiles(e.detail, folder);
          }}
        />
      {/each}
      {#each files as file}
        <FileCard
          {file}
          selected={selected.includes(file.name)}
          on:select={toggleSelect}
          on:unselect={toggleSelect}
          on:rename={(e) => {
            selected = [e.detail];
            renameModal = true;
          }}
          on:delete={(e) => {
            selected = [e.detail];
            confirmDelete = true;
          }}
        />
      {/each}
    </div>
  </main>
  <!-- <code class="whitespace-pre">{JSON.stringify(tree, null, 2)}</code>
  <code class="whitespace-pre">{JSON.stringify(pack.rawEvent(), null, 2)}</code> -->
{/if}
<SpeedDialMenu pack={pack ?? undefined} path={parsed.get("path") || "/"} />

{#if confirmDelete}
  <DeleteModal bind:open={confirmDelete} on:yes={deleteSelected} />
{/if}

{#if renameModal}
  <RenameModal bind:open={renameModal} on:submit={renameEntry} name={selected[0]} />
{/if}
