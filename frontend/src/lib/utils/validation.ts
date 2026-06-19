export type ValidationErrors = Record<string, string>;

export function isValidEmail(value: string): boolean {
	return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function isNonNegativeNumber(value: number): boolean {
	return Number.isFinite(value) && value >= 0;
}

export function getApiErrorMessage(error: unknown, fallback: string): string {
	if (typeof error === 'object' && error !== null && 'message' in error) {
		const message = (error as { message?: unknown }).message;
		if (typeof message === 'string' && message.trim()) return message;
	}

	return fallback;
}
