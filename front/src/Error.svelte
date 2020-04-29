<script>
  import { fade } from "svelte/transition";

  export let error;

  $: if (error) {
    setTimeout(() => {
      error = null;
    }, 1500);
  }
</script>

{#if error}
  <span transition:fade>{error}</span>
{/if}
