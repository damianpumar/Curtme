<script>
  import { scale } from "svelte/transition";
  import { create_in_transition } from "svelte/internal";
  import { VISIT_LINK } from "../utils/config";
  import { customizeLink } from "../utils/api";
  import { getDateParsed } from "../utils/date";
  import {
    INTERNET_CONNECTION,
    LINK_CUSTOMIZED,
    CLICK,
    CLICKS,
  } from "../utils/resources.js";
  import { copy } from "../utils/clipboard";
  import { isEnterKeyDown } from "../utils/keyboard";
  import { LINK_PATH } from "../utils/routeConfig";
  import Error from "./Error.svelte";

  export let link;
  let linkSectionContainer;
  let animationLink;
  let errorMessage;
  let editLinkInput;

  let isEditing = false;
  let currentEditingShortURL;

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

  function customizeShortURL() {
    currentEditingShortURL = link.shortURL;
    isEditing = true;
    editLinkInput.focus();
  }

  function closeEditable() {
    isEditing = false;
  }

  async function saveCustomShortURL() {
    try {
      const response = await customizeLink(link);
      if (response.ok) {
        closeEditable();
        errorMessage = LINK_CUSTOMIZED;
      } else {
        const data = await response.json();
        errorMessage = data.error;
      }
    } catch (error) {
      errorMessage = INTERNET_CONNECTION;
    }
  }
</script>

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
    align-self: flex-end;
    margin-right: 10px !important;
    margin-left: auto;
  }

  .title-link {
    font-weight: bold;
  }

  .long-link {
    text-align: left;
    color: gray;
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
    padding-top: 10px;
    padding-left: 6px !important;
  }

  button:disabled {
    color: lightgray;
    pointer-events: none;
  }

  button:hover {
    color: #ff6232;
  }

  input[type="text"] {
    height: unset;
    margin-right: 5px;
    margin-bottom: 5px;
    width: 90%;
  }

  .truncate {
    max-width: 50em;
    overflow: hidden;
    text-overflow: ellipsis;
    display: block;
  }

  @media screen and (max-width: 480px) {
    section {
      padding: 0 1em 0 1em;
    }

    .truncate {
      max-width: 25em;
    }
  }
</style>

{#if link}
  <section
    class="col-12 col-12-mobilep container medium"
    transition:scale={{ start: 0.5 }}>
    <div class="result">
      <p class="date-link">{getDateParsed(link)}</p>
      <p class="title-link">{link.title}</p>
      <p class="long-link">
        <a href={link.longURL} class="truncate" target="blank">
          {link.longURL}
        </a>
      </p>
      <div class="row">
        <p class="short-link" bind:this={linkSectionContainer}>
          {#if isEditing}
            <input
              type="text"
              bind:value={link.shortURL}
              bind:this={editLinkInput}
              on:keydown={(event) => isEnterKeyDown(event) && saveCustomShortURL()} />
          {:else}
            <a
              href={VISIT_LINK(link.shortURL)}
              class="short_url"
              target="blank">
              {VISIT_LINK(link.shortURL)}
            </a>
          {/if}
        </p>
        {#if isEditing}
          <button
            class="icon fa-save"
            on:click={saveCustomShortURL}
            disabled={isLinkEdited}
            alt="Save" />
          <button
            class="icon fa-times-circle"
            on:click={closeEditable}
            alt="Cancel" />
        {:else}
          <button
            class="icon fa-edit"
            on:click={customizeShortURL}
            alt="Edit" />
          <button class="icon fa-copy" on:click={copyClipboard} alt="Copy" />
        {/if}
        <div class="visited-link">
          <a href={`${LINK_PATH}${link.id}`}>
            <span>{link.visited} {link.visited === 1 ? CLICK : CLICKS}</span>
          </a>
        </div>
      </div>
      <Error bind:error={errorMessage} />
    </div>
  </section>
{/if}
