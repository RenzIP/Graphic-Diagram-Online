<script lang="ts">
	let {
		type = 'text',
		value = $bindable(),
		placeholder = '',
		label,
		error,
		class: className = '',
		id = crypto.randomUUID(),
		...rest
	}: {
		type?: string;
		value?: string;
		placeholder?: string;
		label?: string;
		error?: string;
		class?: string;
		id?: string;
		[key: string]: any;
	} = $props();
</script>

<div class="w-full flex flex-col gap-1.5 {className}">
	{#if label}
		<label for={id} class="text-sm font-medium text-slate-300">
			{label}
		</label>
	{/if}
	<div class="relative">
		<input
			{id}
			{type}
			bind:value
			{placeholder}
			class="flex h-11 w-full rounded-xl border border-white/10 bg-surface/50 px-4 py-2 text-sm text-white placeholder:text-slate-500 shadow-sm transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:border-primary/50 hover:border-white/20 disabled:cursor-not-allowed disabled:opacity-50 {error ? 'border-error/50 focus-visible:ring-error/50 focus-visible:border-error/50' : ''}"
			{...rest}
		/>
	</div>
	{#if error}
		<p class="text-xs text-error font-medium">{error}</p>
	{/if}
</div>
