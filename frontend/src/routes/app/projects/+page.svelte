<script lang="ts">
	import { tick } from 'svelte';
	import heroPlaceholder from '$lib/assets/projects/hero-placeholder.png';
	import mouseScrollSvg from '$lib/assets/projects/mouse-scroll.svg';
    import { goto } from '$app/navigation';

	interface Project {
		id: string;
		title: string;
		description: string;
		hoursLogged: number;
		image: string;
	}

	const projects: Project[] = [
		{
			id: '1',
			title: 'TEST PROJECT 1',
			description: 'Description',
			hoursLogged: 12,
			image: heroPlaceholder
		},
		{
			id: '2',
			title: 'TEST PROJECT 2',
			description: 'Description',
			hoursLogged: 8,
			image: heroPlaceholder
		},
		{
			id: '3',
			title: 'TEST PROJECT 3',
			description: 'Description',
			hoursLogged: 3,
			image: heroPlaceholder
		},
		{
			id: '4',
			title: 'TEST PROJECT 1',
			description: 'Description',
			hoursLogged: 12,
			image: heroPlaceholder
		},
		{
			id: '5',
			title: 'TEST PROJECT 2',
			description: 'Description',
			hoursLogged: 8,
			image: heroPlaceholder
		},
		{
			id: '6',
			title: 'TEST PROJECT 3',
			description: 'Description',
			hoursLogged: 3,
			image: heroPlaceholder
		}        
	];

	let selectedIndex = $state(0);
	let scrollOffset = $state(0);
	let listEl: HTMLDivElement;
	let wheelAccumulator = 0;
	const WHEEL_THRESHOLD = 80;

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'w' || e.key === 'ArrowUp') {
			e.preventDefault();
			selectedIndex = Math.max(0, selectedIndex - 1);
			updateScroll();
		} else if (e.key === 's' || e.key === 'ArrowDown') {
			e.preventDefault();
			selectedIndex = Math.min(projects.length - 1, selectedIndex + 1);
			updateScroll();
		} else if (e.key === 'Escape') {
			goto('/app?noanimate')
		} else if (e.key === 'Enter') {
			const project = projects[selectedIndex];
			if (project) {
				// navigate to project detail
			}
		}
	}

	function handleWheel(e: WheelEvent) {
		e.preventDefault();
		wheelAccumulator += e.deltaY;

		if (wheelAccumulator > WHEEL_THRESHOLD) {
			wheelAccumulator = 0;
			selectedIndex = Math.min(projects.length - 1, selectedIndex + 1);
			updateScroll();
		} else if (wheelAccumulator < -WHEEL_THRESHOLD) {
			wheelAccumulator = 0;
			selectedIndex = Math.max(0, selectedIndex - 1);
			updateScroll();
		}
	}

	async function updateScroll() {
		await tick();
		if (!listEl) return;
		const cards = listEl.querySelectorAll('.project-card') as NodeListOf<HTMLElement>;
		const card = cards[selectedIndex];
		if (!card) return;

		const containerHeight = listEl.parentElement?.clientHeight ?? 0;
		const cardTop = card.offsetTop;
		const cardHeight = card.offsetHeight;

		// Center the selected card vertically
		scrollOffset = -(cardTop + cardHeight / 2 - containerHeight / 2);
	}

	const selectedProject = $derived(projects[selectedIndex]);
</script>

<svelte:window onkeydown={handleKeydown} onwheel={handleWheel} />

<div class="relative size-full">
	<!-- Hero image -->
	<div class="hero-image">
		<img src={selectedProject.image} alt={selectedProject.title} />
	</div>

	<!-- Scrollable project list -->
	<div class="projects-scroll" role="listbox" tabindex="-1">
		<div class="projects-list" bind:this={listEl} style="transform: translateY({scrollOffset}px)">
			{#each projects as project, i (project.id)}
				{@const selected = i === selectedIndex}
				<button
					class="project-card"
					class:selected
					onclick={() => { selectedIndex = i; }}
				>
					<div class="details">
						<p class="title">{project.title}</p>
						<p class="subtitle">{project.description}</p>
						<p class="subtitle">{project.hoursLogged} hours logged</p>
					</div>

					{#if selected}
						<div class="controls">
							<div class="key-dark">
								<svg width="14" height="12" viewBox="0 0 16 14" fill="none" xmlns="http://www.w3.org/2000/svg">
									<path d="M14 1V5C14 6.10457 13.1046 7 12 7H2M2 7L6 3M2 7L6 11" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
								</svg>
								<span>ENTER</span>
							</div>

							<span class="controls-text">OR</span>

							<svg class="click-icon" width="28" height="32" viewBox="0 0 28 32" fill="none" xmlns="http://www.w3.org/2000/svg">
								<path d="M10 0L10 20L14.5 16L19 26L23 24.5L18.5 14.5L24 13L10 0Z" fill="black" stroke="black" stroke-width="1.5" stroke-linejoin="round"/>
								<path d="M3 25L1 27" stroke="black" stroke-width="2.5" stroke-linecap="round"/>
								<path d="M0.5 17H3.5" stroke="black" stroke-width="2.5" stroke-linecap="round"/>
								<path d="M5 7L3 5" stroke="black" stroke-width="2.5" stroke-linecap="round"/>
								<path d="M20 5L18 7" stroke="black" stroke-width="2.5" stroke-linecap="round"/>
							</svg>

							<span class="controls-text">TO VIEW</span>
						</div>
					{/if}

					</button>
			{/each}
		</div>
	</div>

	<!-- Back button -->
	<button class="back-card" onclick={() => goto('/app?noanimate')}>
		<div class="key-light key-esc">ESC</div>
		<span class="back-text">BACK</span>
	</button>

	<!-- Navigate hint -->
	<div class="nav-hint">
		<span class="nav-text">USE</span>
		<div class="key-light key-letter">W</div>
		<div class="key-light key-letter">S</div>
		<span class="nav-text">OR</span>
		<img src={mouseScrollSvg} alt="Mouse scroll" class="mouse-icon" />
		<span class="nav-text">TO NAVIGATE</span>
	</div>
</div>

<style>
	/* Hero image */
	.hero-image {
		position: absolute;
		top: 50%;
		right: -200px;
		transform: translateY(-50%);
		width: 1100px;
		height: 620px;
		border-radius: 24px;
		overflow: hidden;
		z-index: 0;
		pointer-events: none;
	}

	.hero-image img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	/* Project list scroll area */
	.projects-scroll {
		position: absolute;
		left: 42px;
		top: 180px;
		bottom: 40px;
		width: 860px;
		overflow: visible;
		z-index: 2;
	}

	.projects-list {
		display: flex;
		flex-direction: column;
		gap: 30px;
		transition: transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
	}

	/* Project cards */
	.project-card {
		background-color: #f3e8d8;
		border: 4px solid black;
		border-radius: 20px;
		padding: 30px;
		box-shadow: 4px 4px 0px 0px black;
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		overflow: hidden;
		position: relative;
		width: 649px;
		cursor: pointer;
		text-align: left;
		transition:
			width 0.35s cubic-bezier(0.34, 1.56, 0.64, 1),
			background-color 0.25s ease,
			padding 0.3s ease;
	}

	.project-card.selected {
		background-color: #ffa936;
		width: 824px;
		gap: 32px;
	}

	/* Details */
	.details {
		display: flex;
		flex-direction: column;
		gap: 4px;
		z-index: 1;
		width: 100%;
	}

	.title {
		font-family: 'Cook Widetype', sans-serif;
		font-size: 40px;
		font-weight: 600;
		color: black;
		margin: 0;
		line-height: 1.1;
		transition: font-size 0.3s ease;
	}

	.project-card.selected .title {
		font-size: 64px;
	}

	.subtitle {
		font-family: 'Bricolage Grotesque', sans-serif;
		font-size: 20px;
		font-weight: 600;
		color: black;
		margin: 0;
		transition: font-size 0.3s ease;
	}

	.project-card.selected .subtitle {
		font-size: 32px;
	}

	/* Controls (selected card only) */
	.controls {
		display: flex;
		align-items: center;
		gap: 8px;
		z-index: 1;
	}

	.controls-text {
		font-family: 'Bricolage Grotesque', sans-serif;
		font-size: 24px;
		font-weight: 700;
		color: black;
	}

	.click-icon {
		flex-shrink: 0;
	}

	/* Dark ENTER key */
	.key-dark {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 6px;
		padding: 12px 16px;
		background-color: #3d3d3d;
		border: 4px solid black;
		border-radius: 12px;
		box-shadow: 0 4px 0 0 black;
		flex-shrink: 0;
	}

	.key-dark span {
		font-family: 'Cook Widetype', sans-serif;
		font-size: 16px;
		font-weight: 600;
		color: white;
	}

	/* Light keys (ESC, W, S) */
	.key-light {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		background-color: #f3e8d8;
		border: 4px solid black;
		border-radius: 12px;
		box-shadow: 0 4px 0 0 black;
		font-family: 'Cook Widetype', sans-serif;
		font-weight: 600;
		color: black;
		flex-shrink: 0;
	}

	.key-esc {
		padding: 14px 12px;
		font-size: 18px;
	}

	.key-letter {
		width: 52px;
		height: 52px;
		font-size: 20px;
	}

	/* Back button */
	.back-card {
		position: absolute;
		left: 32px;
		top: 52px;
		z-index: 5;
		display: flex;
		align-items: center;
		gap: 10px;
		padding: 20px;
		background-color: #f3e8d8;
		border: 4px solid black;
		border-radius: 20px;
		box-shadow: 4px 4px 0px 0px black;
		cursor: pointer;
		overflow: hidden;
	}

	.back-card:hover {
		background-color: #ffa936;
	}

	.back-text {
		font-family: 'Cook Widetype', sans-serif;
		font-size: 24px;
		font-weight: 600;
		color: black;
	}

	/* Navigate hint */
	.nav-hint {
		position: absolute;
		bottom: 35px;
		right: 24px;
		z-index: 5;
		display: flex;
		align-items: center;
		gap: 10px;
		padding: 20px;
		background-color: #f3e8d8;
		border: 4px solid black;
		border-radius: 20px;
		box-shadow: 4px 4px 0px 0px black;
		overflow: hidden;
	}

	.nav-text {
		font-family: 'Cook Widetype', sans-serif;
		font-size: 24px;
		font-weight: 600;
		color: black;
		flex-shrink: 0;
	}

	.mouse-icon {
		height: 48px;
		width: auto;
		flex-shrink: 0;
	}


</style>
