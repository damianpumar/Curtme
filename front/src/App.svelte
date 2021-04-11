<script>
  import Router from "svelte-spa-router";
  import Home from "./pages/Home.svelte";
  import LinkDetail from "./pages/LinkDetail.svelte";
  import Unlock from "./pages/Unlock.svelte";

  const routes = {
    "/": Home,

    "/link/:id": LinkDetail,

    "/unlock/:shortURL": Unlock,
  };
</script>

<Router {routes} />
