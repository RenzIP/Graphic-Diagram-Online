<script lang="ts">
  import { canvasStore } from '$lib/stores/canvas';

  const gridSize = 20;
  
  // Create reactive variables from the store
  let transform = $canvasStore; 
  $: transform = $canvasStore; // Svelte 5 legacy pending update to runes for store usage if needed, but $store works fine.
  
  // Calculate grid pattern size based on zoom
  $: patternSize = gridSize * transform.k;
  $: offsetX = transform.x % patternSize;
  $: offsetY = transform.y % patternSize;
</script>

<defs>
  <pattern
    id="grid-pattern"
    width={patternSize}
    height={patternSize}
    patternUnits="userSpaceOnUse"
    x={offsetX}
    y={offsetY}
  >
    <circle cx={1} cy={1} r={1 * transform.k} fill="#334155" />
  </pattern>
</defs>

<rect width="100%" height="100%" fill="url(#grid-pattern)" />
