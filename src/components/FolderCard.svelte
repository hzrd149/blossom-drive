<script lang="ts">
  import { Button, Checkbox, Dropdown, DropdownItem } from "flowbite-svelte";
  import { DotsHorizontalSolid, FolderSolid } from "flowbite-svelte-icons";
  import { createEventDispatcher } from "svelte";
  import { location, querystring } from "svelte-spa-router";

  export let name: string;
  export let selected = false;

  const dispatch = createEventDispatcher();

  function toggleSelect() {
    if (selected) dispatch("unselect", name);
    else dispatch("select", name);
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
    e.dataTransfer.setData("text", name);
  }
  function dragenter(e: DragEvent) {
    e.stopPropagation();
    e.stopImmediatePropagation();
    if (!e.dataTransfer?.getData("text").startsWith("http")) {
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
    if (!e.dataTransfer?.getData("text").startsWith("http")) {
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
        if (src) dispatch("move-blob", { src, dest: name });
      }
    }
  }
</script>

<a
  href={createDirLink(name, $querystring)}
  class={"relative flex aspect-square min-w-40 flex-col rounded-md border bg-white text-gray-700 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700" +
    borderClass}
  on:drop={drop}
  on:dragover={dragover}
  on:dragenter={dragenter}
  on:dragleave={dragleave}
  on:dragstart={dragStart}
>
  <Checkbox
    class="absolute left-1 top-1"
    on:click={(e) => {
      e.preventDefault();
      toggleSelect();
    }}
    bind:checked={selected}
  />
  <div class="flex flex-grow items-center justify-center p-4"><FolderSolid class="h-10 w-10" /></div>
  <hr />
  <div class="max-w-40 truncate px-4 py-2 text-center text-sm">{name}</div>
  <Button size="xs" color="none" class="absolute bottom-1 right-1 !p-1" on:click={(e) => e.preventDefault()}>
    <DotsHorizontalSolid />
  </Button>
  <Dropdown>
    <DropdownItem
      on:click={(e) => {
        e.preventDefault();
        dispatch("delete", name);
      }}>Delete</DropdownItem
    >
    <DropdownItem
      on:click={(e) => {
        e.preventDefault();
        dispatch("rename", name);
      }}>Rename</DropdownItem
    >
  </Dropdown>
</a>
