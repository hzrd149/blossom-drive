<script lang="ts">
  import { Button, CloseButton, Select, Spinner, Tooltip } from "flowbite-svelte";
  import {
    ArrowLeftToBracketOutline,
    CloseOutline,
    CogOutline,
    DownloadOutline,
    EditOutline,
    FileImportOutline,
    FolderArrowRightOutline,
    FolderPlusOutline,
    InfoCircleOutline,
    InfoCircleSolid,
    LinkOutline,
    ListSolid,
    TrashBinOutline,
    TrashBinSolid,
  } from "flowbite-svelte-icons";

  import FileCard from "../../components/FileCard.svelte";
  import FolderCard from "../../components/FolderCard.svelte";
  import PathBreadcrumbs from "../../components/PathBreadcrumbs.svelte";
  import { getReadableDrive } from "../../services/drives";
  import DeleteModal from "../../components/DeleteModal.svelte";
  import RenameModal from "../../components/RenameModal.svelte";
  import BlobDetailsModal from "../../components/FileDetailsModal.svelte";
  import type Drive from "../../blossom-drive-client/Drive";
  import TreeFolder from "../../blossom-drive-client/FileTree/TreeFolder";
  import TreeFile from "../../blossom-drive-client/FileTree/TreeFile";
  import { joinPath } from "../../blossom-drive-client/FileTree/methods";
  import DriveEditModal from "../../components/DriveEditModal.svelte";
  import NewFolderModal from "../../components/NewFolderModal.svelte";
  import UploadFileModal from "../../components/UploadFileModal.svelte";
  import { servers } from "../../services/servers";
  import { getBlobURL } from "../../helpers/blob";
  import type { ChangeEventHandler } from "svelte/elements";
  import Upload from "../../blossom-drive-client/Upload";
  import { signEventTemplate } from "../../services/ndk";
  import { addUpload } from "../../services/uploads";

  export let currentPath: string;
  export let drive: Drive;
  $: readableDrive = getReadableDrive(drive);
  $: subTree = $readableDrive.getFolder(currentPath);

  let editModal = false;
  let newFolderModal = false;
  let uploadFilesModal = false;

  let detailsModal = false;
  let detailsFile: TreeFile | null = null;
  function showDetailsModal() {
    if (selected[0]) {
      const file = subTree.get(selected[0]);
      if (file instanceof TreeFile) {
        detailsFile = file;
        detailsModal = true;
      }
    }
  }

  let confirmDelete = false;
  let selected: string[] = [];
  function toggleSelect(e: CustomEvent<string>) {
    if (selected.includes(e.detail)) selected = selected.filter((s) => s !== e.detail);
    else selected = selected.concat(e.detail);
  }

  $: {
    // reset selected when path changes
    currentPath;
    selected = [];
  }

  let filterType = "";
  $: typesInDrive = $readableDrive.event.tags.reduce((set, t) => {
    if (t[0] === "x" && t[4]) set.add(t[4]);
    return set;
  }, new Set<string>());

  $: files = (subTree.children.filter((e) => e instanceof TreeFile) as TreeFile[]).filter((f) =>
    filterType ? f.type === filterType : true,
  );
  $: folders = subTree.children.filter((e) => e instanceof TreeFolder) as TreeFolder[];

  async function moveIntoFolder(e: CustomEvent<{ src: string; dest: string }>) {
    drive.move(joinPath(currentPath, e.detail.src), joinPath(currentPath, [e.detail.dest, e.detail.src]));
    await drive.save();
  }

  function copySelectedLink() {
    if (selected[0]) {
      const file = subTree.get(selected[0]);
      if (file instanceof TreeFile) {
        const url = getBlobURL(file, $servers[0]);
        if (url) window.navigator.clipboard.writeText(url);
      }
    }
  }

  async function deleteSelected() {
    for (const name of selected) drive.remove(joinPath(currentPath, name));
    selected = [];
    await drive.save();
  }

  let renameModal = false;
  async function renameEntry(e: CustomEvent<string>) {
    const name = selected[0];
    if (!name) return;
    const newName = e.detail;

    drive.move(joinPath(currentPath, name), joinPath(currentPath, newName));
    await drive.save();
  }

  const handleFileInputChange: ChangeEventHandler<HTMLInputElement> = async (e) => {
    const files = e.currentTarget.files;
    if (files && files.length > 0) {
      const upload = new Upload(drive, currentPath, $servers, signEventTemplate);
      await upload.addFileList(files);
      addUpload(upload);
    }
  };

  async function drop(e: DragEvent) {
    e.preventDefault();
    if (e.dataTransfer) {
      const fs = e.dataTransfer.items?.[0].webkitGetAsEntry();
      if (fs) {
        const upload = new Upload(drive, currentPath, $servers, signEventTemplate);
        await upload.addFileSystemEntry(fs);
        addUpload(upload);
      } else if (e.dataTransfer.files.length > 0) {
        const upload = new Upload(drive, currentPath, $servers, signEventTemplate);
        await upload.addFileList(e.dataTransfer.files);
        addUpload(upload);
      }
    }
  }
  function dragover(e: DragEvent) {
    e.preventDefault();
  }

  let folderInput: HTMLInputElement;
  let filesInput: HTMLInputElement;

  let showWarning = false;
</script>

{#if !drive}
  <Spinner />
{:else}
  <main class="flex flex-1 flex-grow flex-col overflow-hidden" on:drop={drop} on:dragover={dragover}>
    <div class="relative flex w-full flex-row items-center bg-purple-500">
      {#if showWarning}
        <InfoCircleSolid class="m-2 h-5 w-5" />
        <p>This drive is public, anyone can view it and download files</p>
        <Button color="none" class="ml-auto" on:click={() => (showWarning = false)}><CloseOutline /></Button>
      {:else}
        <button class="h-3 w-full border-none bg-none" on:click={() => (showWarning = true)} />
      {/if}
    </div>
    <div class="flex items-center gap-2 border-b border-gray-200 p-2 dark:border-gray-800">
      <PathBreadcrumbs root={drive.name ?? "Drive"} class="mx-2" />
      <Button href="#/history/{drive.address}" color="alternative" size="xs">History</Button>

      <div class="flex-1" />

      {#if selected.length === 0}
        <Button size="sm" class="!p-2" color="alternative" on:click={() => (newFolderModal = true)}>
          <FolderPlusOutline />
        </Button>
        <Tooltip placement="bottom">Create Folder</Tooltip>

        <div class="h-8 border border-gray-200 dark:border-gray-800" />

        <input
          class="hidden"
          type="file"
          webkitdirectory
          multiple
          bind:this={folderInput}
          on:change={handleFileInputChange}
        />
        <Button size="sm" class="!p-2" color="alternative" on:click={() => folderInput.click()}>
          <FolderArrowRightOutline />
        </Button>
        <Tooltip placement="bottom">Upload Folder</Tooltip>

        <input class="hidden" type="file" multiple bind:this={filesInput} on:change={handleFileInputChange} />
        <Button size="sm" class="!p-2" color="alternative" on:click={() => filesInput.click()}>
          <FileImportOutline />
        </Button>
        <Tooltip placement="bottom">Upload Files</Tooltip>
      {:else}
        {#if selected.length === 1}
          <Button size="sm" class="!p-2" color="alternative" disabled>
            <DownloadOutline />
          </Button>
          <Tooltip placement="bottom">Download</Tooltip>

          <Button size="sm" class="!p-2" color="alternative" on:click={copySelectedLink}>
            <LinkOutline />
          </Button>
          <Tooltip placement="bottom">Copy Link</Tooltip>

          <div class="h-8 border border-gray-200 dark:border-gray-800" />

          <Button size="sm" class="!p-2" color="alternative" disabled>
            <ArrowLeftToBracketOutline />
          </Button>
          <Tooltip placement="bottom">Move</Tooltip>

          <Button size="sm" class="!p-2" color="alternative" on:click={() => (renameModal = true)}>
            <EditOutline />
          </Button>
          <Tooltip placement="bottom">Rename</Tooltip>

          <Button size="sm" class="!p-2" color="alternative" on:click={showDetailsModal}>
            <InfoCircleOutline />
          </Button>
          <Tooltip placement="bottom">Details</Tooltip>
        {/if}

        <div class="h-8 border border-gray-200 dark:border-gray-800" />

        <Button size="sm" class="!p-2" color="alternative" on:click={() => (confirmDelete = true)}>
          <TrashBinOutline />
        </Button>
        <Tooltip placement="bottom">Delete</Tooltip>
      {/if}

      <div class="h-8 border border-gray-200 dark:border-gray-800" />

      <Button size="sm" class="!p-2" color="alternative" disabled>
        <ListSolid />
      </Button>
      <Tooltip placement="bottom">Change Layout</Tooltip>

      <Button size="sm" class="!p-2" color="alternative" on:click={() => (editModal = true)}>
        <CogOutline />
      </Button>
      <Tooltip placement="bottom">Drive Settings</Tooltip>
    </div>
    <div class="flex items-center gap-2 rounded-lg px-4 py-2">
      {#if selected.length > 0}
        <p class="ml-2">{selected.length} selected</p>
        <Button size="sm" color="none" class="!p-2" on:click={() => (confirmDelete = true)}><TrashBinSolid /></Button>
        <CloseButton class="ml-0" on:click={() => (selected = [])} />
      {:else}
        <Select placeholder="Select Type..." bind:value={filterType} size="sm" class="max-w-60">
          <option value="">Any</option>
          {#each typesInDrive as type}
            <option value={type}>{type}</option>
          {/each}
        </Select>
        {#if filterType}
          <Button size="sm" on:click={() => (filterType = "")} color="alternative">Clear Filter</Button>
        {/if}
      {/if}

      <div class="mx-auto"></div>
    </div>
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <div class="flex h-0 flex-1 flex-col overflow-auto px-4 pb-10 pt-2" on:click={() => (selected = [])}>
      <div class="flex flex-wrap gap-4">
        {#each folders as folder}
          <FolderCard
            {folder}
            on:move-blob={moveIntoFolder}
            selected={selected.includes(folder.name)}
            on:select={toggleSelect}
            on:unselect={toggleSelect}
            on:rename={(e) => {
              selected = [e.detail.name];
              renameModal = true;
            }}
            on:delete={(e) => {
              selected = [e.detail.name];
              confirmDelete = true;
            }}
            on:upload-files={(e) => {
              // uploadFiles(e.detail, folder);
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
              selected = [e.detail.name];
              renameModal = true;
            }}
            on:delete={(e) => {
              selected = [e.detail.name];
              confirmDelete = true;
            }}
            on:details={(e) => {
              detailsFile = e.detail;
              detailsModal = true;
            }}
          />
        {/each}
      </div>
    </div>
  </main>
{/if}

{#if confirmDelete}
  <DeleteModal bind:open={confirmDelete} on:yes={deleteSelected} />
{/if}

{#if renameModal}
  <RenameModal bind:open={renameModal} on:submit={renameEntry} name={selected[0]} />
{/if}

{#if detailsModal && detailsFile}
  <BlobDetailsModal bind:open={detailsModal} file={detailsFile} />
{/if}

{#if editModal}
  <DriveEditModal bind:open={editModal} drive={$readableDrive} />
{/if}

{#if newFolderModal && drive}
  <NewFolderModal bind:open={newFolderModal} {drive} path={currentPath} />
{/if}

{#if uploadFilesModal}
  <UploadFileModal bind:open={uploadFilesModal} {drive} path={currentPath} />
{/if}
