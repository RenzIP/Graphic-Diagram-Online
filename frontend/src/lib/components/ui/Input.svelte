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

<div class="w-full {className}">
	{#if label}
		<label for={id} class="mb-1.5 block text-sm font-medium text-slate-300">
			{label}
		</label>
	{/if}
	<input
		{id}
		{type}
		bind:value
		{placeholder}
		class="w-full rounded-lg border border-slate-800 bg-slate-950 px-4 py-2 text-slate-200 placeholder-slate-500 transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/50 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50
    {error ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/20' : ''}"
		{...rest}
	/>
	{#if error}
		<p class="mt-1 text-xs text-red-400">{error}</p>
	{/if}
</div>
