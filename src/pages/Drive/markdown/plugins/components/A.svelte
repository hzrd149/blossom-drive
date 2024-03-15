<script lang="ts">
  import { A } from "flowbite-svelte";
  import { getContext } from "svelte";
  import { EncryptedDrive } from "../../../../../blossom-drive-client/EncryptedDrive";
  import type Drive from "../../../../../blossom-drive-client/Drive";
  import { joinPath } from "../../../../../blossom-drive-client/FileTree/methods";
  import { servers } from "../../../../../services/servers";
  export let href: string;

  let resolved = href;

  $: {
    const drive = getContext<Drive | EncryptedDrive>("drive");
    if (drive) {
      if (href.startsWith("./") || href.startsWith("/")) {
        try {
          const subPath = getContext<string>("path");
          if (drive instanceof EncryptedDrive) {
            resolved = "#encrypted";
          } else {
            const fullPath = href.startsWith("/") ? href : joinPath(subPath, href.replace(/^\.\//, ""));
            resolved = drive.getFileURL(fullPath, $servers);
          }
        } catch (e) {
          resolved = "";
        }
      }
    }
  }

  function handleClick(e: MouseEvent) {
    const drive = getContext<Drive | EncryptedDrive>("drive");
    if (drive instanceof EncryptedDrive) {
      // TODO: open encrypted file
    }
  }
</script>

<A href={resolved || undefined} target="_blank" on:click={handleClick}><slot /></A>
