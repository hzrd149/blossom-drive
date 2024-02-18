<script lang="ts">
  import { Card } from "flowbite-svelte";
</script>

<Card {...$$props}>
  <h5 class="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
    <slot name="title" />
  </h5>
  <p class="font-normal leading-tight text-gray-700 dark:text-gray-400">
    <slot name="description" />
  </p>
</Card>
