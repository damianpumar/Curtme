import { writable } from "svelte/store";

export enum EDIT {
  SOURCE_URL,
  SHORT_URL,
  PASSWORD,
  NONE,
}

export const currentEditing = writable<EDIT>(EDIT.NONE);
export const errorMessage = writable(null);
