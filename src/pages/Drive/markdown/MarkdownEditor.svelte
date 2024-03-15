<script lang="ts">
  import { Alert, Button, Toggle } from "flowbite-svelte";
  import Markdown from "svelte-exmarkdown";
  import { gfmPlugin } from "svelte-exmarkdown/gfm";
  import { EditOutline, EyeOutline, FileOutline } from "flowbite-svelte-icons";
  import { basicSetup } from "codemirror";
  import { markdown } from "@codemirror/lang-markdown";
  import CodeMirror from "svelte-codemirror-editor";
  import { githubLight, githubDark } from "@uiw/codemirror-theme-github";

  import { componentPlugin } from "./plugins/components";
  import { highlightPlugin } from "./plugins/highlight";
  import { createEventDispatcher } from "svelte";

  export let saving = false;
  export let value: string | null;
  $: content = value;

  $: savable = content !== value;

  const dispatch = createEventDispatcher();

  let isDark = document.documentElement.classList.contains("dark");
  let mode = value === null ? "editor" : "preview";
  // let autoSave = localStorage.getItem("auto-save") !== "false";

  // $: {
  //   localStorage.setItem("auto-save", String(autoSave));
  // }

  // update dark when mode changes
  $: {
    mode;
    isDark = document.documentElement.classList.contains("dark");
  }

  const plugins = [gfmPlugin(), highlightPlugin, componentPlugin];
</script>

{#if mode === "preview"}
  <div class="relative h-0 min-w-96 flex-grow overflow-auto px-4 pb-10 pt-4">
    <Button class="absolute right-2 top-2" size="sm" on:click={() => (mode = "editor")}>
      <EditOutline class="mr-2" />Editor
    </Button>
    <Markdown md={content} {plugins} />
  </div>
{:else if mode === "editor"}
  <div class="flex min-w-96 flex-1 flex-col overflow-hidden">
    <div class="flex gap-4 p-2">
      <!-- <Toggle bind:checked={autoSave}>Auto Save</Toggle> -->

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
        extensions={[basicSetup]}
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
