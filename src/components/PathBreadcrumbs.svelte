<script lang="ts">
  import { Breadcrumb, BreadcrumbItem } from "flowbite-svelte";
  import { location, querystring } from "svelte-spa-router";
  import { parsePath } from "../blossom-drive-client/FileTree/methods";

  export let root: string;

  $: parsed = new URLSearchParams($querystring);
  $: path = parsePath(parsed.get("path") ?? "");
</script>

<Breadcrumb>
  <BreadcrumbItem href={"#" + $location} home>{root}</BreadcrumbItem>
  {#each path as name, i}
    <BreadcrumbItem href={"#" + $location + "?path=/" + [...path.slice(0, i), name].join("/")}>{name}</BreadcrumbItem>
  {/each}
</Breadcrumb>
