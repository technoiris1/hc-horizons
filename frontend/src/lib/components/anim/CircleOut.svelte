<script lang="ts">
    interface Props {
        class?: string;
    }

    let { class: className = '' }: Props = $props();
</script>

<div class="trans-am {className}">
    <div class="circle"></div>
</div>

<style>
    .trans-am {
        position: fixed;
        inset: 0;
        pointer-events: none;
        z-index: 100;
        overflow: hidden;
    }

    .circle {
        position: absolute;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
        border-radius: 50%;
        background: black;
        animation: expand 1s ease-out forwards;
        animation-delay: 100ms;
        width: 0;
        height: 0;
    }

    @keyframes expand {
        0% {
            width: 0;
            height: 0;
        }
        100% {
            width: 300vmax;
            height: 300vmax;
        }
    }
</style>
