<script lang="ts">
  import { create_in_transition, tick } from "svelte/internal";
  import type { LinkModel } from "../../model/link-model";
  import { copy } from "../../utils/clipboard";
  import { isEnterKeyDown } from "../../utils/keyboard";
  import { VISIT_LINK } from "../../utils/config";
  import { customizeLink } from "../../services/api-service";
  import { scale } from "svelte/transition";
  import { INTERNET_CONNECTION, LINK_CUSTOMIZED } from "../../utils/resources";
  import { currentAction, ACTION } from "./link.store";
  import { useMessage } from "../../utils/use-event";

  export let link: LinkModel = null;

  let shortURLInput: HTMLElement = null;
  let isModifyingShortURL: boolean = false;
  let currentEditingShortURL: string = null;
  let linkSectionContainer = null;
  let animationLink: any;

  const dispatchMessage = useMessage();

  $: isLinkEdited = link && link.shortURL === currentEditingShortURL;

  currentAction.subscribe((newMode) => {
    if (isModifyingShortURL && newMode !== ACTION.SHORT_URL) {
      closeEditable();
    }
  });

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
    currentAction.set(ACTION.SHORT_URL);
    isModifyingShortURL = true;
    currentEditingShortURL = link.shortURL;
    await tick();
    shortURLInput.focus();
  };

  function closeEditable() {
    currentAction.set(ACTION.NONE);

    if (currentEditingShortURL) {
      link.shortURL = currentEditingShortURL;
    }

    currentEditingShortURL = null;
    isModifyingShortURL = false;
  }

  const saveUpdatedLink = async () => {
    try {
      const response = await customizeLink(link);
      if (response.ok) {
        closeEditable();
        dispatchMessage(LINK_CUSTOMIZED);
        link = await response.json();
      } else {
        const data = await response.json();
        dispatchMessage(data.error);
      }
    } catch (error) {
      dispatchMessage(INTERNET_CONNECTION);
    }
  };
</script>

<p class="short-link" bind:this={linkSectionContainer}>
  {#if isModifyingShortURL}
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
{#if isModifyingShortURL}
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
  <div
    class="fb-share-button"
    data-href={VISIT_LINK(link.shortURL)}
    data-layout="button"
    data-size="small"
  >
    <a
      target="_blank"
      href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(VISIT_LINK(link.shortURL))}%2F&amp;src=sdkpreparse`}
      class="fb-xfbml-parse-ignore share-button icon brands fa-facebook"
    >&nbsp;</a>
  </div>
  <a class="twitter-share-button share-button share-button-with-padding icon brands fa-twitter"
    target="_blank"
    href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(VISIT_LINK(link.shortURL))}`}
  >&nbsp;</a>
  <a class="whatsapp-share-button share-button share-button-with-padding icon brands fa-whatsapp"
    href={`whatsapp://send?text=${encodeURIComponent(VISIT_LINK(link.shortURL))}`}
    target="_blank"
    data-action="share/whatsapp/share"
  >&nbsp;</a>
  <a class="whatsapp-web-share-button share-button share-button-with-padding icon brands fa-whatsapp"
    href={`https://web.whatsapp.com/send?text=${encodeURIComponent(VISIT_LINK(link.shortURL))}`}
    target="_blank"
  >&nbsp;</a>
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

  input[type="text"] {
    height: unset !important;
    line-height: normal !important;
    margin-right: 5px;
    width: 80%;
  }

  .short-link {
    color: gray;
    min-width: 14em;
    margin-top: 20px !important;
    margin-right: 5px !important;
  }

  .fb-share-button {
    padding-left: 15px !important;
  }

  .share-button:hover {
    color: #ff6232;
  }

  .share-button-with-padding {
    padding-left: 15px !important;
  }

  .whatsapp-share-button {
    display: none;
  }

  .whatsapp-web-share-button {
    display: inline;
  }

  @media (hover:none), (hover:on-demand) {
    .whatsapp-share-button {
      display: inline;
    }

    .whatsapp-web-share-button {
      display: none;
    }
  }
</style>
