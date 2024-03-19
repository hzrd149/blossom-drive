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
    A,
    Heading,
    P,
    Alert,
  } from "flowbite-svelte";
  import { serverEvent, servers } from "../services/servers";
  import { cloneEvent } from "../helpers/event";
  import { activeUser } from "../services/ndk";
  import LoginPage from "../components/LoginPage.svelte";

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

      if (!server.startsWith("http")) server = "https://" + server;

      const draft = cloneEvent($serverEvent, 10063);
      draft.tags.push(["r", new URL(server).toString()]);
      await draft.sign();
      await draft.publish();
      loading = false;
      server = "";
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

{#if $activeUser}
  <div class="flex w-full max-w-screen-lg flex-col gap-4 p-4">
    <Heading tag="h2">Servers</Heading>

    {#if $servers.length > 0}
      <Table>
        <TableHead>
          <TableHeadCell>Server URL</TableHeadCell>
          <TableHeadCell>Action</TableHeadCell>
        </TableHead>
        <TableBody>
          {#each $servers as server}
            <TableBodyRow>
              <TableBodyCell>
                <a href={server} target="_blank" class="hover:underline">{new URL(server).hostname}</a>
              </TableBodyCell>
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
    {:else}
      <Alert color="yellow" class="text-lg">
        <span class="font-medium">Warning!</span>
        You need at least one server to upload files. try adding
        <a
          href="https://cdn.satellite.earth"
          class="font-bold underline"
          on:click={(e) => {
            e.preventDefault();
            server = "https://cdn.satellite.earth";
            confirmModal = true;
          }}
        >
          cdn.satellite.earth
        </a>
      </Alert>
    {/if}

    <form class="flex gap-2" on:submit={handleSubmit}>
      <Input placeholder="https://cdn.example.com" bind:value={server} required type="url" />
      <Button class="shrink-0" disabled={loading} type="submit">Add Server</Button>
    </form>

    <Heading tag="h4">What are blossom servers?</Heading>
    <P>
      <a href="https://github.com/hzrd149/blossom/blob/master/Server.md" target="_blank" class="hover:underline"
        >Blossom servers</a
      > are servers that store your files and make them publicly available for anyone else on the internet
    </P>
  </div>

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
{:else}
  <LoginPage />
{/if}
