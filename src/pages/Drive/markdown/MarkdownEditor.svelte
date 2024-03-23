<script lang="ts">
  import { Button } from "flowbite-svelte";
  import Markdown from "svelte-exmarkdown";
  import { gfmPlugin } from "svelte-exmarkdown/gfm";
  import { EditOutline, EyeOutline, FileOutline } from "flowbite-svelte-icons";
  import { basicSetup } from "codemirror";
  import { markdown, markdownLanguage } from "@codemirror/lang-markdown";
  import CodeMirror from "svelte-codemirror-editor";
  import { githubLight, githubDark } from "@uiw/codemirror-theme-github";
  import { type Drive, joinPath } from "blossom-drive-sdk";

  import { componentPlugin } from "./plugins/components";
  import { highlightPlugin } from "./plugins/highlight";
  import { createEventDispatcher, setContext } from "svelte";
  import { createAutocompleteFromDrivePath } from "./plugins/autocomplete";

  export let saving = false;
  export let disableEdit = false;
  export let value: string | null;

  export let drive: Drive;
  export let path: string;

  // set context for A and Img components
  $: setContext("drive", drive);
  $: setContext("path", path);

  $: content = value ?? "";

  $: savable = content !== value;
  $: autocomplete = createAutocompleteFromDrivePath((p: string) =>
    drive.getFolder(p.startsWith("./") ? joinPath(path, p.replace(/^\.\//, "")) : p),
  );

  const dispatch = createEventDispatcher();

  let isDark = document.documentElement.classList.contains("dark");
  let mode = value === null ? "editor" : "preview";

  // update dark when mode changes
  $: {
    mode;
    isDark = document.documentElement.classList.contains("dark");
  }

  const plugins = [gfmPlugin(), highlightPlugin, componentPlugin];
</script>

{#if mode === "preview"}
  <div class="relative h-0 min-w-96 flex-grow overflow-auto px-4 pb-10 pt-4">
    {#if !disableEdit}
      <Button class="absolute right-2 top-2" size="sm" on:click={() => (mode = "editor")}>
        <EditOutline class="mr-2" />Editor
      </Button>
    {/if}
    <Markdown md={content} {plugins} />
  </div>
{:else if mode === "editor"}
  <div class="flex min-w-96 flex-1 flex-col overflow-hidden">
    <div class="flex gap-4 p-2">
      <Button
        size="sm"
        color={savable ? "primary" : "alternative"}
        on:click={() => dispatch("save", content)}
        disabled={saving}
      >
        <FileOutline class="mr-2" />Save
      </Button>

      <Button class="ml-auto" size="sm" on:click={() => (mode = "preview")}>
        <EyeOutline class="mr-2" />Preview
      </Button>
    </div>

    <p class="truncate px-2 pb-2 text-red-500">
      This editor will NOT delete the old version of the Readme.md file, you will have to manually cleanup any loose
      blobs
    </p>

    <div class="flex flex-1 flex-col overflow-auto">
      <CodeMirror
        bind:value={content}
        lang={markdown()}
        extensions={[basicSetup, markdownLanguage.data.of({ autocomplete })]}
        theme={isDark ? githubDark : githubLight}
        useTab={false}
        class="flex-1"
        styles={{
          "&": {
            width: "100%",
            height: "100%",
          },
          ".cm-line": {
            paddingRight: "4rem",
          },
        }}
      />
    </div>
  </div>
{/if}
