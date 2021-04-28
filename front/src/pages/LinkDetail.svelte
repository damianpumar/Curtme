<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import { push } from "svelte-spa-router";
  import LinkStats from "../features/LinkStats.svelte";
  import LinkCard from "../features/link-card/LinkCard.svelte";
  import { BACK } from "../utils/resources";
  import { RouteConfig } from "../utils/routeConfig";
  import { getLinkDetail, getLinks } from "../services/api-service";
  import { initialized } from "../services/auth0/auth0.store";
  import type { LinkDetailModel, LinkModel } from "../model/link-model";

  interface Params {
    id: string;
  }

  export let params: Params = null;

  let link: LinkModel = null;
  let details: LinkDetailModel[];
  let message: string;

  let mounted: boolean = false;
  $: if ($initialized && mounted) {
    loadLink(params.id);
    loadLinkDetail(params.id);
  }

  onMount(() => {
    mounted = true;
  });

  const loadLink = async (id: string) => {
    const response = await getLinks([id]);

    if (response.ok) {
      const data = await response.json();
      link = data[0];
    }
  };

  const loadLinkDetail = async (id: string) => {
    const response = await getLinkDetail(id);

    const data = await response.json();

    if (response.ok) {
      details = data;
    } else {
      message = data.error;
    }
  };

  const goBack = () => {
    push(RouteConfig.HOME_PATH);
  };
</script>

<div class:link>
  <div class="col-12 col-12-mobilep">
    <button on:click={goBack}>{BACK}</button>
  </div>
  <LinkCard {link} on:delete={goBack} />
  <LinkStats {details} {message} />
</div>

<style>
  .link {
    margin-top: 10%;
  }

  button {
    background-color: transparent;
    box-shadow: inset 0 0 0 2px rgba(255, 255, 255, 0.5);
    color: #fff;
    width: 6em;
    margin-left: calc(4%);
  }
</style>
