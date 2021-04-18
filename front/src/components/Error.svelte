<script lang="ts">
  import { fade } from "svelte/transition";

  export let error: string = null;

  $: if (error) {
    setTimeout(() => {
      error = null;
    }, 1500);
  }
</script>

{#if error}
  <div>
    <span transition:fade>{error}</span>
  </div>
{/if}

<style>
  div {
    height: 30px;
    margin-left: 10px;
    margin-bottom: 10px;
  }
</style>
