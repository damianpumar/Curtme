import { get } from "svelte/store";
import {
  BASE_URL,
  GET_LINKS_BY_IDS,
  GET_USER_LINKS,
  SYNC_LINKS,
  CUSTOMIZE,
  GET_DETAIL,
  UNLOCK_LINK,
  LOCK_LINK,
} from "../utils/config";
import { isAuthenticated, authToken } from "../services/auth0/auth0.store";
import type { LinkModel } from "../model/link-model";

const buildHeader = () => {
  let header: HeadersInit = {
    "Content-Type": "application/json",
  };

  if (get(isAuthenticated)) {
    header.Authorization = `Bearer ${get(authToken)}`;
  }

  return header;
};

const defaultResponse = () => {
  return { ok: false, json: async () => {} };
};

export async function createLink(sourceURL: string) {
  const data = {
    sourceURL: sourceURL,
  };

  try {
    return await fetch(BASE_URL, {
      method: "POST",
      headers: buildHeader(),
      body: JSON.stringify(data),
    });
  } catch (error) {
    return defaultResponse();
  }
}

export async function getUserLinks() {
  try {
    return await fetch(GET_USER_LINKS, {
      method: "GET",
      headers: buildHeader(),
    });
  } catch (error) {
    return defaultResponse();
  }
}

export async function getLinks(linkIds: string[]) {
  try {
    const url = new URL(GET_LINKS_BY_IDS);
    linkIds.forEach((id) => url.searchParams.append("ids", id));

    return await fetch(url.toString(), {
      method: "GET",
      headers: buildHeader(),
    });
  } catch (error) {
    return defaultResponse();
  }
}

export async function syncLinksWithUser(links: LinkModel[]) {
  try {
    return await fetch(SYNC_LINKS, {
      method: "PUT",
      headers: buildHeader(),
      body: JSON.stringify(links.map((link) => link.id)),
    });
  } catch (error) {
    return defaultResponse();
  }
}

export async function remove(link: LinkModel) {
  try {
    return await fetch(CUSTOMIZE(link.id), {
      method: "DELETE",
      headers: buildHeader(),
    });
  } catch (error) {
    return defaultResponse();
  }
}

async function customize(id: string, data: any) {
  try {
    return await fetch(CUSTOMIZE(id), {
      method: "PUT",
      headers: buildHeader(),
      body: JSON.stringify(data),
    });
  } catch (error) {
    return defaultResponse();
  }
}

export async function customizeSourceUrl(link: LinkModel) {
  const data = {
    sourceURL: link.sourceURL,
  };

  return await customize(link.id, data);
}

export async function customizeShortUrl(link: LinkModel) {
  const data = {
    shortURL: link.shortURL,
  };

  return await customize(link.id, data);
}

export async function changeVisibility(link: LinkModel) {
  const data = {
    toggleVisibility: true,
  };

  return await customize(link.id, data);
}

export async function lockLink(linkId: string, newPassword: string) {
  const data = {
    password: newPassword,
  };

  try {
    return await fetch(LOCK_LINK(linkId), {
      method: "PUT",
      headers: buildHeader(),
      body: JSON.stringify(data),
    });
  } catch (error) {
    return defaultResponse();
  }
}

export async function getLinkDetail(id: string) {
  try {
    return await fetch(GET_DETAIL(id), {
      method: "GET",
      headers: buildHeader(),
    });
  } catch (error) {
    return defaultResponse();
  }
}

export async function getUnlockLink(shortURL: string) {
  try {
    return await fetch(UNLOCK_LINK(shortURL), {
      method: "GET",
      headers: buildHeader(),
    });
  } catch (error) {
    return defaultResponse();
  }
}

export async function unlockLink(shortURL: string, password: string) {
  const data = {
    password: password,
  };

  try {
    return await fetch(UNLOCK_LINK(shortURL), {
      mode: "cors",
      method: "POST",
      headers: buildHeader(),
      body: JSON.stringify(data),
    });
  } catch (error) {
    return defaultResponse();
  }
}
