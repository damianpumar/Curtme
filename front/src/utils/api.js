import { get } from "svelte/store";
import {
  BASE_URL,
  GET_LINKS_BY_IDS,
  GET_USER_LINKS,
  SYNC_LINKS,
  CUSTOMIZE,
  GET_DETAIL,
} from "./config";
import { isAuthenticated, authToken } from "../auth0/auth0.store";

function buildHeader() {
  let header = {
    "Content-Type": "application/json",
  };

  if (get(isAuthenticated)) {
    header.Authorization = `Bearer ${get(authToken)}`;
  }

  return header;
}

export async function createLink(sourceURL) {
  const data = {
    sourceURL: sourceURL,
  };

  return await fetch(BASE_URL, {
    method: "POST",
    headers: buildHeader(),
    body: JSON.stringify(data),
  });
}

export async function getUserLinks() {
  try {
    return await fetch(GET_USER_LINKS, {
      method: "GET",
      headers: buildHeader(),
    });
  } catch (error) {
    return { ok: false };
  }
}

export async function getLinks(links) {
  try {
    var url = new URL(GET_LINKS_BY_IDS);
    links.forEach((link) => url.searchParams.append("ids", link.id));

    return await fetch(url, {
      method: "GET",
      headers: buildHeader(),
    });
  } catch (error) {
    return { ok: false };
  }
}

export async function syncLinksWithUser(links) {
  try {
    return await fetch(SYNC_LINKS, {
      method: "PUT",
      headers: buildHeader(),
      body: JSON.stringify(links.map((l) => l.id)),
    });
  } catch (error) {
    return { ok: false };
  }
}

export async function remove(link) {
  return await fetch(CUSTOMIZE(link.id), {
    method: "DELETE",
    headers: buildHeader(),
  });
}

export async function customizeLink(link) {
  const data = {
    sourceURL: link.sourceURL,
    shortURL: link.shortURL,
  };

  return await fetch(CUSTOMIZE(link.id), {
    method: "PUT",
    headers: buildHeader(),
    body: JSON.stringify(data),
  });
}

export async function getLinkDetail(id) {
  try {
    return await fetch(GET_DETAIL(id), {
      method: "GET",
      headers: buildHeader(),
    });
  } catch (error) {
    return { ok: false };
  }
}
