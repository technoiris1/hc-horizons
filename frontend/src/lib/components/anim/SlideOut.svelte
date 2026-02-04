<script lang="ts">
    interface Props {
        class?: string;
        duration?: number;
        angle?: number;
    }

    let { class: className = '', duration = 1200, angle = 15 }: Props = $props();
</script>

<div class="slide-out {className}" style="--duration: {duration}ms; --angle: {angle}deg"></div>

<style>
    .slide-out {
        position: fixed;
        inset: -50%;
        width: 300%;
        height: 200%;
        margin-left: -100%;
        background: linear-gradient(
            to right,
            black 0%,
            black 90%,
            transparent 90%,
            transparent 100%
        );
        z-index: 100;
        pointer-events: none;
        transform: rotate(var(--angle)) translateX(-100%);
        animation: slide-angle var(--duration) ease-out forwards;
    }

    @keyframes slide-angle {
        0% {
            transform: rotate(var(--angle)) translateX(-100%);
        }
        100% {
            transform: rotate(var(--angle)) translateX(30%);
        }
    }
</style>
