<script lang="ts">
  import type { NDKEvent } from "@nostr-dev-kit/ndk";
  import { A, Button, Card } from "flowbite-svelte";
  import {
    getHostStatusMetadata,
    getJobStatusType,
    getRequestInput,
    getRequestInputParam,
    getStatusType,
  } from "../helpers/dvm";
  import { nip19 } from "nostr-tools";
  import { drives } from "../services/drives";
  import { getDriveName } from "../helpers/drives";
  import dayjs from "dayjs";
  import { ArrowRightOutline } from "flowbite-svelte-icons";
  import { onDestroy } from "svelte";
  import { ndk } from "../services/ndk";
  import { Avatar, Name } from "@nostr-dev-kit/ndk-svelte-components";

  export let request: NDKEvent;

  $: input = getRequestInput(request.rawEvent());
  $: name = getRequestInputParam(request.rawEvent(), "name");
  $: start = getRequestInputParam(request.rawEvent(), "start");
  $: end = getRequestInputParam(request.rawEvent(), "end");

  $: parsedInput = input?.value ? nip19.decode(input.value) : undefined;
  $: drive = parsedInput?.type === "naddr" ? $drives[parsedInput.data.identifier] : undefined;

  const events = ndk.storeSubscribe({ kinds: [7000, 6902 as number], "#e": [request.id] }, { closeOnEose: false });

  $: dvmStatus = $events
    .filter((e) => e.kind === 7000)
    .reduce<Record<string, NDKEvent>>((dir, event) => {
      if (event.kind !== 7000) return dir;
      if (!dir[event.pubkey] || event.created_at! > dir[event.pubkey].created_at!) {
        dir[event.pubkey] = event;
      }
      return dir;
    }, {});

  $: dvmComplete = $events
    .filter((e) => e.kind === 6902)
    .reduce<Record<string, NDKEvent>>((dir, event) => {
      if (!dir[event.pubkey] || event.created_at! > dir[event.pubkey].created_at!) {
        dir[event.pubkey] = event;
      }
      return dir;
    }, {});

  $: console.log(dvmStatus, dvmComplete);

  onDestroy(() => {
    events.unsubscribe();
  });
</script>

<Card>
  <div class="mb-2 flex items-center gap-2">
    <h5 class="text-lg font-bold tracking-tight text-gray-900 dark:text-white">
      <span>{name}</span>
    </h5>
    <span> - </span>
    <a href="#/drive/{input?.value}" class="text-primary-500 hover:underline">
      {drive ? getDriveName(drive) : "Unknown"}
    </a>
  </div>
  <div class="font-normal leading-tight text-gray-700 dark:text-gray-400">
    <p>
      Start: {dayjs.unix(parseInt(start)).format("ll")}
    </p>
    <p>End: {dayjs.unix(parseInt(end)).format("ll")}</p>
  </div>
  <div class="my-2">
    <p class="font-bold leading-tight text-gray-700 dark:text-gray-400">Hosting:</p>
    {#each Object.values(dvmStatus) as status}
      <div class="flex gap-2">
        <Name pubkey={status.pubkey} />
        <span>{getStatusType(status)} - </span>
        <a
          class="text-primary-300 hover:underline dark:text-primary-700"
          href={getHostStatusMetadata(status)?.url}
          target="_blank">{getHostStatusMetadata(status)?.domain}</a
        >
      </div>
    {/each}
  </div>
  <div class="flex items-center gap-2">
    <p class="ml-auto">{dayjs.unix(parseInt(end)).diff(dayjs(), "days")} days left</p>
    <Button>
      Extend <ArrowRightOutline class="ms-2 h-3.5 w-3.5 text-white" />
    </Button>
  </div>
</Card>
