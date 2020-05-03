<script>
  import { onMount } from "svelte";
  import { validURL } from "./utils/url";
  import { createLink, getInfo } from "./utils/api";
  import {
    INTERNET_CONNECTION,
    URL_INVALID,
    URL_MANDATORY
  } from "./utils/messages.js";
  import { isAuthenticated, authToken } from "./auth0/auth0.store";

  import Error from "./Error.svelte";
  import Link from "./Link.svelte";

  const STORAGE_KEY = "links";
  const LONG_URL_INPUT_ID = "longURL";

  let longURL = null;
  let errorMessage = null;
  let links = [];

  async function loadLinksWithoutUser() {
    const linksStored = localStorage.getItem(STORAGE_KEY);

    if (linksStored) {
      const linkStoredParsed = JSON.parse(linksStored);

      for (let index = 0; index < linkStoredParsed.length; index++) {
        let link = linkStoredParsed[index];

        try {
          const response = await getInfo(link);

          if (response.ok) {
            link = await response.json();
          }

          links = [...links, link];
        } catch (exception) {
          continue;
        }
      }

      localStorage.setItem(STORAGE_KEY, JSON.stringify(links));
    }
  }

  async function loadLinkWithUser() {}

  async function syncLinkWithoutUser() {}

  onMount(async () => {
    document.getElementById(LONG_URL_INPUT_ID).focus();

    if ($isAuthenticated) {
      await syncLinkWithoutUser();
      await loadLinkWithUser();
    } else {
      await loadLinksWithoutUser();
    }
  });

  function addLink(link) {
    links = [link, ...links];

    if (!$isAuthenticated) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(links));
    }
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

    try {
      const response = await createLink(longURL);

      if (response.ok) {
        const link = await response.json();

        longURL = null;

        addLink(link);
      } else {
        errorMessage = URL_INVALID;
      }
    } catch (exception) {
      errorMessage = INTERNET_CONNECTION;
    }
  }
</script>

<style>
  section {
    color: #fff;
    padding: 12em 0 1em 0;
    text-align: center;
  }

  section :last-child {
    margin-bottom: 10px;
  }

  h2 {
    color: #fff;
  }

  section h2 {
    font-size: 3.5em;
    line-height: 1em;
    margin: 0 0 0.5em 0;
    padding: 0;
  }

  section p {
    font-size: 1.25em;
    margin-bottom: 1.75em;
  }

  section button {
    background-color: transparent;
    box-shadow: inset 0 0 0 2px rgba(255, 255, 255, 0.5);
    color: #fff;
    min-width: 12em;
  }

  section button:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }

  section button:active {
    background-color: rgba(255, 255, 255, 0.2);
  }

  @media screen and (max-width: 1280px) {
    section {
      background-attachment: scroll;
    }

    section h2 {
      font-size: 3.5em;
    }
  }

  @media screen and (max-width: 736px) {
    section {
      padding: 4em 0;
    }

    section h2 {
      font-size: 2.25em;
    }

    section p {
      font-size: 1.25em;
    }
  }

  @media screen and (max-width: 480px) {
    section {
      padding: 5em 1em 0 1em;
    }
  }
</style>

<section class="container medium">
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
        on:keydown={event => event.key === 'Enter' && createShortURL()} />
    </div>
    <Error bind:error={errorMessage} />
  </div>
  <div class="row">
    <div class="col-12 col-12-mobilep">
      <button on:click={createShortURL}>Short</button>
    </div>
  </div>
</section>

{#each links as link}
  <Link {link} />
{/each}
