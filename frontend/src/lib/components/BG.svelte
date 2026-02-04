<script lang="ts">
	import type { Snippet } from 'svelte';
	import bgPattern from '$lib/assets/bg pattern.svg';

	interface Props {
		class?: string;
		children?: Snippet;
		disableAnimations?: boolean;
	}

	let { class: className = '', children, disableAnimations = false }: Props = $props();
</script>

<div class="bg-content bg-[#f3e8d8] relative size-full overflow-hidden {className}">
	<div class="absolute -inset-[50%] flex items-center justify-center -rotate-[19.54deg]">
		<div
			class="w-[300%] h-[300%] pointer-events-none bg-repeat opacity-50"
			class:pattern-slide={!disableAnimations}
			style="background-image: url({bgPattern}); background-size: 1600px;"
		></div>
	</div>
	<div class="relative z-10 size-full flex flex-col">
		{#if children}
			{@render children()}
		{/if}
	</div>
</div>

<style>
	.pattern-slide {
		animation: slide 40s linear infinite;
	}

	@keyframes slide {
		from {
			background-position: 0 0;
		}
		to {
			background-position: -1600px 1600px;
		}
	}
</style>
