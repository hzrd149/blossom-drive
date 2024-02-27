<script lang="ts">
  import {
    Button,
    Input,
    Table,
    Modal,
    TableBody,
    TableBodyCell,
    TableBodyRow,
    TableHead,
    TableHeadCell,
  } from "flowbite-svelte";
  import { serverEvent, servers } from "../services/servers";
  import { cloneEvent } from "../helpers/event";

  let server = "";
  let confirmModal = false;
  async function handleSubmit(e: SubmitEvent) {
    e.preventDefault();
    confirmModal = true;
  }

  let loading = false;
  async function addServer() {
    if (!server) return;
    try {
      loading = true;

      if (!server.startsWith("http")) throw new Error("Protocol must be http:// or https://");
      const res = await fetch(new URL("/upload", server));
      if (res.status === 404) throw new Error("Server missing upload endpoint");

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

<form class="flex gap-2 px-2" on:submit={handleSubmit}>
  <Input placeholder="https://cdn.example.com" bind:value={server} required />
  <Button class="shrink-0" disabled={loading} type="submit">Add Server</Button>
</form>

{#if server}
  <Modal title="Add Server" bind:open={confirmModal} autoclose size="xl">
    <iframe
      class="w-full"
      style="height: 70vh;"
      src={new URL("/", server).toString()}
      frameborder="0"
      title="Server info"
    />
    <svelte:fragment slot="footer">
      <Button color="alternative" class="ml-auto">Cancel</Button>
      <Button on:click={addServer}>Add Server</Button>
    </svelte:fragment>
  </Modal>
{/if}
