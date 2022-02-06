<script>
  import Main from "./pages/Main.svelte";
  import Cookies from "./components/Cookies.svelte";
  import { onMount } from "svelte";
  import { SvelteToast, toast } from "@zerodevx/svelte-toast";
  import { gaLoad } from "./utils/ga";

  onMount(() => {
    const cookies = JSON.parse(localStorage.getItem("cookies"));
    if (!cookies) {
      toast.push({
        id: "cookies-toast",
        target: "cookies-toast",
        component: {
          src: Cookies,
        },
        dismissable: false,
      });

      return;
    }

    if (cookies.accepted) gaLoad();
  });
</script>

<Main />

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
      --toastContainerTop: 20vh;
      --toastContainerRight: 0.5em;
      --toastWidth: 100%;
    }
  }
</style>
