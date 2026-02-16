<script lang="ts">
  import { type Snippet } from 'svelte';

  let {
    class: className = '',
    children,
    ...rest
  }: {
    class?: string;
    children?: Snippet;
    [key: string]: any;
  } = $props();
</script>

<div
  class="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl shadow-slate-950/50 overflow-hidden {className}"
  {...rest}
>
  {@render children?.()}
</div>
