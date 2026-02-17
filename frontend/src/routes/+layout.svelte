<script lang="ts">
	import texture from '$lib/assets/texture.png'
	import './layout.css';
	import { page } from '$app/state';

	let { children } = $props();

	let isAdmin = $derived(page.url.pathname.includes('admin'));
</script>

<style>
	:global(:root) {
		--juice-easing: cubic-bezier(0.34, 1.56, 0.64, 1);
		--juice-duration: 0.35s;

		--juice-scale: 1.04;

		--selected-color: #ffa936;
		--selected-duration: 0.25s;

}
</style>

{#if isAdmin}
	{@render children()}
{:else}
	<div class="layout-wrapper bg-[#271c0c] relative min-h-screen w-full overflow-hidden overscroll-none">
		<div class="absolute inset-0 pointer-events-none">
			<div class="w-full h-full bg-cover bg-center -rotate-90 scale-150" style="background-image: url({texture});"></div>
		</div>
		
		<div class="content-area bg-[#f3e8d8] absolute inset-10">
			{@render children()}
		</div>
	</div>
{/if}
