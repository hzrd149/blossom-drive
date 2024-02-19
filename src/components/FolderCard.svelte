<script lang="ts">
  import { Checkbox } from "flowbite-svelte";
  import { FolderSolid } from "flowbite-svelte-icons";
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

  function dragenter(e: DragEvent) {
    dropHighlight = true;
  }
  function dragleave(e: DragEvent) {
    dropHighlight = false;
  }
  function dragover(e: DragEvent) {
    e.preventDefault();
    dropHighlight = true;
  }
  function drop(e: DragEvent) {
    dropHighlight = false;
    if (e.dataTransfer) {
      const filename = e.dataTransfer.getData("text");
      if (filename) dispatch("move-blob", { filename, folder: name });
    }
  }
</script>

<a
  href={createDirLink(name, $querystring)}
  class={"relative flex aspect-square min-w-40 flex-col rounded-md border bg-white text-gray-500 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700" +
    borderClass}
  on:drop={drop}
  on:dragover={dragover}
  on:dragenter={dragenter}
  on:dragleave={dragleave}
>
  <Checkbox
    class="absolute left-1 top-1"
    on:click={(e) => e.preventDefault()}
    checked={selected}
    on:change={toggleSelect}
  />
  <div class="flex flex-grow items-center justify-center p-4"><FolderSolid class="h-10 w-10" /></div>
  <hr />
  <div class="max-w-40 truncate px-4 py-2 text-center text-sm">{name}</div>
</a>
