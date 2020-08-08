export const BASE_URL = "https://curtme.org/";
export const VISIT_LINK = (shortURL) => `${BASE_URL}${shortURL}`;
export const GET_LINKS_BY_IDS = `${BASE_URL}links-by-id`;
export const GET_USER_LINKS = `${BASE_URL}links`;
export const SYNC_LINKS = `${BASE_URL}sync`;
export const CUSTOMIZE = (linkId, shortURL) =>
  `${BASE_URL}${linkId}/${shortURL}`;

export const AUTH0 = {
  domain: "dev-6r8s11fz.eu.auth0.com",
  client_id: "2l41JB9wG62TaX0BmIfILNq6GiTbt92b",
  audience: "https://dev-6r8s11fz.eu.auth0.com/api/v2/",
  redirect_uri: window.location.origin,
  useRefreshTokens: true,
};

export const GA_KEY = "UA-164923051-1";
