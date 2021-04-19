<script lang="ts">
  import { tick } from "svelte";
  import { lockLink } from "../services/api-service";
  import {
    INTERNET_CONNECTION,
    LINK_CUSTOMIZED,
    SET_PASSWORD_PLACEHOLDER,
  } from "../utils/resources";
  import { isEnterKeyDown } from "../utils/keyboard";
  import type { LinkModel } from "../model/link-model";
  import { currentEditing, EDIT, errorMessage } from "./link.store";

  export let link: LinkModel = null;
  let passwordInput: HTMLElement = null;
  let newPassword: string = null;

  $: isEditing = $currentEditing === EDIT.PASSWORD;

  $: if (!isEditing) {
    cleanUpPasswordVariables();
  }

  const setNewPassword = async () => {
    currentEditing.set(EDIT.PASSWORD);
    newPassword = null;
    await tick();
    passwordInput.focus();
  };

  const saveNewPassword = async () => {
    try {
      const response = await lockLink(link.id, newPassword);
      if (response.ok) {
        cleanUpPasswordVariables();
        errorMessage.set(LINK_CUSTOMIZED);
        link = await response.json();
      } else {
        const data = await response.json();
        errorMessage.set(data.error);
      }
    } catch (error) {
      errorMessage.set(INTERNET_CONNECTION);
    }
  };

  const cleanUpPasswordVariables = () => {
    currentEditing.set(EDIT.NONE);
    newPassword = null;
  };
</script>

{#if isEditing}
  <input
    type="text"
    class="small-input"
    bind:value={newPassword}
    bind:this={passwordInput}
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
  <button class="icon" on:click={setNewPassword} alt="Customise Password">
    <i class={link.hasPassword ? "fa fa-lock" : "fa fa-lock-open"} />
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

  input[type="text"] {
    height: unset !important;
    line-height: normal !important;
    margin-right: 5px;
    width: 80%;
  }

  .small-input {
    width: 30% !important;
  }
</style>
