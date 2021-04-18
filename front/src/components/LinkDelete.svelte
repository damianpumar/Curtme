<script lang="ts">
  import type { LinkModel } from "../model/link-model";
  import { remove } from "../services/api-service";
  import { useTimer } from "../utils/use-timer";
  import { removeStoredLink } from "../services/link/link.store";
  import { INTERNET_CONNECTION } from "../utils/resources";
  import { useError } from "../utils/use-error";

  export let link: LinkModel = null;
  let isDeleting = false;

  const { startTimer, cancelTimer, currentTimer } = useTimer(5);
  const { dispatchError } = useError();

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
        dispatchError(data.error);
      }
    } catch (error) {
      cancelRemoveLink();
      dispatchError(INTERNET_CONNECTION);
    }
  };
</script>

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
