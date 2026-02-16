<script lang="ts">
  let {
    src,
    alt = 'Avatar',
    initials = 'User',
    size = 'md',
    class: className = ''
  }: {
    src?: string | null;
    alt?: string;
    initials?: string;
    size?: 'sm' | 'md' | 'lg' | 'xl';
    class?: string;
  } = $props();

  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-lg'
  };

  function getInitials(name: string) {
    return name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  }
</script>

<div
  class="relative inline-flex items-center justify-center rounded-full bg-slate-800 border border-slate-700 overflow-hidden shrink-0 {sizeClasses[size]} {className}"
>
  {#if src}
    <img {src} {alt} class="w-full h-full object-cover" />
  {:else}
    <span class="font-medium text-slate-300">{getInitials(initials)}</span>
  {/if}
</div>
