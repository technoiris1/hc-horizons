<script lang="ts">
    interface Props {
        class?: string;
        duration?: number;
        angle?: number;
    }

    let { class: className = '', duration = 1200, angle = 15 }: Props = $props();
</script>

<div class="slide-in-out {className}" style="--duration: {duration}ms; --angle: {angle}deg"></div>

<style>
    .slide-in-out {
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
        animation: slide-in-out var(--duration) ease-in-out forwards;
    }

    @keyframes slide-in-out {
        0% {
            transform: rotate(var(--angle)) translateX(-100%);
        }
        50% {
            transform: rotate(var(--angle)) translateX(0%);
        }
        100% {
            transform: rotate(var(--angle)) translateX(100%);
        }
    }
</style>
