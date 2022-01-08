import { createEventDispatcher } from "svelte";
import { toast } from "@zerodevx/svelte-toast";

export const useDelete = () => {
  const dispatch = createEventDispatcher();

  const dispatchDelete = () => {
    dispatch("delete");
  };

  return dispatchDelete;
};

export const useMessage = () => {
  const dispatchMessage = (message: string) => {
    toast.push(message);
  };

  return dispatchMessage;
};
