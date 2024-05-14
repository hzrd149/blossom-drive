<script lang="ts">
  import { Button, CloseButton, Select, Tooltip } from "flowbite-svelte";
  import {
    ArrowDownToBracketOutline,
    ArrowLeftToBracketOutline,
    ArrowUpRightFromSquareOutline,
    ChevronDoubleLeftOutline,
    ChevronDoubleRightOutline,
    CloseOutline,
    CogOutline,
    EditOutline,
    EyeSolid,
    FileImportOutline,
    FileWordOutline,
    FolderArrowRightOutline,
    FolderPlusOutline,
    InfoCircleOutline,
    LinkOutline,
    ListOutline,
    LockSolid,
    TrashBinOutline,
    TrashBinSolid,
  } from "flowbite-svelte-icons";
  import {
    type Drive,
    fileTypesInTree,
    joinPath,
    Upload,
    TreeFile,
    TreeFolder,
    EncryptedDrive,
  } from "blossom-drive-sdk";

  import FileCard from "../../components/FileCard.svelte";
  import FolderCard from "../../components/FolderCard.svelte";
  import PathBreadcrumbs from "../../components/PathBreadcrumbs.svelte";
  import { getReadableDrive } from "../../services/drives";
  import DeleteModal from "../../components/DeleteModal.svelte";
  import RenameModal from "../../components/RenameModal.svelte";
  import BlobDetailsModal from "../../components/FileDetailsModal.svelte";
  import DriveEditModal from "../../components/DriveEditModal.svelte";
  import NewFolderModal from "../../components/NewFolderModal.svelte";
  import { servers } from "../../services/servers";
  import { getBlobURL } from "../../helpers/blob";
  import type { ChangeEventHandler } from "svelte/elements";
  import { activeUser, signEventTemplate } from "../../services/ndk";
  import { addUpload } from "../../services/uploads";
  import UnlockDrive from "../../components/UnlockDrive.svelte";
  import ReadmePreview from "./Readme.svelte";
  import { MultiDownload } from "../../helpers/multi-download";
  import { clearCache, getLocalFileURL } from "../../services/downloads";
  import { onDestroy } from "svelte";
  import DownloadSelected from "./actions/DownloadSelected.svelte";

  export let currentPath: string;
  export let drive: Drive;
  $: readableDrive = getReadableDrive(drive);
  $: encryptedDrive = $readableDrive instanceof EncryptedDrive ? (drive as EncryptedDrive) : null;
  $: subTree = $readableDrive.getFolder(currentPath);
  $: isOwner = $activeUser?.pubkey === drive.pubkey;

  $: readmeFile = subTree.children.find((f) => f instanceof TreeFile && f.name.match(/readme\.md/i)) as
    | TreeFile
    | undefined;
  $: showReadme = readmeFile && localStorage.getItem("show-readme") !== "false";
  function toggleReadme() {
    showReadme = !showReadme;
    localStorage.setItem("show-readme", String(showReadme));
  }

  let editModal = false;
  let newFolderModal = false;

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

  $: encrypted = $readableDrive instanceof EncryptedDrive;
  $: locked = $readableDrive instanceof EncryptedDrive ? $readableDrive.locked : undefined;

  let filterType = "";
  $: typesInDrive = fileTypesInTree($readableDrive.tree);

  $: files = (subTree.children.filter((e) => e instanceof TreeFile) as TreeFile[]).filter((f) =>
    filterType ? f.type === filterType : true,
  );
  $: folders = subTree.children.filter((e) => e instanceof TreeFolder) as TreeFolder[];

  async function moveIntoFolder(e: CustomEvent<{ src: string; dest: string }>) {
    drive.move(joinPath(currentPath, e.detail.src), joinPath(currentPath, [e.detail.dest, e.detail.src]));
    await drive.save();
  }

  function copySelectedLink() {
    if (!selected[0]) return;
    const file = subTree.get(selected[0]);
    if (file instanceof TreeFile) {
      const url = getBlobURL(file, $servers[0]);
      if (url) window.navigator.clipboard.writeText(url);
    }
  }

  async function deleteSelected() {
    for (const name of selected) drive.remove(joinPath(currentPath, name));
    selected = [];
    await drive.save();
  }

  async function openFile(file: TreeFile) {
    const url = await getLocalFileURL(drive, file.path, $servers);
    window.open(url, "_blank");
  }
  async function openSelected() {
    for (const file of subTree) {
      if (file instanceof TreeFile && selected.includes(file.name)) {
        await openFile(file);
      }
    }
  }

  async function download(entry: TreeFile | TreeFolder) {
    const download = new MultiDownload(drive, $servers);
    download.on("log", (message) => console.log(download.id, message));
    await download.start([entry]);
  }
  async function downloadSelected() {
    const download = new MultiDownload(drive, $servers);
    const entries: (TreeFile | TreeFolder)[] = [];
    for (const entry of subTree) {
      if (selected.includes(entry.name)) entries.push(entry);
    }

    download.on("log", (message) => console.log(download.id, message));

    if (entries.length > 0) await download.start(entries);
    else await download.start([subTree]);
  }

  onDestroy(() => {
    // remove all cached files
    clearCache();
  });

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
      const upload = new Upload(drive, currentPath, $servers.map(s=>s.toString()), signEventTemplate);
      await upload.addFileList(files);
      addUpload(upload);
    }
  };

  let showDropOverlay = false;
  async function drop(e: DragEvent) {
    e.preventDefault();
    showDropOverlay = false;
    if (e.dataTransfer) {
      if (e.dataTransfer.items.length > 0) {
        const upload = new Upload(drive, currentPath, $servers, signEventTemplate);
        for (const item of e.dataTransfer.items) {
          if (item.kind === "file") {
            const fs = item.webkitGetAsEntry();
            if (fs) await upload.addFileSystemEntry(fs);
          }
        }
        addUpload(upload);
      } else if (e.dataTransfer.files.length > 0) {
        const upload = new Upload(drive, currentPath, $servers, signEventTemplate);
        await upload.addFileList(e.dataTransfer.files);
        addUpload(upload);
      }
    }
  }
  function dragover(e: DragEvent) {
    if (e.dataTransfer?.items[0]?.kind === "file") {
      e.preventDefault();
      showDropOverlay = true;
    }
  }
  function dragenter(e: DragEvent) {
    if (e.dataTransfer?.items[0]?.kind === "file") {
      showDropOverlay = true;
      e.preventDefault();
    }
  }
  function dragleave(e: DragEvent) {
    showDropOverlay = false;
  }

  let folderInput: HTMLInputElement;
  let filesInput: HTMLInputElement;

  let showInfoHeader = localStorage.getItem("show-info-header") !== "false";
  $: {
    localStorage.setItem("show-info-header", String(showInfoHeader));
  }
</script>

<main
  class="flex flex-1 flex-grow overflow-hidden"
  on:drop={drop}
  on:dragover={dragover}
  on:dragleave={dragleave}
  on:dragenter={dragenter}
>
  <div class="flex flex-1 flex-col overflow-hidden">
    {#if encrypted}
      <div class="relative flex w-full flex-row items-center bg-green-500">
        {#if showInfoHeader}
          <LockSolid class="m-2 h-6 w-6" />
          <p>This drive is encrypted, only users who know the password can view it and download files</p>
          <Button color="none" class="ml-auto" on:click={() => (showInfoHeader = false)}><CloseOutline /></Button>
        {:else}
          <button class="h-3 w-full border-none bg-none" on:click={() => (showInfoHeader = true)} />
        {/if}
      </div>
    {:else}
      <div class="relative flex w-full flex-row items-center bg-purple-500">
        {#if showInfoHeader}
          <EyeSolid class="m-2 h-6 w-6" />
          <p>This drive is public, anyone can view it and download files</p>
          <Button color="none" class="ml-auto" on:click={() => (showInfoHeader = false)}><CloseOutline /></Button>
        {:else}
          <button class="h-3 w-full border-none bg-none" on:click={() => (showInfoHeader = true)} />
        {/if}
      </div>
    {/if}
    <div class="flex items-center gap-2 border-b border-gray-200 p-2 dark:border-gray-800">
      <PathBreadcrumbs root={encrypted && locked ? "[Locked]" : drive.name ?? "Drive"} class="mx-2" />
      <!-- <Button href="#/history/{drive.address}" color="alternative" size="xs">History</Button> -->

      <div class="flex-1" />

      <DownloadSelected {drive} path={currentPath} {selected} />

      {#if selected.length === 0}
        <div class="h-8 border border-gray-200 dark:border-gray-800" />

        <Button size="sm" class="!p-2" color="alternative" on:click={() => (newFolderModal = true)} disabled={!isOwner}>
          <FolderPlusOutline />
        </Button>
        <Tooltip placement="bottom">Create Folder</Tooltip>

        <input
          class="hidden"
          type="file"
          webkitdirectory
          multiple
          bind:this={folderInput}
          on:change={handleFileInputChange}
        />
        <Button size="sm" class="!p-2" color="alternative" on:click={() => folderInput.click()} disabled={!isOwner}>
          <FolderArrowRightOutline />
        </Button>
        <Tooltip placement="bottom">Upload Folder</Tooltip>

        <input class="hidden" type="file" multiple bind:this={filesInput} on:change={handleFileInputChange} />
        <Button size="sm" class="!p-2" color="alternative" on:click={() => filesInput.click()} disabled={!isOwner}>
          <FileImportOutline />
        </Button>
        <Tooltip placement="bottom">Upload Files</Tooltip>
      {:else}
        <Button size="sm" class="!p-2" color="alternative" on:click={openSelected}>
          <ArrowUpRightFromSquareOutline />
        </Button>
        <Tooltip placement="bottom">Open</Tooltip>
      {/if}

      {#if selected.length === 1}
        {#if !encrypted}
          <Button size="sm" class="!p-2" color="alternative" on:click={copySelectedLink}>
            <LinkOutline />
          </Button>
          <Tooltip placement="bottom">Copy Link</Tooltip>
        {/if}

        <div class="h-8 border border-gray-200 dark:border-gray-800" />

        <Button size="sm" class="!p-2" color="alternative" disabled>
          <ArrowLeftToBracketOutline />
        </Button>
        <Tooltip placement="bottom">Move</Tooltip>

        <Button size="sm" class="!p-2" color="alternative" on:click={() => (renameModal = true)} disabled={!isOwner}>
          <EditOutline />
        </Button>
        <Tooltip placement="bottom">Rename</Tooltip>

        <Button size="sm" class="!p-2" color="alternative" on:click={showDetailsModal}>
          <InfoCircleOutline />
        </Button>
        <Tooltip placement="bottom">Details</Tooltip>
      {/if}
      {#if selected.length > 0}
        <div class="h-8 border border-gray-200 dark:border-gray-800" />

        <Button size="sm" class="!p-2" color="red" outline on:click={() => (confirmDelete = true)} disabled={!isOwner}>
          <TrashBinOutline />
        </Button>
        <Tooltip placement="bottom">Delete</Tooltip>
      {/if}

      <div class="h-8 border border-gray-200 dark:border-gray-800" />

      <Button size="sm" class="!p-2" color="alternative" disabled>
        <ListOutline />
      </Button>
      <Tooltip placement="bottom">Change Layout</Tooltip>

      <Button size="sm" class="!p-2" color="alternative" on:click={() => (editModal = true)} disabled={!isOwner}>
        <CogOutline />
      </Button>
      <Tooltip placement="bottom">Drive Settings</Tooltip>

      <Button size="sm" class="!p-2" color="alternative" on:click={toggleReadme}>
        {#if showReadme}
          <FileWordOutline />
          <ChevronDoubleRightOutline />
        {:else}
          <ChevronDoubleLeftOutline />
          <FileWordOutline />
        {/if}
      </Button>
      <Tooltip placement="bottom">Show Readme</Tooltip>
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
    {#if encrypted && locked && encryptedDrive}
      <UnlockDrive drive={encryptedDrive} />
    {:else}
      <!-- svelte-ignore a11y-click-events-have-key-events -->
      <!-- svelte-ignore a11y-no-static-element-interactions -->
      <div class="flex h-0 flex-1 flex-col overflow-auto px-4 pb-10 pt-2" on:click={() => (selected = [])}>
        <div class="flex flex-wrap gap-4">
          {#each folders as folder}
            <FolderCard
              {folder}
              on:move-blob={moveIntoFolder}
              selected={selected.includes(folder.name)}
              readonly={!isOwner}
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
              on:download={(e) => download(e.detail)}
            />
          {/each}
          {#each files as file}
            <FileCard
              {file}
              {encrypted}
              selected={selected.includes(file.name)}
              readonly={!isOwner}
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
              on:open={(e) => openFile(e.detail)}
              on:download={(e) => download(e.detail)}
            />
          {/each}
        </div>
      </div>
    {/if}
  </div>

  {#if showReadme === true}
    <div class="flex flex-1 flex-col overflow-hidden border-l-4 border-gray-200 dark:border-gray-800">
      <ReadmePreview {drive} path={currentPath} file={readmeFile} disableEdit={!isOwner} />
    </div>
  {/if}
</main>

{#if showDropOverlay}
  <div
    class="pointer-events-none fixed bottom-0 left-0 right-0 top-0 flex items-center justify-center bg-black bg-opacity-50 text-4xl"
  >
    <div class="flex gap-2 rounded-xl border-2 bg-gray-200 px-16 py-10 dark:bg-gray-800">
      <ArrowDownToBracketOutline class="mr-2 h-10 w-10" />Uploads Files
    </div>
  </div>
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
