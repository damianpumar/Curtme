import { get } from "svelte/store";
import { isAuthenticated } from "../auth0/auth0.store";
import {
  createLink,
  getLinks,
  getUserLinks,
  syncLinksWithUser,
} from "../api-service";
import type { LinkModel } from "../../model/link-model";
import { initializeLinks, links, saveNewLink } from "./link.store";

const STORAGE_KEY = "links";

const saveLinksInLocalStorage = (links: LinkModel[]) =>
  localStorage.setItem(STORAGE_KEY, JSON.stringify(links));

const isUserAuthenticated = () => get(isAuthenticated);

const loadLinksWithoutUser = async () => {
  const linksStored = localStorage.getItem(STORAGE_KEY);

  if (linksStored) {
    const linkStoredParsed: LinkModel[] = JSON.parse(linksStored);

    const response = await getLinks(
      linkStoredParsed.map((aLinkStored) => aLinkStored.id)
    );

    if (response.ok) {
      const linksFromServer = await response.json();

      initializeLinks(linksFromServer);

      saveLinksInLocalStorage(linksFromServer);
    }
  }
};

const loadLinkWithUser = async () => {
  const response = await getUserLinks();

  if (response.ok) {
    const linksFromServer = await response.json();

    initializeLinks(linksFromServer);
  }
};

const syncLinkWithoutUser = async () => {
  const linksStored = localStorage.getItem(STORAGE_KEY);

  if (linksStored) {
    const linkStoredParsed: LinkModel[] = JSON.parse(linksStored);

    const response = await syncLinksWithUser(linkStoredParsed);

    if (response.ok) {
      localStorage.removeItem(STORAGE_KEY);
    } else {
      await loadLinksWithoutUser();
    }
  }
};

const addNewLink = async (link: LinkModel) => {
  saveNewLink(link);

  if (!isUserAuthenticated()) {
    saveLinksInLocalStorage(get(links));
  }
};

export const createNewLink = async (sourceURL: string) => {
  const response = await createLink(sourceURL);
  if (response.ok) {
    const link = await response.json();

    await addNewLink(link);
  }

  return response;
};

export const loadLinks = async () => {
  if (isUserAuthenticated()) {
    await syncLinkWithoutUser();
    await loadLinkWithUser();
  } else {
    await loadLinksWithoutUser();
  }
};
