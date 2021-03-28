export function validURL(url) {
  try {
    new URL(url);
  } catch (_) {
    return false;
  }

  return true;
}

export function getSourceURLFromParameter() {
  return new URL(location.href).searchParams.get("sourceURL");
}

export function clearLinkParameter() {
  window.history.replaceState({}, document.title, "/");
}
