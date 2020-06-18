<script>
  import { onMount } from "svelte";
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
</style>

<div>

  <Cloud />

  <Header />

  <div class="link">

    <Link {link} />
    <LinkStats {link} />

  </div>

  <Footer />

</div>
