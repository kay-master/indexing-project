export function toUnixTime(timestamp: string) {
	return new Date(timestamp).valueOf();
}

export function toMilli(nanoseconds: number) {
	return nanoseconds / 1000000;
}
