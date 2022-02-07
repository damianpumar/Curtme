<script lang="ts">
  import { changeVisibility } from "../../services/api-service";
  import {
    ERROR,
    INTERNET_CONNECTION,
    LINK_TOGGLING,
  } from "../../utils/resources";
  import type { LinkModel } from "../../model/link-model";
  import { useMessage } from "../../utils/use-event";
  import { updateLink } from "../../services/link/link.store";

  export let link: LinkModel = null;

  const dispatchMessage = useMessage();

  const toggleVisibility = async () => {
    try {
      const response = await changeVisibility(link);
      if (response.ok) {
        link = await response.json();
        dispatchMessage(LINK_TOGGLING(link.isPublic));

        updateLink(link);
      } else {
        const data = await response.json();
        dispatchMessage(ERROR(data.error));
      }
    } catch (error) {
      dispatchMessage(INTERNET_CONNECTION);
    }
  };
</script>

<button class="icon" on:click={toggleVisibility} title="Change visibility">
  <i class={link.isPublic ? "fa fa-eye" : "fa fa-eye-slash"} />
</button>

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
</style>
