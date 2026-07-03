<template>
    <div class="pointer-events-none fixed inset-0 z-[9999] overflow-hidden">
        <div v-for="item in trailItems" :key="item.id" class="absolute rounded-lg bg-slate-400 shadow-lg" :style="{
            left: `${item.x}px`,
            top: `${item.y}px`,
            width: `${item.size}px`,
            height: `${item.size}px`,
            '--rotation': `${item.rotation}deg`,
            '--duration': `${duration}ms`,
        }"></div>
    </div>
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref } from "vue";

const trailItems = ref([]);

const duration = 1600;
const minDistance = 45;
const maxTrailItems = 14;

let lastX = 0;
let lastY = 0;
let hasLastPosition = false;
let itemId = 0;

function handleMouseMove(event) {
    const x = event.clientX;
    const y = event.clientY;

    if (hasLastPosition) {
        const distance = Math.hypot(x - lastX, y - lastY);

        if (distance < minDistance) return;
    }

    lastX = x;
    lastY = y;
    hasLastPosition = true;

    addTrailItem(x, y);
}

function addTrailItem(x, y) {
    const newItem = {
        id: itemId++,
        x,
        y,
        size: 105,
        rotation: Math.random() * 18 - 9,
    };

    trailItems.value = [...trailItems.value, newItem].slice(-maxTrailItems);

    window.setTimeout(() => {
        trailItems.value = trailItems.value.filter((item) => item.id !== newItem.id);
    }, duration);
}

function clearTrail() {
    hasLastPosition = false;
}

onMounted(() => {
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseleave", clearTrail);
});

onBeforeUnmount(() => {
    window.removeEventListener("mousemove", handleMouseMove);
    window.removeEventListener("mouseleave", clearTrail);
});
</script>

<style scoped>
div.absolute {
    transform: rotate(var(--rotation)) scale(0.9);
    animation: imageTrailFade var(--duration) cubic-bezier(0.22, 1, 0.36, 1) forwards;
}

@keyframes imageTrailFade {
    0% {
        opacity: 0;
        transform: rotate(var(--rotation)) scale(0.6);
        filter: blur(6px);
    }

    18% {
        opacity: 1;
        transform: rotate(var(--rotation)) scale(1);
        filter: blur(0);
    }

    70% {
        opacity: 0.85;
        transform: rotate(var(--rotation)) scale(1.04);
        filter: blur(0);
    }

    100% {
        opacity: 0;
        transform: rotate(var(--rotation)) scale(1.18);
        filter: blur(8px);
    }
}
</style>