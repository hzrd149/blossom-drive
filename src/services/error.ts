import { writable } from "svelte/store";

export const lastError = writable<Error | null>(null);
