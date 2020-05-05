import { GA_KEY } from "./config";

window.dataLayer = window.dataLayer || [];
function gtag() {
	dataLayer.push(arguments);
}

gtag("js", new Date());

gtag("config", GA_KEY);

function throwGAEvent(label) {
	gtag("event", label, {
		event_label: label,
		event_category: "Curtme",
	});
}

export function gaLoad() {
	const analyticsURL = `https://www.googletagmanager.com/gtag/js?id=${GA_KEY}`;
	var script = document.createElement("script");
	script.src = analyticsURL;
	script.type = "text/javascript";
	document.head.appendChild(script);
}

export function gaEventUserClickLogin() {
	throwGAEvent("USER_CLICK_LOGGED_IN");
}

export function gaEventUserClickLogout() {
	throwGAEvent("USER_LOGGED_OUT");
}

export function gaEventUserLoggedLogin() {
	throwGAEvent("USER_LOGGED_IN");
}

export function gaEventUserCreateShortLink() {
	throwGAEvent("USER_NEW_SHORT_LINK");
}
