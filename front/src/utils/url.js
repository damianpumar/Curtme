export function validURL(url) {
	try {
		new URL(url);
	} catch (_) {
		return false;
	}

	return true;
}

export function getLongURLFromParameter() {
	return new URL(location.href).searchParams.get("longURL");
}

export function clearLinkParameter() {
	window.history.replaceState({}, document.title, "/");
}
