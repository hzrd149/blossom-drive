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
  import { cloneEvent } from "../helpers/event";

  let server = "";
  let loading = false;
  async function addServer(e: SubmitEvent) {
    try {
      e.preventDefault();
      loading = true;
      const draft = cloneEvent($serverEvent, 10063);
      draft.tags.push(["r", new URL(server).toString()]);
      await draft.sign();
      await draft.publish();
      loading = false;
    } catch (e) {
      if (e instanceof Error) alert(e.message);
      console.log(e);
    }
  }

  async function removeServer(server: string) {
    try {
      loading = true;
      const draft = cloneEvent($serverEvent, 10063);
      draft.tags = draft.tags.filter((t) => t[0] === "r" && t[1] !== server);
      await draft.sign();
      await draft.publish();
      loading = false;
    } catch (e) {
      if (e instanceof Error) alert(e.message);
      console.log(e);
    }
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
  <Button class="shrink-0" disabled={loading} type="submit">Add Server</Button>
</form>
