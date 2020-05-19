export function getDateParsed(link) {
	const date = new Date(link.date);
	return `${date.getDate()}.${date.getMonth() + 1}.${date.getFullYear()}`;
}
