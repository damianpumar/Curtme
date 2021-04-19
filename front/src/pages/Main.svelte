<script lang="ts">
  import Router from "svelte-spa-router";
  import Home from "./Home.svelte";
  import LinkDetail from "./LinkDetail.svelte";
  import Unlock from "./Unlock.svelte";

  import Cloud from "../components/Cloud.svelte";
  import Header from "../components/Header.svelte";
  import Footer from "../components/Footer.svelte";

  const routes = {
    "/": Home,

    "/link/:id": LinkDetail,

    "/unlock/:shortURL": Unlock,
  };
</script>

<Cloud />

<Header />

<Router {routes} restoreScrollState={true} />

<Footer />
