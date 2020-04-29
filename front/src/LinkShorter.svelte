<script>
  import { onMount } from "svelte";
  import { validURL } from "./utils/url.js";
  import { endpoint } from "./utils/config.js";
  import {
    INTERNET_CONNECTION,
    URL_INVALID,
    URL_MANDATORY
  } from "./utils/messages.js";

  import Error from "./Error.svelte";
  import Link from "./Link.svelte";

  const STORAGE_KEY = "links";
  const LONG_URL_INPUT_ID = "longURL";

  let longURL = null;
  let errorMessage = null;
  let links = [];

  onMount(() => {
    document.getElementById(LONG_URL_INPUT_ID).focus();

    const linksStored = localStorage.getItem(STORAGE_KEY);

    if (linksStored) {
      links = JSON.parse(linksStored);
    }
  });

  function addNewLink(link) {
    links = [link, ...links];

    localStorage.setItem(STORAGE_KEY, JSON.stringify(links));
  }

  async function createShortURL() {
    if (!longURL) {
      errorMessage = URL_MANDATORY;
      return;
    }

    if (!validURL(longURL)) {
      errorMessage = URL_INVALID;
      return;
    }

    const data = {
      url: longURL
    };

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
      });

      if (response.ok) {
        const link = await response.json();

        longURL = null;

        addNewLink(link);
      } else {
        errorMessage = URL_INVALID;
      }
    } catch (exception) {
      errorMessage = INTERNET_CONNECTION;
    }
  }
</script>

<section id="banner" class="container medium">
  <h2>Curtme.org</h2>
  <p>Free open source and unlimited link shorter</p>
  <div class="row">
    <div class="col-12 col-12-mobilep">
      <input
        id="longURL"
        type="text"
        autocomplete="false"
        bind:value={longURL}
        placeholder="Paste long url and shorten it"
        on:keypress={e => (e.keyCode == 13 ? createShortURL() : null)} />
    </div>
    <Error bind:error={errorMessage} />
  </div>
  <div class="row">
    <div class="col-12 col-12-mobilep">
      <button class="button" on:click={createShortURL}>Short</button>
    </div>
  </div>
</section>

{#each links as link}
  <Link {link} />
{/each}
