import { createEventDispatcher } from "svelte";

export const useError = () => {
  const dispatch = createEventDispatcher();

  const dispatchError = (errorMessage: string) => {
    dispatch("error", {
      message: errorMessage,
    });
  };

  return { dispatchError };
};
