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
  href={new URL(file.hash + (file.mimeType ? "." + mime.getExtension(file.mimeType) : ""), $servers[0]).toString()}
  class={"relative flex aspect-square min-w-40 flex-col divide-gray-200 rounded-md border bg-white text-gray-500 hover:bg-gray-100 dark:divide-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700" +
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
  <div class="flex flex-grow items-center justify-center p-4 text-xl font-bold">
    {file.mimeType ? mime.getExtension(file.mimeType) : "bin"}
  </div>
  <hr />
  <div class="max-w-40 truncate px-4 py-2 text-center text-sm">{file.name}</div>
  <Button size="xs" color="none" class="absolute bottom-1 right-1 !p-1" on:click={(e) => e.preventDefault()}>
    <DotsHorizontalSolid />
  </Button>
  <Dropdown>
    <DropdownItem>Remove</DropdownItem>
    <DropdownItem>Delete</DropdownItem>
  </Dropdown>
</a>
