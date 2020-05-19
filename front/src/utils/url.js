export function validURL(url) {
	try {
		new URL(url);
	} catch (_) {
		return false;
	}

	return true;
}
