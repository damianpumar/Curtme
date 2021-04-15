import { isAuthenticated } from "../auth0/auth0.store";

import {
  createLink,
  getLinks,
  getUserLinks,
  syncLinksWithUser,
} from "../api-service";
import type { LinkModel } from "../../model/link-model";
import { get } from "svelte/store";
import { initializeLinks, links, saveNewLink } from "./link.store";

const STORAGE_KEY = "links";

const getIsUserAuthenticated = () => get(isAuthenticated);

const loadLinksWithoutUser = async () => {
  const linksStored = localStorage.getItem(STORAGE_KEY);

  if (linksStored) {
    const linkStoredParsed = JSON.parse(linksStored);

    const response = await getLinks(linkStoredParsed);

    if (response.ok) {
      const links = await response.json();
      initializeLinks(links);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(links));
    }
  }
};

const loadLinkWithUser = async () => {
  const response = await getUserLinks();

  if (response.ok) {
    const links = await response.json();

    initializeLinks(links);
  }
};

const syncLinkWithoutUser = async () => {
  const linksStored = localStorage.getItem(STORAGE_KEY);

  if (linksStored) {
    const linkStoredParsed = JSON.parse(linksStored);

    const response = await syncLinksWithUser(linkStoredParsed);

    if (response.ok) {
      localStorage.removeItem(STORAGE_KEY);
    } else {
      await loadLinksWithoutUser();
    }
  }
};

const addNewLink = (link: LinkModel) => {
  saveNewLink(link);

  if (!getIsUserAuthenticated()) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(links));
  }
};

export const createNewLink = async (sourceURL: string) => {
  const response = await createLink(sourceURL);
  if (response.ok) {
    const link = await response.json();

    addNewLink(link);
  }

  return response;
};

export const loadLinks = async () => {
  if (getIsUserAuthenticated()) {
    await syncLinkWithoutUser();
    await loadLinkWithUser();
  } else {
    await loadLinksWithoutUser();
  }
};
