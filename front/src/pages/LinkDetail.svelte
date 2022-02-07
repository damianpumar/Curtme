<script lang="ts">
  import { onMount } from "svelte";
  import LinkStats from "../features/LinkStats.svelte";
  import LinkCard from "../features/link-card/LinkCard.svelte";
  import { ERROR } from "../utils/resources";
  import { getLinkDetail, getLinks } from "../services/api-service";
  import { initialized } from "../services/auth0/auth0.store";
  import type { LinkDetailModel, LinkModel } from "../model/link-model";
  import { useMessage } from "../utils/use-event";
  import { push } from "svelte-spa-router";
  import { RouteConfig } from "../utils/routeConfig";
  import BackButton from "../components/BackButton.svelte";

  interface Params {
    id: string;
  }

  export let params: Params = null;

  let link: LinkModel = null;
  let details: LinkDetailModel[];

  let mounted: boolean = false;
  $: if ($initialized && mounted) {
    loadLink(params.id);
    loadLinkDetail(params.id);
  }

  const dispatchMessage = useMessage();

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
      dispatchMessage(ERROR(data.error));
    }
  };

  const goBack = () => {
    push(RouteConfig.HOME_PATH);
  };
</script>

<div class="link">
  <BackButton />
  <LinkCard {link} on:delete={goBack} />
  <LinkStats {details} />
</div>

<style>
  .link {
    margin-top: 10%;
  }
</style>
