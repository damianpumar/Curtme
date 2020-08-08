<script>
  import Router from "svelte-spa-router";
  import Home from "./pages/Home.svelte";
  import LinkDetail from "./pages/LinkDetail.svelte";
  const routes = {
    "/": Home,

    "/link/:id": LinkDetail
  };
</script>

<Router {routes} />
