<script lang="ts">
  import { tick } from "svelte";
  import { link as routeLink } from "svelte-spa-router";
  import { scale } from "svelte/transition";
  import { create_in_transition } from "svelte/internal";
  import { VISIT_LINK } from "../utils/config";
  import { customizeLink, remove, lockLink } from "../services/api-service";
  import { getDateParsed, useTimer } from "../utils/date";
  import {
    INTERNET_CONNECTION,
    LINK_CUSTOMIZED,
    CLICK,
    CLICKS,
    URL_INVALID,
    SET_PASSWORD_PLACEHOLDER,
  } from "../utils/resources.js";
  import { validURL } from "../utils/url";
  import { copy } from "../utils/clipboard";
  import { isEnterKeyDown } from "../utils/keyboard";
  import { RouteConfig } from "../utils/routeConfig";
  import Error from "./Error.svelte";
  import type { LinkModel } from "../model/link-model";
  import { removeStoredLink } from "../services/link/link.store";

  const { startTimer, cancelTimer, currentTimer } = useTimer(5);

  export let link: LinkModel;
  let linkSectionContainer;
  let animationLink;
  let message;
  let editLinkInput;

  let isEditingShortURL = false;
  let isEditingSourceURL = false;
  let currentEditingShortURL;
  let currentEditingSourceURL;

  $: isLinkEdited =
    link &&
    (link.shortURL === currentEditingShortURL ||
      link.sourceURL === currentEditingSourceURL);

  function copyClipboard() {
    copy(link);

    if (!animationLink) {
      animationLink = create_in_transition(linkSectionContainer, scale, {
        start: 0.5,
      });
    }
    animationLink.start();
  }

  const customizeSourceURL = async () => {
    currentEditingSourceURL = link.sourceURL;
    isEditingSourceURL = true;
    isEditingShortURL = false;
    await tick();
    editLinkInput.focus();
  };

  const customizeShortURL = async () => {
    currentEditingShortURL = link.shortURL;
    isEditingShortURL = true;
    isEditingSourceURL = false;
    await tick();
    editLinkInput.focus();
  };

  function closeEditable() {
    isEditingShortURL = false;
    isEditingSourceURL = false;
    if (currentEditingSourceURL) {
      link.sourceURL = currentEditingSourceURL;
    }
    if (currentEditingShortURL) {
      link.shortURL = currentEditingShortURL;
    }

    currentEditingSourceURL = null;
    currentEditingShortURL = null;
  }

  let isDeleting = false;
  const removeLink = async () => {
    isDeleting = true;
    startTimer(confirmDeleteLink);
  };

  const cancelRemoveLink = async () => {
    isDeleting = false;
    cancelTimer();
  };

  const confirmDeleteLink = async () => {
    try {
      const response = await remove(link);

      if (response.ok) {
        removeStoredLink(link);
      } else {
        const data = await response.json();
        message = data.error;
      }
    } catch (error) {
      cancelRemoveLink();
      message = INTERNET_CONNECTION;
    }
  };

  const saveUpdatedLink = async () => {
    if (!validURL(link.sourceURL)) {
      message = URL_INVALID;
      return;
    }

    try {
      const response = await customizeLink(link);
      if (response.ok) {
        closeEditable();
        message = LINK_CUSTOMIZED;
        link = await response.json();
      } else {
        const data = await response.json();
        message = data.error;
      }
    } catch (error) {
      message = INTERNET_CONNECTION;
    }
  };

  let newPassword: string = null;
  let isCustomizePassword = false;
  const setNewPassword = async () => {
    cancelRemoveLink();
    newPassword = null;
    isCustomizePassword = true;
    await tick();
    editLinkInput.focus();
  };

  const saveNewPassword = async () => {
    try {
      const response = await lockLink(link.id, newPassword);
      if (response.ok) {
        cleanUpPasswordVariables();
        message = LINK_CUSTOMIZED;
        link = await response.json();
      } else {
        const data = await response.json();
        message = data.error;
      }
    } catch (error) {
      console.log(error);
      message = INTERNET_CONNECTION;
    }
  };

  const cleanUpPasswordVariables = () => {
    isCustomizePassword = false;
    newPassword = null;
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
        {#if !isDeleting}
          <button class="icon" on:click={removeLink} alt="Delete">
            <i class="fa fa-trash" />
          </button>
        {:else}
          <span class="deleting">{`Deleting in ${$currentTimer} seconds`}</span>
          <button class="icon" on:click={cancelRemoveLink} alt="Cancel">
            <i class="fa fa-times-circle" />
          </button>
        {/if}
        {#if isCustomizePassword}
          <input
            type="text"
            class="small-input"
            bind:value={newPassword}
            bind:this={editLinkInput}
            placeholder={SET_PASSWORD_PLACEHOLDER}
            on:keydown={(event) => isEnterKeyDown(event) && saveNewPassword()}
          />
          <button class="icon" on:click={saveNewPassword} alt="Save">
            <i class="fa fa-save" />
          </button>
          <button class="icon" on:click={cleanUpPasswordVariables} alt="Cancel">
            <i class="fa fa-times-circle" />
          </button>
        {:else}
          <button
            class="icon"
            on:click={setNewPassword}
            alt="Customise Password"
          >
            <i class={link.hasPassword ? "fa fa-lock" : "fa fa-lock-open"} />
          </button>
        {/if}
      </p>
      <div>
        <p class="long-link truncate">
          {#if isEditingSourceURL}
            <input
              type="text"
              bind:value={link.sourceURL}
              bind:this={editLinkInput}
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
      </div>

      <div class="row">
        <p class="short-link" bind:this={linkSectionContainer}>
          {#if isEditingShortURL}
            <input
              type="text"
              bind:value={link.shortURL}
              bind:this={editLinkInput}
              on:keydown={(event) => isEnterKeyDown(event) && saveUpdatedLink()}
            />
          {:else}
            <a
              href={VISIT_LINK(link.shortURL)}
              class="short_url"
              target="blank"
            >
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
        <div class="visited-link">
          <a href={`${RouteConfig.LINK_PATH}${link.id}`} use:routeLink>
            <span>{link.visited} {link.visited === 1 ? CLICK : CLICKS}</span>
          </a>
        </div>
      </div>
      <Error bind:error={message} />
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

  .long-link {
    text-align: left;
    color: gray;
    margin-top: -10px;
  }

  .short-link {
    color: gray;
    min-width: 14em;
    margin-top: 20px !important;
    margin-right: 5px !important;
  }

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

  input[type="text"] {
    height: unset !important;
    line-height: normal !important;
    margin-right: 5px;
    width: 80%;
  }

  .truncate {
    margin-right: 5px;
    width: auto;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .deleting {
    margin-left: 10px;
  }

  .small-input {
    width: 30% !important;
  }

  @media screen and (max-width: 480px) {
    section {
      padding: 0 1em 0 1em;
    }
  }
</style>
