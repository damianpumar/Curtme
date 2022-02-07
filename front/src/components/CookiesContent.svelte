<script lang="ts">
  import { toast } from "@zerodevx/svelte-toast";
  import { link } from "svelte-spa-router";
  import { gaLoad } from "../utils/ga";

  export let toastId;

  const closeToast = (accepted: Boolean) => {
    toast.pop(toastId);
    localStorage.setItem(
      "cookies",
      JSON.stringify({
        accepted,
      })
    );
  };

  const accepted = () => {
    closeToast(true);

    gaLoad();
  };

  const declined = () => closeToast(false);
</script>

<div>
  <div>
    <p>Curtme Cookies</p>
  </div>
  This website uses its own and third-party cookies to obtain statistics on the user's
  browsing habits, improve their experience and allow them to share content on social
  networks. You can find all the information in our
  <a href="/cookies-policy" use:link> Cookies Policy. </a>
  <p />
  <div>
    <button class="red" on:click={declined}>DECLINE</button>
    <button class="green" on:click={accepted}>ACCEPT</button>
  </div>
</div>

<style>
  .green {
    background-color: green;
  }
  .red {
    background-color: red;
  }
</style>
