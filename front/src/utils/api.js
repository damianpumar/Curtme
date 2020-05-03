import { BASE_URL, GET_INFO } from "./config";

export async function createLink(longURL) {
	const data = {
		url: longURL,
	};

	return await fetch(BASE_URL, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(data),
	});
}

export async function getInfo(link) {
	await fetch(GET_INFO(link.id), {
		method: "GET",
		headers: {
			"Content-Type": "application/json",
		},
	});
}
