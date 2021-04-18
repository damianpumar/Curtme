<script lang="ts">
  import { create_in_transition, tick } from "svelte/internal";
  import type { LinkModel } from "../model/link-model";
  import { copy } from "../utils/clipboard";
  import { isEnterKeyDown } from "../utils/keyboard";
  import { VISIT_LINK } from "../utils/config";
  import { customizeLink } from "../services/api-service";
  import { scale } from "svelte/transition";
  import { INTERNET_CONNECTION, LINK_CUSTOMIZED } from "../utils/resources";
  import { errorMessageLinkShortener } from "./error.store";

  export let link: LinkModel = null;

  let shortURLInput: HTMLElement = null;
  let isEditingShortURL: boolean = false;
  let currentEditingShortURL: string = null;
  let linkSectionContainer = null;
  let animationLink: any;

  $: isLinkEdited = link && link.shortURL === currentEditingShortURL;

  function copyClipboard() {
    copy(link);

    if (!animationLink) {
      animationLink = create_in_transition(linkSectionContainer, scale, {
        start: 0.5,
      });
    }
    animationLink.start();
  }

  const customizeShortURL = async () => {
    currentEditingShortURL = link.shortURL;
    isEditingShortURL = true;
    await tick();
    shortURLInput.focus();
  };

  function closeEditable() {
    isEditingShortURL = false;
    if (currentEditingShortURL) {
      link.shortURL = currentEditingShortURL;
    }

    currentEditingShortURL = null;
  }

  const saveUpdatedLink = async () => {
    try {
      const response = await customizeLink(link);
      if (response.ok) {
        closeEditable();
        errorMessageLinkShortener.set(LINK_CUSTOMIZED);
        link = await response.json();
      } else {
        const data = await response.json();
        errorMessageLinkShortener.set(data.error);
      }
    } catch (error) {
      errorMessageLinkShortener.set(INTERNET_CONNECTION);
    }
  };
</script>

<p class="short-link" bind:this={linkSectionContainer}>
  {#if isEditingShortURL}
    <input
      type="text"
      bind:value={link.shortURL}
      bind:this={shortURLInput}
      on:keydown={(event) => isEnterKeyDown(event) && saveUpdatedLink()}
    />
  {:else}
    <a href={VISIT_LINK(link.shortURL)} class="short_url" target="blank">
      {VISIT_LINK(link.shortURL)}
    </a>
  {/if}
</p>
{#if isEditingShortURL}
  <button
    class="icon"
    on:click={saveUpdatedLink}
    disabled={isLinkEdited}
    alt="Save"
  >
    <i class="fa fa-save" />
  </button>
  <button class="icon" on:click={closeEditable} alt="Cancel">
    <i class="fa fa-times-circle" /></button
  >
{:else}
  <button class="icon" on:click={customizeShortURL} alt="Edit">
    <i class="fa fa-edit" />
  </button>
  <button class="icon" on:click={copyClipboard} alt="Copy">
    <i class="fa fa-copy" />
  </button>
{/if}

<style>
  button {
    background-color: transparent;
    box-shadow: unset !important;
    color: #e89980;
    padding-left: 15px !important;
  }

  button:disabled {
    color: lightgray;
    pointer-events: none;
  }

  button:hover {
    color: #ff6232;
  }

  p {
    font-size: 1em !important;
    color: black;
    margin-bottom: 0 !important;
    margin-left: 10px;
    text-align: left;
  }

  .short-link {
    color: gray;
    min-width: 14em;
    margin-top: 20px !important;
    margin-right: 5px !important;
  }
</style>
