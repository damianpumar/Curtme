<script lang="ts">
  import Router from "svelte-spa-router";
  import Home from "./Home.svelte";
  import LinkDetail from "./LinkDetail.svelte";
  import Unlock from "./Unlock.svelte";

  import Cloud from "../components/Cloud.svelte";
  import Header from "../components/Header.svelte";
  import Footer from "../components/Footer.svelte";
  import NotificationToaster from "../components/NotificationToaster.svelte";
  import CookiesPolicy from "./CookiesPolicy.svelte";
  import TermsOfService from "./TermsOfService.svelte";
  import NotificationCookiesToaster from "../components/NotificationCookiesToaster.svelte";

  const routes = {
    "/": Home,

    "/link/:id": LinkDetail,

    "/unlock/:shortURL": Unlock,

    "/cookies-policy": CookiesPolicy,

    "/terms-of-service": TermsOfService,
  };
</script>

<NotificationToaster />
<NotificationCookiesToaster />

<Cloud />

<Header />

<Router {routes} restoreScrollState={true} />

<Footer />
