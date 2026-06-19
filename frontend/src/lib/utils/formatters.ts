export function formatDateTime(value: string | null | undefined): string {
	if (!value) return '-';

	const date = new Date(value);
	if (Number.isNaN(date.getTime())) return '-';

	return new Intl.DateTimeFormat('id-ID', {
		dateStyle: 'medium',
		timeStyle: 'short'
	}).format(date);
}

export function truncateMiddle(value: string, maxLength: number = 16): string {
	if (value.length <= maxLength) return value;

	const startLength = Math.ceil((maxLength - 3) / 2);
	const endLength = Math.floor((maxLength - 3) / 2);
	return `${value.slice(0, startLength)}...${value.slice(value.length - endLength)}`;
}
