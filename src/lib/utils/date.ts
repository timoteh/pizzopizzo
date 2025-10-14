export function formatDate(date: Date): string {
	return new Intl.DateTimeFormat('fr-FR', {
		day: 'numeric',
		month: 'long'
	}).format(date);
}

export function formatWeekRange(startDate: Date, endDate: Date): string {
	return `${formatDate(startDate)} - ${formatDate(endDate)}`;
}

export function formatDeliveryDay(date: Date): string {
	return new Intl.DateTimeFormat('fr-FR', {
		weekday: 'long',
		day: 'numeric',
		month: 'long'
	}).format(date);
}
