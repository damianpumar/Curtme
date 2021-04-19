import { writable } from "svelte/store";

export enum ACTION {
  SOURCE_URL,
  SHORT_URL,
  PASSWORD,
  DELETE,
  NONE,
}

export const currentAction = writable<ACTION>(ACTION.NONE);
export const errorMessage = writable(null);
