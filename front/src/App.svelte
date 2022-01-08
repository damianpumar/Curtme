<script>
  import Main from "./pages/Main.svelte";
  import { SvelteToast } from "@zerodevx/svelte-toast";
</script>

<Main />
<div class="toaster-wrap">
  <SvelteToast />
</div>

<style>
  .toaster-wrap {
    --toastContainerTop: 3em;
  }
</style>
