<script lang="ts">
  import type { NDKEvent } from "@nostr-dev-kit/ndk";
  import { location, querystring, params } from "svelte-spa-router";
  import SpeedDialMenu from "../components/SpeedDialMenu.svelte";
  import { nip19 } from "nostr-tools";
  import { Button, CloseButton, Spinner } from "flowbite-svelte";
  import { BlossomClient, type BlobDescriptor } from "blossom-client";

  import {
    cloneTree,
    getFileTree,
    getFolder,
    moveEntry,
    parsePath,
    removeEntry,
    setFile,
    setDriveFileTree,
    type TreeFile,
  } from "../helpers/tree";
  import { getDriveName } from "../helpers/drives";
  import FileCard from "../components/FileCard.svelte";
  import FolderCard from "../components/FolderCard.svelte";
  import PathBreadcrumbs from "../components/PathBreadcrumbs.svelte";
  import { cloneEvent } from "../helpers/event";
  import { handleEvent, drives } from "../services/drives";
  import { CloseSolid, TrashBinSolid } from "flowbite-svelte-icons";
  import DeleteModal from "../components/DeleteModal.svelte";
  import RenameModal from "../components/RenameModal.svelte";
  import { signEventTemplate } from "../services/ndk";
  import { servers } from "../services/servers";
  import { readFileSystemFile, readFileSystemDirectory } from "../helpers/file-system";
  import BlobDetailsModal from "../components/FileDetailsModal.svelte";

  $: parsed = new URLSearchParams($querystring);

  let drive: NDKEvent | null = null;
  $: tree = drive ? getFileTree(drive) : {};
  $: subTree = getFolder(tree, parsePath(parsed.get("path")));

  let detailsModal = false;
  let detailsFile: TreeFile | null = null;
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
    if ($params?.naddr) {
      const decoded = nip19.decode($params?.naddr);
      if (decoded.type !== "naddr") throw new Error("Unknown Type");

      drive = $drives[decoded.data.identifier];
    }
  }

  async function move(e: CustomEvent<{ src: string; dest: string }>) {
    if (!drive) return;
    const path = parsePath(parsed.get("path"));
    const newTree = cloneTree(tree);
    moveEntry(newTree, [...path, e.detail.src], [...path, e.detail.dest, e.detail.src]);

    const draft = cloneEvent(drive);
    setDriveFileTree(draft, newTree);

    await draft.sign();
    await draft.publish();
    handleEvent(draft);
  }

  async function deleteSelected() {
    if (!drive) return;
    const path = parsePath(parsed.get("path"));
    const newTree = cloneTree(tree);
    for (const name of selected) removeEntry(newTree, [...path, name]);

    const draft = cloneEvent(drive);
    setDriveFileTree(draft, newTree);

    await draft.sign();
    await draft.publish();
    handleEvent(draft);
  }

  let renameModal = false;
  async function renameEntry(e: CustomEvent<string>) {
    if (!drive) return;
    const name = selected[0];
    if (!name) return;
    const newName = e.detail;

    const path = parsePath(parsed.get("path"));
    const newTree = cloneTree(tree);
    moveEntry(newTree, [...path, name], [...path, newName]);

    const draft = cloneEvent(drive);
    setDriveFileTree(draft, newTree);

    await draft.sign();
    await draft.publish();
    handleEvent(draft);
  }

  function drop(e: DragEvent) {
    e.preventDefault();
    if (e.dataTransfer?.files.length) {
      uploadFiles(e.dataTransfer.items[0].webkitGetAsEntry() || e.dataTransfer.files);
    }
  }
  function dragover(e: DragEvent) {
    e.preventDefault();
  }
  async function uploadFiles(fileList: FileList | FileSystemEntry, folder?: string) {
    if (!drive) return;
    const newTree = cloneTree(tree);
    const path = parsePath(parsed.get("path"));

    async function uploadFile(file: File) {
      const auth = await BlossomClient.getUploadAuth(file, signEventTemplate);
      let descriptor: BlobDescriptor | undefined = undefined;
      for (const server of $servers) {
        try {
          descriptor = await BlossomClient.uploadBlob(server, file, auth);
        } catch (e) {
          console.log("Failed to upload to", server);
          console.log(e);
        }
      }

      return descriptor;
    }

    if (fileList instanceof FileSystemEntry) {
      const getPath = (entry: FileSystemEntry) =>
        folder ? [...path, folder, ...parsePath(entry.fullPath)] : [...path, ...parsePath(entry.fullPath)];

      async function walkTree(entry: FileSystemEntry) {
        if (entry instanceof FileSystemFileEntry && entry.isFile) {
          try {
            const file = await readFileSystemFile(entry);
            let descriptor = await uploadFile(file);
            if (descriptor) {
              setFile(newTree, getPath(entry), {
                sha256: descriptor.sha256,
                size: descriptor.size,
                type: descriptor.type,
              });
            }
          } catch (e) {
            console.log("Failed to upload" + entry.fullPath);
            console.log(e);
          }
        } else if (entry instanceof FileSystemDirectoryEntry && entry.isDirectory) {
          const entries = await readFileSystemDirectory(entry);
          // create empty folders
          getFolder(newTree, getPath(entry), true);
          for (const e of entries) await walkTree(e);
        }
      }

      await walkTree(fileList);
    } else if (fileList instanceof FileList) {
      for (const file of fileList) {
        try {
          let descriptor = await uploadFile(file);
          if (descriptor) {
            setFile(newTree, folder ? [...path, folder, file.name] : [...path, file.name], {
              sha256: descriptor.sha256,
              size: descriptor.size,
              type: descriptor.type,
            });
          }
        } catch (e) {
          console.log("Failed to upload" + file.name);
          console.log(e);
        }
      }
    }

    const draft = cloneEvent(drive);
    setDriveFileTree(draft, newTree);
    await draft.sign();
    handleEvent(draft);
    await draft.publish();
  }
</script>

{#if !drive}
  <Spinner />
{:else}
  <main class="flex flex-grow flex-col gap-4 p-4" on:drop={drop} on:dragover={dragover}>
    <div class="flex gap-2">
      <PathBreadcrumbs root={getDriveName(drive) ?? "Drive"} />
      <div class="flex-1" />
      <Button href="#/history/{drive.encode()}" color="alternative" size="xs">History</Button>
    </div>
    {#if selected.length > 0}
      <div class="flex items-center gap-2 rounded-lg border p-1">
        <p class="ml-2">{selected.length} selected</p>
        <Button size="sm" color="none" class="!p-2" on:click={() => (confirmDelete = true)}><TrashBinSolid /></Button>
        <CloseButton class="ml-0" on:click={() => (selected = [])} />
      </div>
    {:else}
      <div class="flex h-11 gap-2"></div>
    {/if}
    <div class="flex flex-wrap items-start gap-4">
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
          on:details={(e) => {
            detailsFile = e.detail;
            detailsModal = true;
          }}
        />
      {/each}
    </div>
  </main>
{/if}
<SpeedDialMenu drive={drive ?? undefined} path={parsed.get("path") || "/"} />

{#if confirmDelete}
  <DeleteModal bind:open={confirmDelete} on:yes={deleteSelected} />
{/if}

{#if renameModal}
  <RenameModal bind:open={renameModal} on:submit={renameEntry} name={selected[0]} />
{/if}

{#if detailsModal && detailsFile}
  <BlobDetailsModal bind:open={detailsModal} file={detailsFile} />
{/if}
