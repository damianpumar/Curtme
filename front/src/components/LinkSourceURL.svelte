<script lang="ts">
  import { tick } from "svelte";
  import { isEnterKeyDown } from "../utils/keyboard";
  import type { LinkModel } from "../model/link-model";
  import { customizeLink } from "../services/api-service";
  import {
    INTERNET_CONNECTION,
    LINK_CUSTOMIZED,
    URL_INVALID,
  } from "../utils/resources";
  import { validURL } from "../utils/url";
  import { errorMessageLinkShortener } from "./error.store";

  export let link: LinkModel = null;
  let sourceURLInput: HTMLElement = null;
  let isEditingSourceURL = false;
  let currentEditingSourceURL;

  $: isLinkEdited = link && link.sourceURL === currentEditingSourceURL;

  const saveUpdatedLink = async () => {
    if (!validURL(link.sourceURL)) {
      errorMessageLinkShortener.set(URL_INVALID);
      return;
    }

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

  function closeEditable() {
    isEditingSourceURL = false;
    if (currentEditingSourceURL) {
      link.sourceURL = currentEditingSourceURL;
    }

    currentEditingSourceURL = null;
  }

  const customizeSourceURL = async () => {
    currentEditingSourceURL = link.sourceURL;
    isEditingSourceURL = true;
    await tick();
    sourceURLInput.focus();
  };
</script>

<p class="long-link truncate">
  {#if isEditingSourceURL}
    <input
      type="text"
      bind:value={link.sourceURL}
      bind:this={sourceURLInput}
      on:keydown={(event) => isEnterKeyDown(event) && saveUpdatedLink()}
    />
  {:else}
    <a href={link.sourceURL} target="blank">
      {link.sourceURL}
    </a>
  {/if}

  {#if isEditingSourceURL}
    <button
      class="icon"
      on:click={saveUpdatedLink}
      disabled={isLinkEdited}
      alt="Save"
    >
      <i class="fa fa-save" />
    </button>
    <button class="icon" on:click={closeEditable} alt="Cancel">
      <i class="fa fa-times-circle" />
    </button>
  {:else}
    <button class="icon" on:click={customizeSourceURL} alt="Edit"
      ><i class="fa fa-edit" /></button
    >
  {/if}
</p>

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

  .truncate {
    margin-right: 5px;
    width: auto;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .long-link {
    text-align: left;
    color: gray;
    margin-top: -10px;
  }
</style>
