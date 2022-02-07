<script>
  import { SvelteToast, toast } from "@zerodevx/svelte-toast";
  import { onMount } from "svelte";
  import { useCookies } from "../utils/use-cookies";

  const cookies = useCookies();

  onMount(() => {
    cookies.load();
  });
</script>

<div class="wrap">
  <SvelteToast
    target="cookies-toast"
    options={{ initial: 0, intro: { y: 1 } }}
  />
</div>

<style>
  .wrap {
    --toastContainerTop: auto;
    --toastContainerRight: auto;
    --toastContainerBottom: 1rem;
    --toastContainerRight: auto;
    --toastContainerLeft: calc(50vw - 20rem);
    --toastWidth: 40rem;
    --toastMinHeight: 2rem;
    --toastPadding: 0 0.5rem;
    font-size: 0.875rem;
  }

  @media screen and (max-width: 480px) {
    .wrap {
      --toastContainerLeft: 0;
      --toastContainerRight: 0.5em;
      --toastWidth: 100%;
    }
  }
</style>
