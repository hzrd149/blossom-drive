<script lang="ts">
  import { Alert, Button, Input, Label } from "flowbite-svelte";
  import type { EncryptedDrive } from "../blossom-drive-client/EncryptedDrive";

  export let drive: EncryptedDrive;

  let password = "";
  let error: Error | null = null;

  async function unlock() {
    try {
      await drive.unlock(password);
    } catch (err) {
      if (err instanceof Error) error = err;
      console.log("Failed to decrypt");
      console.log(err);
    }
  }
</script>

<div class="flex flex-1 items-center justify-center">
  <form
    class="flex min-w-96 flex-col gap-2 rounded-lg border-2 border-gray-200 p-4 dark:border-gray-800"
    on:submit|preventDefault={unlock}
  >
    <h2 class="text-lg font-bold">Decrypt Drive</h2>
    <div>
      <Label for="password" class="mb-2">Password</Label>
      <Input type="password" id="password" required bind:value={password} />
    </div>

    {#if error}
      <Alert>Failed to decrypt, probably wrong password</Alert>
    {/if}

    <Button type="submit" class="mt-4">Decrypt</Button>
  </form>
</div>
