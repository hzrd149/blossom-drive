<script lang="ts">
  import { Button, DropdownItem, Dropdown } from "flowbite-svelte";
  import { servers } from "../services/servers";
  import {
    DotsHorizontalSolid,
    ArrowUpRightFromSquareOutline,
    InfoCircleOutline,
    EditOutline,
    TrashBinOutline,
    FileCopyOutline,
    ArrowDownToBracketOutline,
  } from "flowbite-svelte-icons";
  import { createEventDispatcher } from "svelte";
  import { getBlobURL } from "../helpers/blob";
  import type TreeFile from "../blossom-drive-client/FileTree/TreeFile";
  import { extname } from "path-browserify";
  import { getExtension } from "../blossom-drive-client/helpers";

  export let file: TreeFile;
  export let selected = false;
  export let encrypted = false;
  export let readonly = false;

  const dispatch = createEventDispatcher();

  $: borderClass = selected
    ? "border border-primary-200 dark:border-primary-700"
    : "border border-gray-200 dark:border-gray-700 ";

  $: extension = file.type ? getExtension(file.type) ?? extname(file.name) : extname(file.name);
  $: preview = !encrypted && file.type?.startsWith("image/") && file.size < 1024 * 100;
  $: previewLink = getBlobURL(file, $servers[0]);

  function toggleSelect() {
    if (selected) dispatch("unselect", file.name);
    else dispatch("select", file.name);
  }

  function dragStart(e: DragEvent) {
    if (!e.dataTransfer) return;
    e.dataTransfer.dropEffect = "move";
    e.dataTransfer.setData("text", file.name);
  }
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<div
  class={"relative flex h-40 w-48 flex-col divide-gray-200 rounded-md border-2 bg-white text-gray-700 hover:bg-gray-100 dark:divide-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700" +
    borderClass}
  on:dragstart={dragStart}
  on:click|stopPropagation={toggleSelect}
  on:dblclick={() => dispatch("open", file)}
  role="row"
  tabindex={0}
  draggable="true"
>
  <div class="flex flex-grow items-center justify-center overflow-hidden text-xl font-bold">
    {#if preview && previewLink}
      <div class="preview-image" style="background-image: url({previewLink});" />
    {:else}
      <span class="m-4">{extension}</span>
    {/if}
  </div>
  <hr />
  <div class="w-full max-w-48 truncate px-4 py-2 text-center text-sm">{file.name}</div>
  <Button
    size="xs"
    color="none"
    class="absolute right-0 top-0 !p-1"
    on:click={(e) => {
      e.stopPropagation();
      dispatch("open", file);
    }}
  >
    <ArrowUpRightFromSquareOutline />
  </Button>
  <Button
    size="xs"
    color="none"
    class="absolute bottom-1 right-1 !p-1"
    on:click={(e) => {
      e.preventDefault();
      e.stopPropagation();
    }}
  >
    <DotsHorizontalSolid />
  </Button>
  <Dropdown class="w-48" placement="bottom-start">
    <DropdownItem
      on:click={(e) => {
        e.preventDefault();
        e.stopPropagation();
        dispatch("open", file);
      }}
    >
      <ArrowUpRightFromSquareOutline class="mr-2 inline-block h-5 w-5" />Open
    </DropdownItem>
    <DropdownItem
      on:click={(e) => {
        e.preventDefault();
        e.stopPropagation();
        dispatch("download", file);
      }}
    >
      <ArrowDownToBracketOutline class="mr-2 inline-block h-5 w-5" />Download
    </DropdownItem>
    <DropdownItem
      on:click={(e) => {
        e.preventDefault();
        e.stopPropagation();
        dispatch("details", file);
      }}
    >
      <InfoCircleOutline class="mr-2 inline-block h-5 w-5" />Details
    </DropdownItem>
    <DropdownItem
      on:click={(e) => {
        e.preventDefault();
        e.stopPropagation();
        window.navigator.clipboard.writeText(file.sha256);
      }}
    >
      <FileCopyOutline class="mr-2 inline-block h-5 w-5" />Copy Hash
    </DropdownItem>
    {#if !readonly}
      <DropdownItem
        on:click={(e) => {
          e.preventDefault();
          e.stopPropagation();
          dispatch("rename", file);
        }}
      >
        <EditOutline class="mr-2 inline-block h-5 w-5" />Rename
      </DropdownItem>
      <DropdownItem
        class="text-red-500"
        on:click={(e) => {
          e.preventDefault();
          e.stopPropagation();
          dispatch("delete", file);
        }}
      >
        <TrashBinOutline class="mr-2 inline-block h-5 w-5" />Delete
      </DropdownItem>
    {/if}
  </Dropdown>
</div>

<style>
  .preview-image {
    background-position: center;
    background-size: contain;
    background-repeat: no-repeat;
    width: 100%;
    height: 100%;
  }
</style>
