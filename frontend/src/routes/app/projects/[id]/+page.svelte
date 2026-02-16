<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import heroPlaceholder from '$lib/assets/projects/hero-placeholder.png';
	import InputPrompt from '$lib/components/InputPrompt.svelte';

	const projectId = $derived($page.params.id);

	// TODO: replace with real data fetch
	const project = $derived({
		id: projectId,
		title: `MY PROJECT ${projectId}`,
		description: 'Description',
		image: heroPlaceholder
	});

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') {
			goto('/app/projects?noanimate');
		}
	}
</script>

<svelte:window onkeydown={handleKeydown} />

<div class="relative size-full">
	<!-- Hero image -->
	<div class="hero-image">
		<img src={project.image} alt={project.title} class="size-full object-cover rounded-[24px]" />
	</div>

	<!-- Project details card -->
	<div class="project-card">
		<div class="details">
			<p class="title">{project.title}</p>
			<p class="subtitle">{project.description}</p>
		</div>

		<div class="actions">
			<button class="action-btn" onclick={() => goto(`/app/projects/${projectId}/edit`)}>
				EDIT PROJECT
			</button>
			<button class="action-btn">
				RESUBMIT
			</button>
		</div>
	</div>

	<!-- Back button -->
	<button class="back-card" onclick={() => goto('/app/projects?noanimate')}>
		<InputPrompt type="ESC" />
		<span class="back-text">BACK</span>
	</button>
</div>

<style>
	/* Hero image */
	.hero-image {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, calc(-50% - 73px));
		width: 856px;
		height: 482px;
		z-index: 0;
		pointer-events: none;
	}

	/* Project details card */
	.project-card {
		position: absolute;
		bottom: 80px;
		left: 50%;
		transform: translateX(calc(-50% - 0.5px));
		width: 727px;
		background-color: #f3e8d8;
		border: 4px solid black;
		border-radius: 20px;
		padding: 30px;
		box-shadow: 4px 4px 0px 0px black;
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: 32px;
		overflow: hidden;
		z-index: 2;
	}

	.details {
		display: flex;
		flex-direction: column;
		gap: 8px;
		width: 100%;
	}

	.title {
		font-family: 'Cook Widetype', sans-serif;
		font-size: 36px;
		font-weight: 600;
		color: black;
		margin: 0;
	}

	.subtitle {
		font-family: 'Bricolage Grotesque', sans-serif;
		font-size: 32px;
		font-weight: 600;
		color: black;
		margin: 0;
	}

	/* Action buttons */
	.actions {
		display: flex;
		gap: 10px;
		width: 100%;
		justify-content: center;
	}

	.action-btn {
		width: 281px;
		padding: 8px 16px;
		background-color: #ffa936;
		border: 2px solid black;
		border-radius: 8px;
		font-family: 'Bricolage Grotesque', sans-serif;
		font-size: 16px;
		font-weight: 600;
		color: black;
		cursor: pointer;
		overflow: hidden;
		transition:
			background-color var(--selected-duration) ease,
			transform var(--juice-duration) var(--juice-easing);
	}

	.action-btn:hover {
		transform: scale(var(--juice-scale));
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
		transition:
			background-color var(--selected-duration) ease,
			transform var(--juice-duration) var(--juice-easing);
	}

	.back-card:hover {
		background-color: #ffa936;
		transform: scale(var(--juice-scale));
	}

	.back-text {
		font-family: 'Cook Widetype', sans-serif;
		font-size: 24px;
		font-weight: 600;
		color: black;
	}
</style>
