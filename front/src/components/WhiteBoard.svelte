<script>
  import { onDestroy, onMount } from "svelte";
  import { useCookies } from "../utils/use-cookies";
  import BackButton from "./BackButton.svelte";

  const cookies = useCookies();

  onMount(() => {
    cookies.hide();
  });

  onDestroy(() => {
    cookies.load();
  });
</script>

<div class="link">
  <BackButton />
  <div class="white-board">
    <slot />
  </div>
</div>

<style>
  .link {
    margin-top: 10%;
  }
  .white-board {
    border-radius: 0.2em;
    padding: 1em;
    background-color: white;
    margin: auto;
    margin-top: 2em;
    width: 60vw;
  }

  @media screen and (max-width: 480px) {
    .white-board {
      width: 90vw;
    }
  }
</style>
