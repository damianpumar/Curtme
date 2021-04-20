export const BASE_URL = process.env.BASE_URL;
export const VISIT_LINK = (shortURL: string) => `${BASE_URL}${shortURL}`;
export const GET_LINKS_BY_IDS = `${BASE_URL}links-by-id`;
export const GET_USER_LINKS = `${BASE_URL}links`;
export const SYNC_LINKS = `${BASE_URL}sync`;
export const CUSTOMIZE = (linkId: string) => `${BASE_URL}${linkId}`;
export const GET_DETAIL = (linkId: string) => `${BASE_URL}details/${linkId}`;
export const UNLOCK_LINK = (shortURL: string) =>
  `${BASE_URL}unlock/${shortURL}`;
export const LOCK_LINK = (linkId: string) => `${BASE_URL}lock/${linkId}`;

export const GOOGLE_MAP_URL =
  "https://www.google.com/maps/search/?api=1&query=";

export const AUTH0 = {
  domain: "dev-6r8s11fz.eu.auth0.com",
  client_id: "2l41JB9wG62TaX0BmIfILNq6GiTbt92b",
  audience: "https://dev-6r8s11fz.eu.auth0.com/api/v2/",
  redirect_uri: window.location.origin,
  useRefreshTokens: true,
  cacheLocation: "localstorage",
};

export const GA_KEY = "UA-164923051-1";
