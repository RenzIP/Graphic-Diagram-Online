export type ToastType = 'success' | 'error' | 'info';

type ToastFn = (message: string, type?: ToastType) => void;

declare global {
	interface Window {
		__gradiol_toast?: ToastFn;
	}
}

export function showToast(message: string, type: ToastType = 'info'): void {
	if (typeof window === 'undefined') return;
	window.__gradiol_toast?.(message, type);
}
