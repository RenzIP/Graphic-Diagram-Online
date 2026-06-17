'use client';

import { useEffect } from 'react';
import { initAuth } from '../../lib/stores/auth.js';

export default function AuthInit() {
	useEffect(() => {
		initAuth();
	}, []);
	return null;
}
