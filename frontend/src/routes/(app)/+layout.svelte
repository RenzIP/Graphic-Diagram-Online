<script lang="ts">
	import { initAuth } from '$lib/stores/auth';

	let { children } = $props();

	// Initialize auth once for all (app) routes.
	// This loads user profile from stored token if available.
	initAuth();
</script>

{@render children()}
