<script lang="ts">
  import { A } from "flowbite-svelte";
  import { getContext } from "svelte";
  import { EncryptedDrive, joinPath, type Drive } from "blossom-drive-sdk";
  import { servers } from "../../../../../services/servers";
  import { getLocalFileURL } from "../../../../../services/downloads";
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

  const drive = getContext<Drive | EncryptedDrive>("drive");
  const subPath = getContext<string>("path");

  async function handleClick(e: MouseEvent) {
    if (drive instanceof EncryptedDrive) {
      e.preventDefault();

      const fullPath = href.startsWith("/")
        ? href.replaceAll("%20", " ")
        : joinPath(subPath, href.replaceAll("%20", " ").replace(/^\.\//, ""));

      const file = drive.getFile(fullPath);
      const url = await getLocalFileURL(drive, file.path, $servers);

      window.open(url, "_blank");
    }
  }
</script>

<A href={resolved || undefined} target="_blank" on:click={handleClick}><slot /></A>
