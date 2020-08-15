<script>
  import { onMount } from "svelte";
  import { push } from "svelte-spa-router";
  import Cloud from "../components/Cloud.svelte";
  import Header from "../components/Header.svelte";
  import Footer from "../components/Footer.svelte";
  import Link from "../components/Link.svelte";
  import LinkStats from "../components/LinkStats.svelte";

  import { getLinks } from "../utils/api";

  export let params = {};

  let link = null;

  onMount(async () => {
    window.scrollTo(0, 0);

    link = await getLink(params.id);
  });

  async function getLink(id) {
    const response = await getLinks([{ id: id }]);

    if (response.ok) {
      const data = await response.json();
      return data[0];
    }
  }
</script>

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

<div>

  <Cloud />

  <Header />

  <div class="link">
    <div class="col-12 col-12-mobilep">
      <button on:click={() => push('/')}>Back</button>
    </div>
    <Link {link} />
    <LinkStats linkId={params.id} />

  </div>

  <Footer />

</div>
