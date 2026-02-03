<script lang="ts">
	interface Props {
		text: string;
		duration?: number;
		delay?: number;
		amplitude?: number;
		disabled?: boolean;
		offset?: number;
	}

	let { text, duration = 2, delay = 0.04, amplitude = 2, disabled = false, offset = 0 }: Props = $props();

	const chars = $derived(text.split(''));
</script>

<span class="textwave" class:disabled>
	{#each chars as char, i}
		<span
			class="wave-char"
			style="--wave-delay: {(i + offset) * delay}s; --wave-duration: {duration}s; --wave-amplitude: {amplitude}px"
		>{char === ' ' ? '\u00A0' : char}</span>
	{/each}
</span>

<style>
	.textwave {
		display: inline;
	}

	.wave-char {
		display: inline-block;
		animation: wave var(--wave-duration) ease-in-out infinite;
		animation-delay: var(--wave-delay);
	}

	.disabled .wave-char {
		animation: none;
	}

	@keyframes wave {
		0%, 100% {
			transform: translateY(0);
		}
		50% {
			transform: translateY(calc(-1 * var(--wave-amplitude)));
		}
	}
</style>
