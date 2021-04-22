import { createEventDispatcher } from "svelte";

export const useDelete = () => {
  const dispatch = createEventDispatcher();

  const dispatchDelete = () => {
    dispatch("delete");
  };

  return dispatchDelete;
};

export const useMessage = () => {
  const dispatch = createEventDispatcher();

  const dispatchMessage = (message: string) => {
    dispatch("message", {
      message,
    });
  };

  return dispatchMessage;
};
