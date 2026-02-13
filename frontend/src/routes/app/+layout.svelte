<script lang="ts">
	import { fly } from 'svelte/transition';
	import { page } from '$app/state';
    import BG from '$lib/components/BG.svelte';

	let { children } = $props();

	let disableAnimations = false;
</script>

<BG {disableAnimations}>
	{#key page.url.pathname}
		<div
			class="page-transition"
			in:fly={{ x: 1000, duration: 350 }}
			out:fly={{ x: -1000, duration: 350 }}
		>
			{@render children()}
		</div>
	{/key}
</BG>

<style>
	.page-transition {
		position: absolute;
		inset: 0;
	}
</style>
