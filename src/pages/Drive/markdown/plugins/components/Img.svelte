<script lang="ts">
  import { getContext } from "svelte";
  import { Img, Spinner, Video } from "flowbite-svelte";
  import { joinPath, type Drive } from "blossom-drive-sdk";
  import mime from "mime";
  import { servers } from "../../../../../services/servers";
  import { getLocalFileURL } from "../../../../../services/downloads";

  export let src: string;
  export let alt: string;

  $: type = mime.getType(src);
  let loading = false;
  let resolved = src;

  $: {
    const drive = getContext<Drive>("drive");
    if (drive) {
      if (src.startsWith("./") || src.startsWith("/")) {
        loading = true;
        try {
          const subPath = getContext<string>("path");
          const fullPath = src.startsWith("/")
            ? src.replaceAll("%20", " ")
            : joinPath(subPath, src.replaceAll("%20", " ").replace(/^\.\//, ""));

          getLocalFileURL(drive, fullPath, $servers)
            .then((url) => (resolved = url))
            .finally(() => (loading = false));
        } catch (e) {
          resolved = "";
          loading = false;
        }
      }
    }
  }
</script>

{#if loading}
  <Spinner />
{:else if type?.startsWith("video/")}
  <Video src={resolved || ""} class="max-h-96" controls />
{:else}
  <Img src={resolved || undefined} {alt} class="max-h-96" />
{/if}
