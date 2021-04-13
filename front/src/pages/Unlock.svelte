<script lang="ts">
  import { onMount } from "svelte";
  import Error from "../components/Error.svelte";
  import { VISIT_LINK } from "../utils/config";
  import { getUnlockLink, unlockLink } from "../utils/api";
  import { isEnterKeyDown } from "../utils/keyboard";
  import { PASSWORD_TO_UNLOCK, UNLOCK } from "../utils/resources";
  import type { LinkModel } from "../model/link-model";

  interface Params {
    shortURL: string;
  }

  export let params: Params = null;
  let link: LinkModel = null;
  let passwordLink = null;
  let errorMessage = null;

  onMount(async () => {
    window.scrollTo(0, 0);

    link = await getLink(params.shortURL);
  });

  const getLink = async (shortURL: string) => {
    const response = await getUnlockLink(shortURL);

    if (response.ok) {
      return await response.json();
    }
  };

  const sendPassword = async () => {
    if (!passwordLink) {
      errorMessage = PASSWORD_TO_UNLOCK;
      return;
    }

    const response = await unlockLink(link.shortURL, passwordLink);

    if (response.ok) {
      const data = await response.json();
      window.close();
      window.open(data.sourceURL);
    } else {
      const data = await response.json();
      errorMessage = data.error;
    }
  };
</script>

<section class="container medium">
  {#if link}
    <p>{VISIT_LINK(link.shortURL)}</p>
    <p>{link.title}</p>
  {/if}
  <div class="row">
    <div class="col-12 col-12-mobilep">
      <input
        type="text"
        autocomplete="false"
        bind:value={passwordLink}
        placeholder={PASSWORD_TO_UNLOCK}
        on:keydown={(event) => isEnterKeyDown(event) && sendPassword()}
        disabled={!link}
      />
    </div>
    <Error bind:error={errorMessage} />
  </div>
  <div class="row">
    <div class="col-12 col-12-mobilep">
      <button on:click={sendPassword} disabled={!link}>{UNLOCK}</button>
    </div>
  </div>
</section>

<style>
  section {
    color: #fff;
    padding: 12em 0 1em 0;
    text-align: center;
  }

  section :last-child {
    margin-bottom: 10px;
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

  section input:disabled,
  section button:disabled {
    opacity: 0.3;
  }

  @media screen and (max-width: 1280px) {
    section {
      background-attachment: scroll;
    }
  }

  @media screen and (max-width: 736px) {
    section {
      padding: 4em 0;
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
