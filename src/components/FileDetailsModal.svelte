<script lang="ts">
  import { Name } from "@nostr-dev-kit/ndk-svelte-components";
  import { Modal } from "flowbite-svelte";
  import { formatBytes } from "../helpers/number";
  import { getBlobURL } from "../helpers/blob";
  import { ndk } from "../services/ndk";
  import { onDestroy } from "svelte";
  import { getDriveName } from "../helpers/drives";
  import type TreeFile from "../blossom-drive-client/FileTree/TreeFile";

  export let open = false;
  export let file: TreeFile;

  const drives = ndk.storeSubscribe({ kinds: [30563 as number], "#x": [file.sha256] });
  const files = ndk.storeSubscribe({ kinds: [1063 as number], "#x": [file.sha256] });

  onDestroy(() => {
    drives.unsubscribe();
    files.unsubscribe();
  });
</script>

<Modal title={file.name} bind:open autoclose outsideclose size="lg">
  <p>
    <span class="font-bold">sha256</span>: <code>{file.sha256}</code>
    <br />
    <span class="font-bold">Size</span>: {formatBytes(file.size)}
    <br />
    <span class="font-bold">Type</span>: {file.type || "Unknown"}
    <br />
    <span class="font-bold">URL</span>:
    <a href={getBlobURL(file)} target="_blank" class="hover:underline">{getBlobURL(file)}</a>
  </p>

  {#if $drives.length > 0}
    <div>
      <h2 class="text-xl font-bold">Drives:</h2>
      <ul>
        {#each $drives as event}
          <li><span class="font-bold">{getDriveName(event)}</span> by <Name user={event.author} /></li>
        {/each}
      </ul>
    </div>
  {/if}
  {#if $files.length > 0}
    <div>
      <h2 class="text-xl font-bold">Published Files:</h2>
      <ul>
        {#each $files as file}
          <li><a href="https://nostr.com">{file.id.substring(0, 8)}</a> by <Name user={file.author} /></li>
        {/each}
      </ul>
    </div>
  {/if}
</Modal>
