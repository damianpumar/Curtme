import { createEventDispatcher } from "svelte";

export const useDelete = () => {
  const dispatch = createEventDispatcher();

  const dispatchDelete = () => {
    dispatch("delete");
  };

  return { dispatchDelete };
};
