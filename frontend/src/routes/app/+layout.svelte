<script lang="ts">
	import { page } from '$app/state';
    import BG from '$lib/components/BG.svelte';
	import SlideOut from '$lib/components/anim/SlideOut.svelte';
	import { beforeNavigate, goto } from '$app/navigation';

	let { children } = $props();

	let disableAnimations = false;
</script>

<BG {disableAnimations}>
	{#key page.url.pathname}
		<div
			class="page-transition"
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
