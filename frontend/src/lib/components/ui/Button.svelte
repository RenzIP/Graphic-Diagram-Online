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
		'inline-flex items-center justify-center rounded-xl font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 disabled:pointer-events-none disabled:opacity-50 cursor-pointer no-underline active:scale-[0.98]';

	const variants = {
		primary: 'bg-primary text-white hover:bg-primary-hover shadow-[0_0_20px_rgba(99,102,241,0.2)] hover:shadow-[0_0_25px_rgba(99,102,241,0.4)] border border-white/10',
		secondary: 'bg-card text-white hover:bg-surface border border-white/10 shadow-sm',
		outline: 'border border-white/10 bg-transparent hover:bg-white/5 text-slate-300',
		ghost: 'hover:bg-white/5 text-slate-400 hover:text-white',
		danger: 'bg-error text-white hover:bg-red-400 shadow-[0_0_20px_rgba(239,68,68,0.2)] border border-red-400/20'
	};

	const sizes = {
		sm: 'h-8 px-4 text-xs',
		md: 'h-10 px-6 py-2 text-sm',
		lg: 'h-12 px-8 text-base',
		icon: 'h-10 w-10'
	};
</script>

{#if href}
	<a
		{href}
		class="{baseStyles} {variants[variant]} {sizes[size]} {className}"
		onclick={onclick}
		{...rest}
	>
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
