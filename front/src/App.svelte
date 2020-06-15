<script>
  import Router from "svelte-spa-router";
  import Home from "./Home.svelte";
  import LinkDetail from "./LinkDetail.svelte";
  const routes = {
    "/": Home,

    "/link/:id": LinkDetail
  };
</script>

<Router {routes} />
