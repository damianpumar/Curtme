export const BASE_URL = "https://localhost:5001/";
export const VISIT_LINK = (shortURL) => `${BASE_URL}${shortURL}`;
export const GET_LINKS_BY_IDS = `${BASE_URL}links-by-id`;
export const GET_USER_LINKS = `${BASE_URL}links`;
export const SYNC_LINKS = `${BASE_URL}sync`;
