<script lang="ts">
  import { Alert } from "flowbite-svelte";
  import { Upload, type TreeFile, type Drive } from "blossom-drive-client";
  import { readFileAsText } from "../../services/file-reader";
  import { servers } from "../../services/servers";
  import MarkdownEditor from "./markdown/MarkdownEditor.svelte";
  import { signEventTemplate } from "../../services/ndk";
  import { addUpload } from "../../services/uploads";

  export let drive: Drive;
  export let file: TreeFile | undefined;
  export let path: string;
  export let disableEdit = false;

  let markdown: string | undefined | null = undefined;
  let error: Error | null = null;

  $: file
    ? drive
        .downloadFile(file.path, $servers)
        .then(async (data) => {
          if (!data) throw new Error("Failed to load file");
          const str = await readFileAsText(data);
          markdown = str;
        })
        .catch((err) => {
          if (err instanceof Error) error = err;
          console.log(err);
        })
    : (markdown = null);

  let saving = false;
  async function save(e: CustomEvent<string>) {
    if (disableEdit) return;
    try {
      saving = true;

      const newFile = new File([e.detail], file?.name ?? "README.md", { type: "text/markdown" });
      const upload = new Upload(drive, path, $servers, signEventTemplate);
      upload.addFile(newFile);
      addUpload(upload);
      await upload.upload();
    } catch (error) {
      if (error instanceof Error) alert(error.message);
    }
    saving = false;
  }
</script>

{#if error}
  <Alert>{error.message}</Alert>
{:else if markdown !== undefined}
  <MarkdownEditor value={markdown} on:save={save} {saving} {disableEdit} {drive} {path} />
{/if}
