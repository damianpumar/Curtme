import { derived, writable } from "svelte/store";
import type { LinkModel } from "../../model/link-model";
import { parseDate } from "../../utils/date";

export const links = writable<LinkModel[]>([]);

export const orderedLinks = derived(links, ($links) =>
  $links.sort(
    (l1: LinkModel, l2: LinkModel) =>
      parseDate(l2.date).getTime() - parseDate(l1.date).getTime()
  )
);

export const removeStoredLink = (link: LinkModel) => {
  links.update((linksValue) => [
    ...linksValue.filter((linkStore) => linkStore.id !== link.id),
  ]);
};

export const saveNewLink = (newLink: LinkModel) =>
  links.update((linksValue) => [...linksValue, newLink]);

export const initializeLinks = (storedLinks: LinkModel[]) =>
  links.set(storedLinks);
