<script lang="ts">
  import { onDestroy } from "svelte";
  import { Button } from "flowbite-svelte";

  import HostDriveModal from "../components/HostDriveModal.svelte";
  import { activeUser, ndk } from "../services/ndk";
  import HostRequestCard from "../components/HostRequestCard.svelte";
  import { getRequestInput } from "../helpers/dvm";

  let newHosting = false;

  const requests = ndk.storeSubscribe(
    [
      { kinds: [5902 as number], authors: [$activeUser.pubkey] },
      // { kinds: [7000 as number], "#p": [$activeUser.pubkey] },
    ],
    { closeOnEose: false },
  );

  $: rootRequests = $requests.filter((r) => getRequestInput(r.rawEvent())?.type === "text");

  onDestroy(() => {
    requests.unsubscribe();
  });
</script>

<main class="flex flex-col gap-4 p-4">
  <div class="flex items-center justify-between">
    <h2 class="text-xl font-bold">Hosted Drives</h2>
    <Button on:click={() => (newHosting = true)}>Host Drive</Button>
  </div>

  {#each rootRequests as request}
    <HostRequestCard {request} />
  {/each}
</main>

{#if newHosting}
  <HostDriveModal bind:open={newHosting} />
{/if}
