<script lang="ts">
  import {
    Button,
    Input,
    Table,
    TableBody,
    TableBodyCell,
    TableBodyRow,
    TableHead,
    TableHeadCell,
  } from "flowbite-svelte";
  import { serverEvent, servers } from "../services/servers";
  import { NDKEvent } from "@nostr-dev-kit/ndk";
  import { ndk } from "../services/ndk";

  let server = "";
  let loading = false;
  async function addServer(e: SubmitEvent) {
    e.preventDefault();
    loading = true;
    const draft = new NDKEvent(ndk, $serverEvent?.rawEvent());
    draft.kind = 10063;
    draft.content = draft.content || "";
    draft.tags.push(["r", new URL(server).toString()]);
    await draft.sign();
    await draft.publish();
    loading = false;
  }

  async function removeServer(server: string) {
    loading = true;
    const draft = new NDKEvent(ndk, $serverEvent?.rawEvent());
    draft.kind = 10063;
    draft.content = draft.content || "";
    draft.tags = draft.tags.filter((t) => t[0] === "r" && t[1] !== server);
    await draft.sign();
    await draft.publish();
    loading = false;
  }
</script>

<Table>
  <TableHead>
    <TableHeadCell>Server URL</TableHeadCell>
    <TableHeadCell>Action</TableHeadCell>
  </TableHead>
  <TableBody>
    {#each $servers as server}
      <TableBodyRow>
        <TableBodyCell>{server}</TableBodyCell>
        <TableBodyCell>
          <a
            href="#/"
            class="font-medium text-primary-600 hover:underline dark:text-primary-500"
            on:click={(e) => {
              e.preventDefault();
              removeServer(server);
            }}>Remove</a
          ></TableBodyCell
        >
      </TableBodyRow>
    {/each}
  </TableBody>
</Table>

<form class="flex gap-2 px-2" on:submit={addServer}>
  <Input placeholder="https://cdn.example.com" bind:value={server} required />
  <Button class="shrink-0" disabled={loading}>Add Server</Button>
</form>
