<script lang="ts">
  import { getContext } from "svelte";
  import { Img, Spinner } from "flowbite-svelte";
  import { joinPath } from "../../../../../blossom-drive-client/FileTree/methods";
  import { servers } from "../../../../../services/servers";
  import type Drive from "../../../../../blossom-drive-client/Drive";
  import { getLocalFileURL } from "../../../../../services/downloads";

  export let src: string;
  export let alt: string;

  let loading = false;
  let resolved = src;

  $: {
    const drive = getContext<Drive>("drive");
    if (drive) {
      if (src.startsWith("./") || src.startsWith("/")) {
        loading = true;
        try {
          const subPath = getContext<string>("path");
          const fullPath = src.startsWith("/") ? src : joinPath(subPath, src.replace(/^\.\//, ""));

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
{:else}
  <Img src={resolved || undefined} {alt} class="max-h-96" />
{/if}
