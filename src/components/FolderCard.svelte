<script lang="ts">
  import { Button, Dropdown, DropdownItem } from "flowbite-svelte";
  import {
    ArrowDownToBracketOutline,
    DotsHorizontalOutline,
    EditOutline,
    FolderSolid,
    TrashBinOutline,
  } from "flowbite-svelte-icons";
  import { createEventDispatcher } from "svelte";
  import { location, push, querystring } from "svelte-spa-router";
  import { type TreeFolder } from "blossom-drive-client";

  export let folder: TreeFolder;
  export let selected = false;
  export let readonly = false;

  const dispatch = createEventDispatcher();

  function toggleSelect() {
    if (selected) dispatch("unselect", folder.name);
    else dispatch("select", folder.name);
  }

  let dropHighlight = false;
  $: borderClass =
    selected || dropHighlight
      ? "border border-primary-200 dark:border-primary-700"
      : "border border-gray-200 dark:border-gray-700";

  function createDirLink(name: string, q?: string) {
    const query = new URLSearchParams(q);
    const path = query.get("path");
    query.set("path", (path ?? "") + "/" + name);
    return "#" + $location + "?" + query.toString();
  }

  function dragStart(e: DragEvent) {
    if (!e.dataTransfer) return;
    e.dataTransfer.dropEffect = "move";
    e.dataTransfer.setData("text", folder.name);
  }
  function dragenter(e: DragEvent) {
    e.stopPropagation();
    e.stopImmediatePropagation();
    const text = e.dataTransfer?.getData("text") ?? "";
    if (!text.startsWith("http") && text !== folder.name) {
      dropHighlight = true;
    }
  }
  function dragleave(e: DragEvent) {
    e.stopPropagation();
    e.stopImmediatePropagation();
    dropHighlight = false;
  }
  function dragover(e: DragEvent) {
    e.stopPropagation();
    e.stopImmediatePropagation();
    const text = e.dataTransfer?.getData("text") ?? "";
    if (!text.startsWith("http") && text !== folder.name) {
      e.preventDefault();
      dropHighlight = true;
    }
  }
  function drop(e: DragEvent) {
    e.stopPropagation();
    e.stopImmediatePropagation();
    e.preventDefault();

    dropHighlight = false;
    if (e.dataTransfer) {
      if (e.dataTransfer.files.length > 0) {
        const files = e.dataTransfer.files;
        dispatch("upload-files", files);
      } else {
        const src = e.dataTransfer.getData("text");
        if (src) dispatch("move-blob", { src, dest: folder.name });
      }
    }
  }
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<div
  class={"relative flex h-40 w-48 flex-col divide-gray-200 rounded-md border-2 bg-white text-gray-700 hover:bg-gray-100 dark:divide-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700" +
    borderClass}
  on:click|stopPropagation={toggleSelect}
  on:dblclick={() => push(createDirLink(folder.name, $querystring))}
  on:drop={drop}
  on:dragover={dragover}
  on:dragenter={dragenter}
  on:dragleave={dragleave}
  on:dragstart={dragStart}
  draggable="true"
  role="row"
  tabindex={0}
>
  <div class="flex flex-grow items-center justify-center p-4"><FolderSolid class="h-10 w-10" /></div>
  <hr />
  <div class="max-w-48 truncate px-4 py-2 text-center text-sm">{folder.name}</div>
  {#if !readonly}
    <Button
      size="xs"
      color="none"
      class="absolute bottom-1 right-1 !p-1"
      on:click={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
    >
      <DotsHorizontalOutline />
    </Button>
    <Dropdown class="w-48" placement="bottom-start">
      <DropdownItem
        on:click={(e) => {
          e.preventDefault();
          e.stopPropagation();
          dispatch("download", folder);
        }}
      >
        <ArrowDownToBracketOutline class="mr-2 inline-block h-5 w-5" />Download
      </DropdownItem>
      <DropdownItem
        on:click={(e) => {
          e.preventDefault();
          e.stopPropagation();
          dispatch("rename", folder);
        }}><EditOutline class="mr-2 inline-block h-5 w-5" />Rename</DropdownItem
      >
      <DropdownItem
        on:click={(e) => {
          e.preventDefault();
          e.stopPropagation();
          dispatch("delete", folder);
        }}><TrashBinOutline class="mr-2 inline-block h-5 w-5" />Delete</DropdownItem
      >
    </Dropdown>
  {/if}
</div>
