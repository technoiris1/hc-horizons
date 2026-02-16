<script lang="ts">
	import { tick } from 'svelte';
	import heroPlaceholder from '$lib/assets/projects/hero-placeholder.png';
	import { goto } from '$app/navigation';
	import InputPrompt from '$lib/components/InputPrompt.svelte';
	import NavigationHint from '$lib/components/NavigationHint.svelte';
	import TurbulentImage from '$lib/components/TurbulentImage.svelte';
	import { createListNav } from '$lib/nav/wasd.svelte';
	import { api, type components } from '$lib/api';

	type ProjectResponse = components['schemas']['ProjectResponse'];

	let projects = $state<ProjectResponse[]>([]);
	let loading = $state(true);
	let error = $state<string | null>(null);

	async function fetchProjects() {
		loading = true;
		error = null;
		const { data, error: err } = await api.GET('/api/projects/auth');
		if (err) {
			error = 'Failed to load projects';
		} else {
			projects = (data as ProjectResponse[]) ?? [];
		}
		loading = false;
	}

	fetchProjects();

	let scrollOffset = $state(0);
	let listEl: HTMLDivElement;
	let clickWasSelected = false;

	const nav = createListNav({
		count: () => projects.length + 1, // +1 for create project card
		wheel: 80,
		onChange: () => updateScroll(),
		onEscape: () => goto('/app?noanimate'),
		onSelect: (i) => {
			if (i === projects.length) {
				goto('/app/projects/new');
			} else {
				const project = projects[i];
				if (project) {
					goto(`/app/projects/${project.projectId}`);
				}
			}
		},
	});

	async function updateScroll() {
		await tick();
		if (!listEl) return;
		const cards = listEl.querySelectorAll('.project-card') as NodeListOf<HTMLElement>;
		const card = cards[nav.selectedIndex];
		if (!card) return;

		const containerHeight = listEl.parentElement?.clientHeight ?? 0;
		const cardTop = card.offsetTop;
		const cardHeight = card.offsetHeight;

		// Center the selected card vertically
		scrollOffset = -(cardTop + cardHeight / 2 - containerHeight / 2);
	}

	const selectedProject = $derived(
		nav.selectedIndex === projects.length
			? null
			: projects[nav.selectedIndex]
	);
</script>

<svelte:window onkeydown={nav.handleKeydown} onwheel={nav.handleWheel} />

<div class="relative size-full">
	<!-- Hero image -->
	<TurbulentImage
		src={selectedProject?.screenshotUrl ?? heroPlaceholder}
		alt={selectedProject?.projectTitle ?? 'New Project'}
		inset="0 -40% 0 40%"
		zIndex={0}
	/>

	<!-- Scrollable project list -->
	<div class="absolute left-10.5 top-45 bottom-10 w-215 overflow-visible z-2" role="listbox" tabindex="-1">
		<div class="flex flex-col gap-7.5" bind:this={listEl} style="transform: translateY({scrollOffset}px); transition: transform var(--juice-duration) var(--juice-easing);">
			{#if loading}
				<div class="project-card bg-[#f3e8d8] border-4 border-black rounded-[20px] p-7.5 shadow-[4px_4px_0px_0px_black] flex items-center justify-center" style="width: 649px;">
					<p class="font-cook font-semibold text-black text-[40px] m-0 opacity-50">LOADING...</p>
				</div>
			{:else if error}
				<div class="project-card bg-[#f3e8d8] border-4 border-black rounded-[20px] p-7.5 shadow-[4px_4px_0px_0px_black] flex items-center justify-center" style="width: 649px;">
					<p class="font-cook font-semibold text-black text-[40px] m-0 opacity-50">{error}</p>
				</div>
			{:else}
				{#each projects as project, i (project.projectId)}
					{@const selected = i === nav.selectedIndex}
					<button
						class="project-card bg-[#f3e8d8] border-4 border-black rounded-[20px] p-7.5 shadow-[4px_4px_0px_0px_black] flex flex-col items-start overflow-hidden relative cursor-pointer text-left outline-none"
						class:selected
						onpointerdown={() => { clickWasSelected = nav.selectedIndex === i; }}
						onfocus={() => { nav.selectedIndex = i; updateScroll(); }}
						onclick={() => { if (clickWasSelected) { goto(`/app/projects/${project.projectId}`) } }}
						style="width: {selected ? '824px' : '649px'}; background-color: {selected ? 'var(--selected-color)' : '#f3e8d8'}; gap: {selected ? '32px' : '0'}; transition: width var(--juice-duration) var(--juice-easing), background-color var(--selected-duration) ease, padding 0.3s ease;"
					>
						<div class="flex flex-col gap-1 z-1 w-full">
							<p class="font-cook font-semibold text-black m-0 leading-[1.1] transition-[font-size_0.3s_ease]" style="font-size: {selected ? '64px' : '40px'};">{project.projectTitle}</p>
							<p class="font-['Bricolage_Grotesque',sans-serif] font-semibold text-black m-0 transition-[font-size_0.3s_ease]" style="font-size: {selected ? '32px' : '20px'};">{project.description ?? ''}</p>
							<p class="font-['Bricolage_Grotesque',sans-serif] font-semibold text-black m-0 transition-[font-size_0.3s_ease]" style="font-size: {selected ? '32px' : '20px'};">{project.approvedHours ?? 0} hours approved</p>
						</div>

						{#if selected}
							<div class="flex items-center gap-2 z-1">
								<InputPrompt type="Enter" />

								<span class="font-['Bricolage_Grotesque',sans-serif] text-2xl font-bold text-black">OR</span>

								<InputPrompt type="click" />

								<span class="font-['Bricolage_Grotesque',sans-serif] text-2xl font-bold text-black">TO VIEW</span>
							</div>
						{/if}

						</button>
				{/each}

				<!-- Create Project Card -->
				<button
					class="project-card border-dashed bg-[#f3e8d8] border-4 border-black rounded-[20px] p-7.5 shadow-[4px_4px_0px_0px_black] flex flex-col items-start overflow-hidden relative cursor-pointer text-left outline-none"
					class:selected={nav.selectedIndex === projects.length}
					onpointerdown={() => { clickWasSelected = nav.selectedIndex === projects.length; }}
					onfocus={() => { nav.selectedIndex = projects.length; updateScroll(); }}
					onclick={() => { if (clickWasSelected) { goto('/app/projects/new'); } }}
					style="width: {nav.selectedIndex === projects.length ? '824px' : '649px'}; background-color: {nav.selectedIndex === projects.length ? 'var(--selected-color)' : '#f3e8d8'}; gap: {nav.selectedIndex === projects.length ? '32px' : '0'}; transition: width var(--juice-duration) var(--juice-easing), background-color var(--selected-duration) ease, padding 0.3s ease;"
				>
					<div class="flex flex-col gap-1 z-1 w-full">
						<p class="font-cook font-semibold text-black m-0 leading-[1.1] opacity-70 transition-[font-size_0.3s_ease]" style="font-size: {nav.selectedIndex === projects.length ? '64px' : '40px'};">+ CREATE PROJECT</p>
					</div>

					{#if nav.selectedIndex === projects.length}
						<div class="flex items-center gap-2 z-1">
							<InputPrompt type="Enter" />

							<span class="font-['Bricolage_Grotesque',sans-serif] text-2xl font-bold text-black">OR</span>

							<InputPrompt type="click" />

							<span class="font-['Bricolage_Grotesque',sans-serif] text-2xl font-bold text-black">TO CREATE</span>
						</div>
					{/if}
				</button>
			{/if}
		</div>
	</div>

	<!-- Back button -->
	<button
		class="absolute left-8 top-13 z-5 flex items-center gap-2.5 p-5 bg-[#f3e8d8] border-4 border-black rounded-[20px] shadow-[4px_4px_0px_0px_black] cursor-pointer overflow-hidden hover:bg-[#ffa936]"
		onclick={() => goto('/app?noanimate')}
		style="transition: background-color var(--selected-duration) ease, transform var(--juice-duration) var(--juice-easing);"
		onmouseenter={(e) => e.currentTarget.style.transform = 'scale(var(--juice-scale))'}
		onmouseleave={(e) => e.currentTarget.style.transform = 'scale(1)'}
	>
		<InputPrompt type="ESC" />
		<span class="font-cook text-2xl font-semibold text-black">BACK</span>
	</button>

	<NavigationHint
		segments={[
			{ type: 'text', value: 'USE' },
			{ type: 'input', value: 'WS' },
			{ type: 'text', value: 'OR' },
			{ type: 'input', value: 'mouse-scroll' },
			{ type: 'text', value: 'TO NAVIGATE' }
		]}
		position="bottom-right"
	/>
</div>