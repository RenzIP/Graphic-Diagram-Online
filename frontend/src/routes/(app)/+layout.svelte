<script lang="ts">
	import { onDestroy } from 'svelte';
	import { initAuthListener } from '$lib/stores/auth';

	let { children } = $props();

	// Initialize auth listener once for all (app) routes.
	// This sets up onAuthStateChange and loads user profile from stored token.
	const unsubscribe = initAuthListener();

	onDestroy(() => {
		unsubscribe();
	});
</script>

{@render children()}
