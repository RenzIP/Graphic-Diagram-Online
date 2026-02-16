<script lang="ts">
	import { type Snippet } from 'svelte';

	type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
	type ButtonSize = 'sm' | 'md' | 'lg' | 'icon';

	let {
		variant = 'primary',
		size = 'md',
		class: className = '',
		children,
		onclick,
		disabled = false,
		href,
		...rest
	}: {
		variant?: ButtonVariant;
		size?: ButtonSize;
		class?: string;
		children?: Snippet;
		onclick?: (e: MouseEvent) => void;
		disabled?: boolean;
		href?: string;
		[key: string]: any;
	} = $props();

	const baseStyles =
		'inline-flex items-center justify-center rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 disabled:pointer-events-none disabled:opacity-50 cursor-pointer no-underline';

	const variants = {
		primary: 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-500/20',
		secondary: 'bg-slate-800 text-slate-100 hover:bg-slate-700 border border-slate-700',
		outline: 'border border-slate-600 bg-transparent hover:bg-slate-800 text-slate-300',
		ghost: 'hover:bg-slate-800 text-slate-400 hover:text-slate-100',
		danger: 'bg-red-600 text-white hover:bg-red-700 shadow-lg shadow-red-500/20'
	};

	const sizes = {
		sm: 'h-8 px-3 text-xs',
		md: 'h-10 px-4 py-2 text-sm',
		lg: 'h-12 px-6 text-base',
		icon: 'h-10 w-10'
	};
</script>

{#if href}
	<a {href} class="{baseStyles} {variants[variant]} {sizes[size]} {className}" {...rest}>
		{@render children?.()}
	</a>
{:else}
	<button
		class="{baseStyles} {variants[variant]} {sizes[size]} {className}"
		{disabled}
		{onclick}
		{...rest}
	>
		{@render children?.()}
	</button>
{/if}
