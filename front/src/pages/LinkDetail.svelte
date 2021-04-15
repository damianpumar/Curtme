<script lang="ts">
  import { onMount } from "svelte";
  import { push } from "svelte-spa-router";
  import Link from "../components/Link.svelte";
  import LinkStats from "../components/LinkStats.svelte";
  import { BACK } from "../utils/resources";
  import { RouteConfig } from "../utils/routeConfig";
  import { getLinks } from "../services/api-service";

  interface Params {
    id: string;
  }

  export let params: Params = null;

  let link = null;

  onMount(async () => {
    link = await getLink(params.id);
  });

  async function getLink(id: string) {
    const response = await getLinks([id]);

    if (response.ok) {
      const data = await response.json();
      return data[0];
    }
  }

  async function goBack() {
    push(RouteConfig.HOME_PATH);
  }
</script>

<div class:link>
  <div class="col-12 col-12-mobilep">
    <button on:click={goBack}>{BACK}</button>
  </div>
  <Link {link} on:delete={goBack} />
  <LinkStats linkId={params.id} />
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
