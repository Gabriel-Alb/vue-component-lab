<template>
  <div class="animated-title">
    <span
      v-for="(letter, index) in letters"
      :key="`${letter}-${index}`"
      class="animated-title__letter"
      :style="{ '--delay': `${index * 90}ms` }"
    >
      {{ letter === " " ? "\u00A0" : letter }}
    </span>
  </div>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  text: {
    type: String,
    default: "HOLÍSTICO",
  },
});

const letters = computed(() => [...props.text]);
</script>

<style scoped>
.animated-title {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  perspective: 800px;
}

.animated-title__letter {
  display: inline-block;
  font-family: "Arial Black", "Montserrat", sans-serif;
  font-size: clamp(2rem, 6vw, 5rem);
  font-weight: 900;
  letter-spacing: 0.06em;
  color: #f5efff;
  text-transform: uppercase;
  animation:
    letterEntrance 1.2s cubic-bezier(0.2, 0.8, 0.2, 1) both,
    letterGlow 2.4s ease-in-out infinite;
  animation-delay: var(--delay), calc(1.2s + var(--delay));
  text-shadow:
    0 0 5px rgba(255, 255, 255, 0.9),
    0 0 12px rgba(192, 132, 252, 0.85),
    0 0 24px rgba(147, 51, 234, 0.75),
    0 0 45px rgba(107, 33, 168, 0.55);
  transform-origin: center;
}

@keyframes letterEntrance {
  0% {
    opacity: 0;
    transform: translateY(35px) rotateX(-90deg) scale(0.5);
    filter: blur(12px);
  }

  60% {
    opacity: 1;
    transform: translateY(-6px) rotateX(10deg) scale(1.08);
    filter: blur(0);
  }

  100% {
    opacity: 1;
    transform: translateY(0) rotateX(0) scale(1);
    filter: blur(0);
  }
}

@keyframes letterGlow {
  0%,
  100% {
    transform: translateY(0) scale(1);
    text-shadow:
      0 0 5px rgba(255, 255, 255, 0.9),
      0 0 12px rgba(192, 132, 252, 0.85),
      0 0 24px rgba(147, 51, 234, 0.75),
      0 0 45px rgba(107, 33, 168, 0.55);
  }

  50% {
    transform: translateY(-5px) scale(1.05);
    text-shadow:
      0 0 8px #ffffff,
      0 0 18px rgba(216, 180, 254, 1),
      0 0 35px rgba(168, 85, 247, 0.95),
      0 0 65px rgba(126, 34, 206, 0.8);
  }
}

@media (prefers-reduced-motion: reduce) {
  .animated-title__letter {
    animation: none;
  }
}
</style>