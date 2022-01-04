<script lang="ts">
  import type { LinkModel } from "../../model/link-model";
  import { remove } from "../../services/api-service";
  import { useTimer } from "../../utils/use-timer";
  import { removeStoredLink } from "../../services/link/link.store";
  import { INTERNET_CONNECTION } from "../../utils/resources";
  import { currentAction, ACTION } from "./link.store";
  import { useDelete, useMessage } from "../../utils/use-event";
  export let link: LinkModel = null;
  let isDeleting = false;

  const { startTimer, cancelTimer, currentTimer } = useTimer(5);
  const dispatchDelete = useDelete();
  const dispatchMessage = useMessage();

  currentAction.subscribe((newMode) => {
    if (isDeleting && newMode !== ACTION.DELETE) {
      cancelRemoveLink();
    }
  });

  const removeLink = () => {
    currentAction.set(ACTION.DELETE);
    isDeleting = true;
    startTimer(confirmDeleteLink);
  };

  const cancelRemoveLink = () => {
    currentAction.set(ACTION.NONE);
    isDeleting = false;
    cancelTimer();
  };

  const confirmDeleteLink = async () => {
    try {
      const response = await remove(link);

      if (response.ok) {
        dispatchDelete();
        removeStoredLink(link);
      } else {
        const data = await response.json();
        dispatchMessage(data.error);
      }
    } catch (error) {
      cancelRemoveLink();
      dispatchMessage(INTERNET_CONNECTION);
    }
  };
</script>

{#if !isDeleting}
  <button class="icon" on:click={removeLink} title="Delete">
    <i class="fa fa-trash" />
  </button>
{:else}
  <span class="deleting">{`Deleting in ${$currentTimer} seconds`}</span>
  <button class="icon" on:click={cancelRemoveLink} title="Cancel">
    <i class="fa fa-times-circle" />
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

  .deleting {
    margin-left: 10px;
  }
</style>
