<script lang="ts">
    import { onMount } from 'svelte';

    interface Props {
        text?: string;
        fontSize?: number;
        wave?: boolean;
        pressed?: boolean;
        disableAnimations?: boolean;
    }

    let { text = ">PRESS ENTER", fontSize = 32, wave = false, pressed = false, disableAnimations = false }: Props = $props();
    
    const shouldWave = $derived(wave && !disableAnimations);

    let textEl: SVGTextElement;
    let measureEl: SVGTextElement;
    let svgWidth = $state(0);
    let charWidths = $state<number[]>([]);
    let waveTime = $state(0);
    let animationFrame: number;
    let measured = false;

    const chars = $derived(text.split(''));
    const spacing = 8;
    const charPositions = $derived(() => {
        let x = 5 - (spacing * chars.length)/2;
        return chars.map((_, i) => {
            const pos = x;
            x += charWidths[i] || fontSize * 0.6;
            x += spacing;
            return pos;
        });
    });

    function getWaveOffset(i: number): number {
        if (pressed) return 0;
        return Math.sin((waveTime / 400) + (i * 0.2)) * 3;
    }

    onMount(() => {
        updateWidth();
        
        if (shouldWave) {
            let startTime = performance.now();
            function animate() {
                if (!pressed) {
                    waveTime = performance.now() - startTime;
                }
                animationFrame = requestAnimationFrame(animate);
            }
            animate();
        }
        
        return () => {
            if (animationFrame) cancelAnimationFrame(animationFrame);
        };
    });

    function updateWidth() {
        const el = measureEl || textEl;
        if (el && !measured) {
            const bbox = el.getBBox();
            svgWidth = bbox.width + 22;
            
            if (shouldWave) {
                const tempWidths: number[] = [];
                for (let i = 0; i < chars.length; i++) {
                    const extent = el.getExtentOfChar(i);
                    tempWidths.push(extent.width);
                }
                charWidths = tempWidths;
                measured = true;
            }
        }
    }

    $effect(() => {
        text;
        fontSize;
        measured = false;
        updateWidth();
    });
</script>

<div class="boba-container">
    <svg width={svgWidth || 'auto'} height={fontSize + 22} overflow="visible" fill="none" xmlns="http://www.w3.org/2200/svg">
        <!-- Hidden measurement text -->
        <text bind:this={measureEl} fill="black" stroke="#F9F3EB" style="white-space: pre; paint-order: stroke; opacity: 0; pointer-events: none;" stroke-width="22" stroke-linejoin="round" xml:space="preserve" font-family="Cook Widetype" font-size={fontSize} font-weight="600" letter-spacing="0em"><tspan x="5" y={fontSize}>{text}</tspan></text>
        
        {#if shouldWave && charWidths.length > 0}
            <text class="boba-shadow" class:pressed={pressed} stroke="black" style="white-space: pre; paint-order: stroke" stroke-width="22" stroke-linejoin="round" xml:space="preserve" font-family="Cook Widetype" font-size={fontSize} font-weight="600" letter-spacing="0em">
                {#each chars as char, i}
                    <tspan x={charPositions()[i]} y={fontSize + getWaveOffset(i)}>{char}</tspan>
                {/each}
            </text>
            <text class="front" class:pressed={pressed} bind:this={textEl} fill="black" stroke={pressed ? '#FFA936' : '#F9F3EB'} style="white-space: pre; paint-order: stroke; transition: stroke 0.15s ease;" stroke-width="15" stroke-linejoin="round" xml:space="preserve" font-family="Cook Widetype" font-size={fontSize} font-weight="600" letter-spacing="0em">
                {#each chars as char, i}
                    <tspan x={charPositions()[i]} y={fontSize + getWaveOffset(i)}>{char}</tspan>
                {/each}
            </text>
        {:else}
            <text class="boba-shadow" class:pressed={pressed} stroke="black" style="white-space: pre; paint-order: stroke" stroke-width="22" stroke-linejoin="round" xml:space="preserve" font-family="Cook Widetype" font-size={fontSize} font-weight="600" letter-spacing="0em"><tspan x="5" y={fontSize}>{text}</tspan></text>
            <text class="front" class:pressed={pressed} bind:this={textEl} fill="black" stroke={pressed ? '#FFA936' : '#F9F3EB'} style="white-space: pre; paint-order: stroke; transition: stroke 0.15s ease;" stroke-width="15" stroke-linejoin="round" xml:space="preserve" font-family="Cook Widetype" font-size={fontSize} font-weight="600" letter-spacing="0em"><tspan x="5" y={fontSize}>{text}</tspan></text>
        {/if}
    </svg>
</div>

<style>
    .boba-container {
        display: inline-block;
    }
    
    .boba-container svg {
        display: block;
    }

    .boba-shadow {
        -webkit-filter: drop-shadow( 3px 3px 0px rgba(0, 0, 0, 1));
        
        filter: drop-shadow( 3px 3px 0px rgba(0, 0, 0, 1));
        transition: transform 0.15s cubic-bezier(0.34, 1.56, 0.64, 1), filter 0.15s ease;
    }

    .boba-shadow.pressed {
        -webkit-filter: drop-shadow( 0px 0px 0px rgba(0, 0, 0, 1));
        filter: drop-shadow( 0px 0px 0px rgba(0, 0, 0, 1));

        transform: translate(3px, 3px);
    }

    .front {
    	transition: transform 0.15s cubic-bezier(0.34, 1.56, 0.64, 1);
    }

    .front.pressed {
        transform: translate(3px, 3px);
    }
</style>
