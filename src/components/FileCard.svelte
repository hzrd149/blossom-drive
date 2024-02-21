<script lang="ts">
  import { Button, Checkbox, DropdownItem, Dropdown } from "flowbite-svelte";
  import mime from "mime";
  import type { TreeFile } from "../helpers/tree";
  import { servers } from "../services/servers";
  import { DotsHorizontalSolid } from "flowbite-svelte-icons";
  import { createEventDispatcher } from "svelte";

  export let file: TreeFile;
  export let selected = false;

  const dispatch = createEventDispatcher();

  $: borderClass = selected
    ? "border border-primary-200 dark:border-primary-700"
    : "border border-gray-200 dark:border-gray-700";

  $: link = $servers[0]
    ? new URL(file.hash + (file.mimeType ? "." + mime.getExtension(file.mimeType) : ""), $servers[0]).toString()
    : undefined;

  $: extension = file.mimeType ? mime.getExtension(file.mimeType) : "bin";
  $: preview = file.mimeType?.startsWith("image/") && file.size < 1024 * 100;

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

<a
  href={link}
  class={"relative flex aspect-square min-w-40 flex-col divide-gray-200 rounded-md border bg-white text-gray-700 hover:bg-gray-100 dark:divide-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700" +
    borderClass}
  on:dragstart={dragStart}
  target="_blank"
>
  <Checkbox
    class="absolute left-1 top-1"
    on:click={(e) => {
      e.preventDefault();
      toggleSelect();
    }}
    bind:checked={selected}
  />
  <div class="flex flex-grow items-center justify-center overflow-hidden text-xl font-bold">
    {#if preview && link}
      <div class="preview-image" style="background-image: url({link});" />
    {:else}
      <span class="m-4">{extension}</span>
    {/if}
  </div>
  <hr />
  <div class="max-w-40 truncate px-4 py-2 text-center text-sm">{file.name}</div>
  <Button size="xs" color="none" class="absolute bottom-1 right-1 !p-1" on:click={(e) => e.preventDefault()}>
    <DotsHorizontalSolid />
  </Button>
  <Dropdown>
    <DropdownItem
      on:click={(e) => {
        e.preventDefault();
        dispatch("delete", file.name);
      }}>Delete</DropdownItem
    >
    <DropdownItem
      on:click={(e) => {
        e.preventDefault();
        dispatch("rename", file.name);
      }}>Rename</DropdownItem
    >
  </Dropdown>
</a>

<style>
  .preview-image {
    image-rendering: pixelated;
    background-position: center;
    background-size: contain;
    background-repeat: no-repeat;
    width: 100%;
    height: 100%;
  }
</style>
