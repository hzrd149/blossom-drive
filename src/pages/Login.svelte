<script lang="ts">
  import { push, params } from "svelte-spa-router";
  import LoginPage from "../components/LoginPage.svelte";
  import { activeUser } from "../services/ndk";

  $: {
    if ($activeUser) push($params?.next || "/");
  }
</script>

<LoginPage />
