<script lang="ts">
  import { Button, Spinner, Tooltip } from "flowbite-svelte";
  import { DownloadOutline } from "flowbite-svelte-icons";
  import { type Drive, type TreeFile, type TreeFolder } from "blossom-drive-sdk";
  import { MultiDownload } from "../../../helpers/multi-download";
  import { servers } from "../../../services/servers";

  export let drive: Drive;
  export let path: string;
  export let selected: string[];

  $: subTree = drive.getFolder(path);

  let loading = false;
  async function download() {
    loading = true;
    const download = new MultiDownload(drive, $servers);
    const entries: (TreeFile | TreeFolder)[] = [];
    for (const entry of subTree) {
      if (selected.includes(entry.name)) entries.push(entry);
    }

    download.on("log", (message) => console.log(download.id, message));

    if (entries.length > 0) await download.start(entries);
    else await download.start([subTree]);

    loading = false;
  }
</script>

<Button
  size="sm"
  class="!p-2"
  color="alternative"
  on:click={download}
  disabled={subTree.children.length === 0 || loading}
>
  {#if loading}
    <Spinner size="5" />
  {:else}
    <DownloadOutline />
  {/if}
</Button>
<Tooltip placement="bottom">Download</Tooltip>
