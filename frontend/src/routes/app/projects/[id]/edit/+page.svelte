<script lang="ts">
	import { goto } from '$app/navigation';
	import InputPrompt from '$lib/components/InputPrompt.svelte';
	import heroPlaceholder from '$lib/assets/projects/hero-placeholder.png';

	let title = $state('');
	let projectType = $state('Windows Executable');
	let description = $state('');
	let demoUrl = $state('');
	let codeUrl = $state('');
	let readmeUrl = $state('');

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') {
			goto('/app/projects');
		}
	}

	function handleSubmit() {
		// TODO: submit project creation
	}
</script>

<svelte:window onkeydown={handleKeydown} />

<div class="relative size-full">
	<!-- Hero image -->
	<div class="hero-image">
		<img src={heroPlaceholder} alt="Project hero" />
	</div>

	<!-- Project form card -->
	<div class="form-card">
		<h1 class="form-title">Create New Project</h1>

		<div class="form-body">
			<!-- Column 1 -->
			<div class="form-col">
				<div class="field">
					<label class="field-label" for="title">Title</label>
					<input
						id="title"
						class="field-input"
						type="text"
						placeholder="Horizons"
						bind:value={title}
					/>
				</div>

				<div class="field">
					<label class="field-label" for="project-type">Project Type</label>
					<select id="project-type" class="field-input" bind:value={projectType}>
						<option>Windows Executable</option>
						<option>Mac App</option>
						<option>Web App</option>
						<option>Mobile App</option>
						<option>Other</option>
					</select>
				</div>

				<div class="field">
					<label class="field-label" for="description">Description</label>
					<textarea
						id="description"
						class="field-textarea"
						placeholder="Describe what your project does..."
						rows="4"
						bind:value={description}
					></textarea>
				</div>

				<div class="field">
					<!-- svelte-ignore a11y_label_has_associated_control -->
					<label class="field-label">Screenshot/Video</label>
					<button class="media-upload" type="button">
						<span class="media-upload-text">+ Upload Screenshot/Video</span>
					</button>
					<p class="field-hint">
						If your project is difficult to experience, we recommend uploading a video
					</p>
				</div>
			</div>

			<!-- Column 2 -->
			<div class="form-col">
				<div class="field">
					<label class="field-label" for="demo-url">Demo URL</label>
					<input
						id="demo-url"
						class="field-input"
						type="url"
						placeholder="https://username.itch.io/mygame"
						bind:value={demoUrl}
					/>
				</div>

				<div class="field">
					<label class="field-label" for="code-url">Code URL</label>
					<input
						id="code-url"
						class="field-input"
						type="url"
						placeholder="https://username.itch.io/mygame"
						bind:value={codeUrl}
					/>
				</div>

				<div class="field">
					<label class="field-label" for="readme-url">README URL</label>
					<input
						id="readme-url"
						class="field-input"
						type="url"
						placeholder="https://username.itch.io/mygame"
						bind:value={readmeUrl}
					/>
				</div>

				<div class="field">
					<!-- svelte-ignore a11y_label_has_associated_control -->
					<label class="field-label">Hackatime Projects</label>
					<button class="hackatime-btn" type="button">
						<span>Link Hackatime Projects</span>
						<svg width="16" height="16" viewBox="0 0 16 16" fill="none">
							<path d="M4 12L12 4M12 4H5M12 4V11" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
						</svg>
					</button>
				</div>
			</div>
		</div>

		<!-- Submit -->
		<div class="submit-row">
			<button class="submit-btn" type="button" onclick={handleSubmit}>
				CREATE PROJECT
			</button>
		</div>
	</div>

	<!-- Back button -->
	<button class="back-card" onclick={() => goto('/app/projects')}>
		<InputPrompt type="ESC" />
		<span class="back-text">BACK</span>
	</button>
</div>

<style>
	/* Hero image */
	.hero-image {
		position: absolute;
		left: 50%;
		top: 0;
		transform: translateX(-50%);
		width: 856px;
		height: 482px;
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

	/* Form card */
	.form-card {
		position: absolute;
		left: 50%;
		top: 207px;
		transform: translateX(calc(-50% - 0.5px));
		width: 727px;
		background-color: #f3e8d8;
		border: 4px solid black;
		border-radius: 20px;
		padding: 30px;
		box-shadow: 4px 4px 0px 0px black;
		display: flex;
		flex-direction: column;
		gap: 8px;
		overflow: clip;
		z-index: 1;
	}

	.form-title {
		font-family: 'Cook Widetype', sans-serif;
		font-size: 36px;
		font-weight: 600;
		color: black;
		margin: 0;
		line-height: normal;
	}

	/* Form body - two columns */
	.form-body {
		display: flex;
		gap: 16px;
		width: 100%;
	}

	.form-col {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 8px;
		min-width: 0;
	}

	/* Field groups */
	.field {
		display: flex;
		flex-direction: column;
		gap: 4px;
		width: 100%;
	}

	.field-label {
		font-family: 'Bricolage Grotesque', sans-serif;
		font-size: 16px;
		font-weight: 600;
		color: black;
		line-height: normal;
	}

	.field-input {
		background-color: #f3e8d8;
		border: 2px solid black;
		border-radius: 8px;
		padding: 8px 16px;
		box-shadow: 2px 2px 0px 0px black;
		font-family: 'Bricolage Grotesque', sans-serif;
		font-size: 16px;
		font-weight: 600;
		color: black;
		width: 100%;
		outline: none;
		appearance: none;
	}

	.field-input::placeholder {
		color: rgba(0, 0, 0, 0.5);
	}

	.field-textarea {
		background-color: #f3e8d8;
		border: 2px solid black;
		border-radius: 8px;
		padding: 8px 16px;
		box-shadow: 2px 2px 0px 0px black;
		font-family: 'Bricolage Grotesque', sans-serif;
		font-size: 16px;
		font-weight: 600;
		color: black;
		width: 100%;
		outline: none;
		resize: none;
	}

	.field-textarea::placeholder {
		color: rgba(0, 0, 0, 0.5);
	}

	/* Media upload */
	.media-upload {
		background-color: #f3e8d8;
		border: 2px solid black;
		border-radius: 8px;
		padding: 16px;
		box-shadow: 2px 2px 0px 0px black;
		width: 100%;
		cursor: pointer;
		transition:
			background-color var(--selected-duration) ease,
			transform var(--juice-duration) var(--juice-easing);
	}

	.media-upload:hover {
		background-color: #ffa936;
		transform: scale(var(--juice-scale));
	}

	.media-upload-text {
		font-family: 'Bricolage Grotesque', sans-serif;
		font-size: 16px;
		font-weight: 600;
		color: rgba(0, 0, 0, 0.5);
		text-align: center;
		display: block;
	}

	.field-hint {
		font-family: 'Bricolage Grotesque', sans-serif;
		font-size: 12px;
		font-weight: 600;
		color: rgba(0, 0, 0, 0.6);
		margin: 0;
		line-height: normal;
	}

	/* Hackatime button */
	.hackatime-btn {
		background-color: #fc5b3c;
		border: 2px solid black;
		border-radius: 8px;
		padding: 8px 16px;
		width: 100%;
		display: flex;
		align-items: center;
		justify-content: space-between;
		cursor: pointer;
		font-family: 'Bricolage Grotesque', sans-serif;
		font-size: 16px;
		font-weight: 600;
		color: black;
		transition:
			transform var(--juice-duration) var(--juice-easing);
	}

	.hackatime-btn:hover {
		transform: scale(var(--juice-scale));
	}

	/* Submit row */
	.submit-row {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 100%;
	}

	.submit-btn {
		background-color: #ffa936;
		border: 2px solid black;
		border-radius: 8px;
		padding: 8px 16px;
		width: 415px;
		font-family: 'Bricolage Grotesque', sans-serif;
		font-size: 16px;
		font-weight: 600;
		color: black;
		cursor: pointer;
		transition:
			transform var(--juice-duration) var(--juice-easing);
	}

	.submit-btn:hover {
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
