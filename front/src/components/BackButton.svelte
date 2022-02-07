<script>
  import { RouteConfig } from "../utils/routeConfig";
  import { push } from "svelte-spa-router";
  import { BACK } from "../utils/resources";
  const goBack = () => {
    push(RouteConfig.HOME_PATH);
  };
</script>

<div class="col-12 col-12-mobilep">
  <button on:click={goBack}>{BACK}</button>
</div>

<style>
  button {
    background-color: transparent;
    box-shadow: inset 0 0 0 2px rgba(255, 255, 255, 0.5);
    color: #fff;
    width: 6em;
    margin-left: calc(4%);
  }
</style>
