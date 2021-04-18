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
  import { useError } from "../utils/use-error";

  const { dispatchError } = useError();

  export let link: LinkModel = null;
  let passwordInput: HTMLElement = null;
  let newPassword: string = null;
  let isCustomizingPassword = false;

  const setNewPassword = async () => {
    // cancelRemoveLink();
    newPassword = null;
    isCustomizingPassword = true;
    await tick();
    passwordInput.focus();
  };

  const saveNewPassword = async () => {
    try {
      const response = await lockLink(link.id, newPassword);
      if (response.ok) {
        cleanUpPasswordVariables();
        dispatchError(LINK_CUSTOMIZED);
        link = await response.json();
      } else {
        const data = await response.json();
        dispatchError(data.error);
      }
    } catch (error) {
      dispatchError(INTERNET_CONNECTION);
    }
  };

  const cleanUpPasswordVariables = () => {
    isCustomizingPassword = false;
    newPassword = null;
  };
</script>

{#if isCustomizingPassword}
  <div>
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
  </div>
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

  .small-input {
    width: 30% !important;
  }
</style>
