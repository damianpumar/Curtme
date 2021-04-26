<script>
  import { onMount } from "svelte";
  import { gaLoad } from "../utils/ga";
  import { orderedLinks } from "../services/link/link.store";

  import LinkShortener from "../features/link-shortener/LinkShortener.svelte";
  import LinkCard from "../features/link-card/LinkCard.svelte";

  onMount(() => {
    gaLoad();
  });
</script>

<div>
  <LinkShortener />

  {#each $orderedLinks as link (link.id)}
    <LinkCard {link} />
  {/each}
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
