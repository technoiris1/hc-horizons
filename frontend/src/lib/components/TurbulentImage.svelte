<script lang="ts">
	interface Props {
		src: string;
		alt: string;
		/** Inset positioning (CSS inset format: top right bottom left) */
		inset?: string;
		/** Filter ID to avoid conflicts when using multiple instances */
		filterId?: string;
		/** Scale factor for the image */
		scale?: number;
		/** Displacement scale for the turbulence effect */
		displacementScale?: number;
		/** Turbulence base frequency */
		baseFrequency?: string;
		/** Animation duration for the hue rotation */
		animationDuration?: string;
		/** z-index for layering */
		zIndex?: number;
		/** Additional CSS classes for the container */
		class?: string;
	}

	let {
		src,
		alt,
		inset = '0 -40% 0 40%',
		filterId = 'turbulence',
		scale = 1.2,
		displacementScale = 25,
		baseFrequency = '0.01 0.02',
		animationDuration = '5s',
		zIndex = 0,
		class: className = ''
	}: Props = $props();
</script>

<svg class="absolute w-0 h-0 overflow-hidden" aria-hidden="true">
	<filter id={filterId}>
		<feTurbulence type="turbulence" baseFrequency={baseFrequency} numOctaves="2" seed="2" result="noise" />
		<feColorMatrix type="hueRotate" values="0" result="rotatedNoise">
			<animate attributeName="values" from="0" to="360" dur={animationDuration} repeatCount="indefinite" />
		</feColorMatrix>
		<feDisplacementMap in="SourceGraphic" in2="rotatedNoise" scale={displacementScale} xChannelSelector="R" yChannelSelector="G" />
	</filter>
</svg>
<div
	class="absolute h-full overflow-visible pointer-events-none {className}"
	style="inset: {inset}; z-index: {zIndex};"
>
	<img
		{src}
		{alt}
		class="w-full h-full object-cover"
		style="filter: url(#{filterId}); transform: scale({scale});"
	/>
</div>
