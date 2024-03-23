<script lang="ts">
  import { Alert, Button, Checkbox, Helper, Input, Label, Spinner } from "flowbite-svelte";
  import { loginWithExtension, loginWithNostrAddress, loginWithPrivateKey } from "../services/ndk";

  let loading = false;
  let remember = localStorage.getItem("auto-login") === "true";
  let address = "";

  let error: Error;

  async function extension() {
    try {
      loading = true;
      await loginWithExtension();
      if (remember) localStorage.setItem("auto-login", "nip07");
    } catch (e) {
      if (e instanceof Error) error = e;
    }
    loading = false;
  }

  async function login(e: SubmitEvent) {
    e.preventDefault();
    try {
      loading = true;
      if (address.startsWith("ncryptsec") || address.startsWith("nsec")) {
        await loginWithPrivateKey(address);
        if (remember) localStorage.setItem("auto-login", "nsec");
      } else if (address) {
        await loginWithNostrAddress(address);
        if (remember) localStorage.setItem("auto-login", address);
      }
    } catch (e) {
      if (e instanceof Error) error = e;
    }
    loading = false;
  }
</script>

<div class="flex flex-1 flex-col items-center gap-4">
  <h1 class="text-4xl" style="margin-bottom: 10vh; margin-top: 10vh;">🌸 Blossom Drive</h1>

  {#if loading}
    <Spinner />
  {:else}
    <Alert color="red" class="block text-center">
      <p class="text-2xl font-medium">Warning!</p>
      <p class="text-xl">Everything on blossom drive is public.</p>
      <p class="text-xl">DO NOT upload any files you wish to keep private!</p>
    </Alert>

    <Button size="xl" on:click={extension}>Login with extension</Button>
    <p class="text-lg">Or</p>
    <form on:submit={login} class="flex flex-col w-full lg:w-full items-center">
      <Label for="address" class="mb-2">Nostr Address / Bunker URI</Label>
      <div class="flex gap-2 w-full lg:max-w-96">
        <Input type="text" id="address" required bind:value={address} />
        <Button type="submit">Login</Button>
      </div>
      <Helper color="red" class="mt-1">
        <span class="font-medium">Under development!</span>
        Not all nostr address will work
      </Helper>
    </form>
    <Checkbox bind:checked={remember}>Stay logged in</Checkbox>

    {#if error}
      <Alert color="red">Error: {error.message}</Alert>
    {/if}
  {/if}
</div>
