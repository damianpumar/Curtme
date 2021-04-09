<script>
  import { onMount } from "svelte";
  import { gaLoad } from "../utils/ga";
  import Cloud from "../components/Cloud.svelte";
  import Header from "../components/Header.svelte";
  import LinkShortener from "../components/LinkShortener.svelte";
  import Footer from "../components/Footer.svelte";

  onMount(() => {
    window.scrollTo(0, 0);
    gaLoad();
  });
</script>

<div>
  <Cloud />

  <Header />

  <LinkShortener />

  <Footer />
</div>

<style>
  @media screen and (max-width: 840px) {
    div {
      -moz-backface-visibility: hidden;
      -webkit-backface-visibility: hidden;
      -ms-backface-visibility: hidden;
      backface-visibility: hidden;
      -moz-transition: -moz-transform 0.5s ease;
      -webkit-transition: -webkit-transform 0.5s ease;
      -ms-transition: -ms-transform 0.5s ease;
      transition: transform 0.5s ease;
      padding-bottom: 1px;
      padding-top: 0;
    }
  }
</style>
