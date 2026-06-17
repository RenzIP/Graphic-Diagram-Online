'use client';

import { useSyncExternalStore } from 'react';

export function useStore(store) {
	return useSyncExternalStore(store.subscribe, store.get, store.get);
}
