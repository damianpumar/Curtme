<script lang="ts">
  import { link as routeLink } from "svelte-spa-router";
  import { scale } from "svelte/transition";

  import { getDateParsed } from "../utils/date";
  import { CLICK, CLICKS } from "../utils/resources.js";
  import { RouteConfig } from "../utils/routeConfig";
  import Error from "./Error.svelte";
  import type { LinkModel } from "../model/link-model";
  import LinkDelete from "./LinkDelete.svelte";
  import LinkLock from "./LinkLock.svelte";
  import LinkSourceURL from "./LinkSourceURL.svelte";
  import LinkShortURL from "./LinkShortURL.svelte";

  export let link: LinkModel;
  let errorMessage: string = null;

  const handleError = (event) => {
    errorMessage = event.detail.message;
  };
</script>

{#if link}
  <section
    class="col-12 col-12-mobilep container medium"
    transition:scale={{ start: 0.5 }}
  >
    <div class="result">
      <p class="date-link">{getDateParsed(link)}</p>
      <p class="title-link">
        {link.title}
        <LinkDelete {link} on:error={handleError} />
        <LinkLock {link} on:error={handleError} />
      </p>
      <div>
        <LinkSourceURL {link} on:error={handleError} />
      </div>

      <div class="row">
        <LinkShortURL {link} on:error={handleError} />
        <div class="visited-link">
          <a href={`${RouteConfig.LINK_PATH}${link.id}`} use:routeLink>
            <span>{link.visited} {link.visited === 1 ? CLICK : CLICKS}</span>
          </a>
        </div>
      </div>
      <Error bind:error={errorMessage} />
    </div>
  </section>
{/if}

<style>
  .result {
    background-color: white;
    border-radius: 5px;
    border: solid 1px lightgray;
    margin-top: 2em;
    -webkit-box-shadow: 0px 0px 20px -5px rgba(214, 214, 214, 1);
    -moz-box-shadow: 0px 0px 20px -5px rgba(214, 214, 214, 1);
    box-shadow: 0px 0px 20px -5px rgba(214, 214, 214, 1);
  }

  .result:hover {
    -webkit-box-shadow: -4px 3px 29px -8px rgba(179, 179, 179, 1);
    -moz-box-shadow: -4px 3px 29px -8px rgba(179, 179, 179, 1);
    box-shadow: -4px 3px 29px -8px rgba(179, 179, 179, 1);
  }

  .result p {
    font-size: 1em !important;
    color: black;
    margin-bottom: 0 !important;
    margin-left: 10px;
    text-align: left;
  }

  .date-link {
    float: right;
    margin-top: 5px !important;
    margin-right: 5px !important;
    text-align: center !important;
    border: solid 1px black;
    min-width: 15%;
    width: auto;
    padding-left: 2px;
    padding-right: 2px;
    border-radius: 3px;
  }

  .visited-link {
    margin-right: 10px !important;
    margin-left: auto;
  }

  .title-link {
    font-weight: bold;
  }

  input[type="text"] {
    height: unset !important;
    line-height: normal !important;
    margin-right: 5px;
    width: 80%;
  }

  @media screen and (max-width: 480px) {
    section {
      padding: 0 1em 0 1em;
    }
  }
</style>
