<script lang="ts">
  import { replace, params } from "svelte-spa-router";
  import LoginPage from "../components/LoginPage.svelte";
  import { activeUser } from "../services/ndk";

  $: {
    if ($activeUser) replace($params?.next || "/");
  }
</script>

<LoginPage />
