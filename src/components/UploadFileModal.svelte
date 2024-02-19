<script lang="ts">
  import { Button, Input, Label, Modal, Select, Spinner } from "flowbite-svelte";
  import { handleEvent, packs } from "../services/packs";
  import { NDKEvent } from "@nostr-dev-kit/ndk";
  import { getFileTree, parsePath, setFile, setPackFileTree } from "../helpers/tree";
  import { servers } from "../services/servers";
  import type { Blob } from "../services/blobs";
  import { ndk } from "../services/ndk";
  import { cloneEvent } from "../helpers/event";
  import { getPackName } from "../helpers/packs";

  export let open = false;
  export let pack: NDKEvent | undefined = undefined;
  export let path: string = "";

  let packId = "";
  let file: File | undefined = undefined;
  let name = "";

  let selectedPack: NDKEvent | undefined = undefined;
  $: selectedPack = pack || $packs[packId];

  function fileChange(e: Event) {
    if (e.target instanceof HTMLInputElement) {
      file = e.target.files?.[0];
      if (file) name = file.name;
    }
  }

  let loading = "";
  async function upload(e: SubmitEvent) {
    e.preventDefault();
    if (!file) return;
    if (!selectedPack) return;

    loading = "Signing Auth";
    const auth = new NDKEvent(ndk);
    auth.kind = 22242;
    auth.content = "Authorize Upload";
    auth.tags.push(["name", name]);
    auth.tags.push(["size", String(file.size)]);
    await auth.sign();

    let blob: Blob | null = null;
    for (const server of $servers) {
      loading = `Uploading to ${server}`;
      const res = await fetch(new URL("/upload", server), {
        method: "PUT",
        body: file,
        headers: { Authorization: JSON.stringify(auth.rawEvent()) },
      });
      if (res.ok) {
        blob = (await res.json()) as Blob;
      } else {
        console.error(`Failed to upload to ${server}`);
        console.log(res.status, res.statusText);
        console.log(await res.text());
      }
    }

    if (!blob) {
      console.error("Failed to upload");
      return;
    }

    const draft = cloneEvent(selectedPack, 30063);
    const tree = getFileTree(draft);

    setFile(tree, [...parsePath(path), name], { hash: blob.sha256, size: blob.size, mimeType: blob.type });

    setPackFileTree(draft, tree);

    loading = "Adding to pack...";
    await draft.sign();
    handleEvent(draft);
    await draft.publish();

    loading = "";
    open = false;
  }
</script>

<Modal bind:open size="md" outsideclose class="w-full" title="Upload File">
  {#if loading}
    <div class="flex items-center gap-4">
      <Spinner />
      <span>{loading}</span>
    </div>
  {:else}
    <form class="flex flex-col space-y-4" on:submit={upload}>
      <Input type="file" name="file" required on:change={fileChange} />
      {#if !pack}
        <Label>
          <span>Add to Pack</span>
          <Select bind:value={packId} required>
            {#each Object.entries($packs) as [d, pack]}
              <option value={d}>{getPackName(pack)}</option>
            {/each}
          </Select>
        </Label>
      {/if}
      <Label
        ><span>Filename</span>
        <Input type="text" name="name" required bind:value={name} />
      </Label>
      <Button type="submit" class="w-full">Upload</Button>
    </form>
  {/if}
</Modal>
