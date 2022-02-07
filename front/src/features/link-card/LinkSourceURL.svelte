<script lang="ts">
  import { tick } from "svelte";
  import { isEnterKeyDown } from "../../utils/keyboard";
  import type { LinkModel } from "../../model/link-model";
  import { customizeSourceUrl } from "../../services/api-service";
  import {
    ERROR,
    INTERNET_CONNECTION,
    LINK_CUSTOMIZED,
    URL_INVALID,
  } from "../../utils/resources";
  import { validURL } from "../../utils/url";
  import { currentAction, ACTION } from "./link.store";
  import { useMessage } from "../../utils/use-event";
  import { updateLink } from "../../services/link/link.store";

  export let link: LinkModel = null;
  let isModifyingSourceURL: boolean = false;
  let sourceURLInput: HTMLElement = null;
  let currentEditingSourceURL: string = null;

  const dispatchMessage = useMessage();

  $: isLinkEdited = link && link.sourceURL === currentEditingSourceURL;

  currentAction.subscribe((newMode) => {
    if (isModifyingSourceURL && newMode !== ACTION.SOURCE_URL) {
      closeEditable();
    }
  });

  const saveUpdatedLink = async () => {
    if (!validURL(link.sourceURL)) {
      dispatchMessage(URL_INVALID);
      return;
    }

    try {
      const response = await customizeSourceUrl(link);
      if (response.ok) {
        closeEditable();
        dispatchMessage(LINK_CUSTOMIZED);
        link = await response.json();
        updateLink(link);
      } else {
        const data = await response.json();
        dispatchMessage(ERROR(data.error));
      }
    } catch (error) {
      dispatchMessage(INTERNET_CONNECTION);
    }
  };

  const closeEditable = () => {
    currentAction.set(ACTION.NONE);

    if (currentEditingSourceURL) {
      link.sourceURL = currentEditingSourceURL;
    }

    currentEditingSourceURL = null;
    isModifyingSourceURL = false;
  };

  const customizeSourceURL = async () => {
    currentAction.set(ACTION.SOURCE_URL);
    isModifyingSourceURL = true;
    currentEditingSourceURL = link.sourceURL;
    await tick();
    sourceURLInput.focus();
  };
</script>

<p class="long-link truncate">
  {#if isModifyingSourceURL}
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

  {#if isModifyingSourceURL}
    <button
      class="icon"
      on:click={saveUpdatedLink}
      disabled={isLinkEdited}
      alt="Save"
    >
      <i class="fa fa-save" />
    </button>
    <button class="icon" on:click={closeEditable} title="Cancel">
      <i class="fa fa-times-circle" />
    </button>
  {:else}
    <button class="icon" on:click={customizeSourceURL} title="Edit"
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

  .long-link {
    text-align: left;
    color: gray;
    margin-top: -10px;
  }
</style>
