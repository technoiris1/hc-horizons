<script lang="ts">
	import texture from '$lib/assets/texture.png'
	import './layout.css';

	let { children } = $props();
</script>

<div class="layout-wrapper bg-[#271c0c] relative min-h-screen w-full overflow-hidden">
	<div class="absolute inset-0 pointer-events-none">
		<div class="w-full h-full bg-cover bg-center -rotate-90 scale-150" style="background-image: url({texture});"></div>
	</div>
	
	<div class="content-area bg-[#f3e8d8] absolute inset-10">
		{@render children()}
	</div>
</div>
