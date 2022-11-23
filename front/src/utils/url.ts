export const validURL = (url: string) => {
  try {
    new URL(url);

    return true;
  } catch (_) {
    return false;
  }
};

export const getSourceURLFromParameter = () => {
  return new URL(location.href).searchParams.get("sourceURL");
};

export const clearLinkParameter = () => {
  window.history.replaceState({}, document.title, "/");
};
