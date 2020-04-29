<script>
  import { fade } from "svelte/transition";

  export let error;

  $: if (error) {
    setTimeout(() => {
      error = null;
    }, 1500);
  }
</script>

<style>
  div {
    height: 20px;
  }
</style>

<div>
  {#if error}
    <span transition:fade>{error}</span>
  {/if}
</div>
