export const validURL = (url: string) => {
  try {
    new URL(url);
  } catch (_) {
    return false;
  }

  return true;
};

export const getSourceURLFromParameter = () => {
  return new URL(location.href).searchParams.get("sourceURL");
};

export const clearLinkParameter = () => {
  window.history.replaceState({}, document.title, "/");
};
