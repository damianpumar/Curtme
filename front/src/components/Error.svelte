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
    margin-left: 10px;
    margin-bottom: 5px;
  }
</style>

{#if error}
  <div>
    <span transition:fade>{error}</span>
  </div>
{/if}
