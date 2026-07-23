<template>
  <div class="purple-wave-title">
    <span
      v-for="(letter, index) in letters"
      :key="`${letter}-${index}`"
      class="purple-wave-title__letter"
      :style="{ '--delay': `${index * 80}ms` }"
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
    default: "Purple Wave",
  },
});

const letters = computed(() => [...props.text]);
</script>

<style scoped>
.purple-wave-title {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.purple-wave-title__letter {
  display: inline-block;
  font-family: "Arial Black", "Montserrat", sans-serif;
  font-size: clamp(2rem, 6vw, 5rem);
  font-weight: 900;
  letter-spacing: 0.05em;
  color: #f5edff;
  text-transform: uppercase;
  animation: purpleWave 1.8s ease-in-out infinite;
  animation-delay: var(--delay);
  text-shadow:
    0 0 8px rgba(233, 213, 255, 0.95),
    0 0 18px rgba(192, 132, 252, 0.8),
    0 0 35px rgba(147, 51, 234, 0.65);
}

@keyframes purpleWave {
  0%,
  100% {
    transform: translateY(0) rotate(0);
  }

  50% {
    transform: translateY(-12px) rotate(-2deg);
  }
}

@media (prefers-reduced-motion: reduce) {
  .purple-wave-title__letter {
    animation: none;
  }
}
</style>