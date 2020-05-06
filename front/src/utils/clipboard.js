import { VISIT_LINK } from "./config";

export function copy(link) {
	if (navigator.clipboard) {
		return navigator.clipboard.writeText(VISIT_LINK(link.shortURL)).catch(function (err) {
			throw err !== undefined
				? err
				: new DOMException("The request is not allowed", "NotAllowedError");
		});
	}
}
