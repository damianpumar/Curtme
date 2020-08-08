<script>
  import { onMount } from "svelte";
  import { scale } from "svelte/transition";

  export let link;
</script>

<style>
  .detail {
    background-color: white;
    border-radius: 5px;
    height: 900px;
    margin-top: 1em;
    border: solid 1px lightgray;
    -webkit-box-shadow: 0px 0px 20px -5px rgba(214, 214, 214, 1);
    -moz-box-shadow: 0px 0px 20px -5px rgba(214, 214, 214, 1);
    box-shadow: 0px 0px 20px -5px rgba(214, 214, 214, 1);
  }
</style>

{#if link}
  <section
    class="col-12 col-12-mobilep container medium"
    transition:scale={{ start: 0.5 }}>
    <div class="detail" />
  </section>
{/if}
