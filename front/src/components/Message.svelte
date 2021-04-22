<script lang="ts">
  import { fade } from "svelte/transition";

  export let message: string = null;

  $: if (message) {
    setTimeout(() => {
      message = null;
    }, 1500);
  }
</script>

{#if message}
  <div>
    <span transition:fade>{message}</span>
  </div>
{/if}

<style>
  div {
    height: 30px;
    margin-left: 10px;
    margin-bottom: 10px;
  }
</style>
