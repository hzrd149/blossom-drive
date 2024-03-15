<script lang="ts">
  import { Img } from "flowbite-svelte";
  import { joinPath } from "../../../../../blossom-drive-client/FileTree/methods";
  import { servers } from "../../../../../services/servers";
  import { getContext } from "svelte";
  import { EncryptedDrive } from "../../../../../blossom-drive-client/EncryptedDrive";
  import type Drive from "../../../../../blossom-drive-client/Drive";

  export let src: string;
  export let alt: string;

  let resolved = src;

  $: {
    const drive = getContext<Drive | EncryptedDrive>("drive");
    if (drive) {
      if (src.startsWith("./") || src.startsWith("/")) {
        try {
          const subPath = getContext<string>("path");
          if (drive instanceof EncryptedDrive) {
            resolved = "";
          } else {
            const fullPath = src.startsWith("/") ? src : joinPath(subPath, src.replace(/^\.\//, ""));
            resolved = drive.getFileURL(fullPath, $servers);
          }
        } catch (e) {
          resolved = "";
        }
      }
    }
  }
</script>

<Img src={resolved || undefined} {alt} />
