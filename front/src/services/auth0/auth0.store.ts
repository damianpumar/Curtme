import { writable } from "svelte/store";

export const initialized = writable(false);
export const isLoading = writable(true);
export const isAuthenticated = writable(false);
export const authToken = writable("");
export const userInfo = writable({});
export const authError = writable(null);
export const AUTH_KEY = {};
