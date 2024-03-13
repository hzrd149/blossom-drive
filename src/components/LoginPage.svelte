<script lang="ts">
  import { Alert, Button, Checkbox } from "flowbite-svelte";
  import { InfoCircleSolid } from "flowbite-svelte-icons";
  import { loginWithExtension } from "../services/ndk";

  let remember = localStorage.getItem("auto-login") === "true";

  $: {
    localStorage.setItem("auto-login", remember ? "true" : "false");
  }
</script>

<div class="flex flex-1 flex-col items-center gap-4">
  <h1 class="text-4xl" style="margin-bottom: 20vh; margin-top: 10vh;">🌸 Blossom Drive</h1>
  <Alert color="red">
    <InfoCircleSolid slot="icon" class="h-4 w-4" />
    <span class="font-medium">Warning!</span>
    Everything on blossom is public, don't upload private files
  </Alert>

  <Button size="xl" on:click={loginWithExtension}>Login with nostr</Button>
  <Checkbox bind:checked={remember}>Stay logged in</Checkbox>
</div>
