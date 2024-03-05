<script lang="ts">
  import { Button, Input, Modal, Select, Spinner } from "flowbite-svelte";
  import { ndk } from "../services/ndk";
  import { getDriveName } from "../helpers/drives";
  import { NDKEvent } from "@nostr-dev-kit/ndk";
  import { drives } from "../services/drives";
  import dayjs from "dayjs";
  import { lastError } from "../services/error";
  import { get } from "svelte/store";
  export let open = false;

  const format = "YYYY-MM-DD";

  let selectedDrive = "";
  let name = "";
  let start = dayjs().format(format);
  let end = dayjs().add(1, "month").format(format);

  let loading = false;
  async function createHostRequest(e: SubmitEvent) {
    loading = true;
    e.preventDefault();
    try {
      const now = dayjs().unix();
      if (!name) throw new Error("Name required");
      if (dayjs(end).unix() <= now) throw new Error("End date must be in the future");
      const drive = get(drives)[selectedDrive];
      if (!drive) throw new Error("Must select drive");

      const request = new NDKEvent(ndk);
      // TODO: find correct kind
      request.kind = 5902;
      request.content = "";
      request.tags.push(["i", drive.encode(), "text"]);
      request.tags.push(["param", "name", name]);
      request.tags.push(["param", "start", String(dayjs(start, format).unix())]);
      request.tags.push(["param", "end", String(dayjs(end, format).unix())]);

      await request.sign();
      await request.publish();

      open = false;
    } catch (err) {
      if (err instanceof Error) lastError.set(err);
    }
    loading = false;
  }
</script>

<Modal title="Host Drive" bind:open outsideclose size="md">
  {#if loading}
    <Spinner />
  {:else}
    <form class="flex flex-col gap-2" on:submit={createHostRequest}>
      <div>
        <label for="drive">Drive</label>
        <Select id="drive" name="drive" placeholder="Select Drive..." bind:value={selectedDrive} required>
          {#each Object.entries($drives) as [id, drive]}
            <option value={id}>{getDriveName(drive)}</option>
          {/each}
        </Select>
      </div>

      <div>
        <label for="name">Name</label>
        <Input type="text" required bind:value={name} pattern="^[a-zA-Z0-9\-]+$" />
      </div>

      <div class="flex gap-2">
        <div class="flex-1">
          <label for="start">Start</label>
          <Input type="date" required bind:value={start} />
        </div>

        <div class="flex-1">
          <label for="end">End</label>
          <Input type="date" required bind:value={end} />
        </div>
      </div>

      <div class="flex flex-row-reverse gap-2">
        <Button type="submit">Get Quotes</Button>
        <Button color="alternative" on:click={() => (open = false)}>Cancel</Button>
      </div>
    </form>
  {/if}
</Modal>
