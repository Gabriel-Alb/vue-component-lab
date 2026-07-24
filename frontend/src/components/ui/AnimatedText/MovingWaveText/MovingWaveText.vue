<template>
  <div
    class="moving-text"
    role="text"
    :aria-label="text"
  >
    <span
      v-for="(letter, index) in letters"
      :key="`${letter}-${index}`"
      class="moving-text__letter"
      aria-hidden="true"
      :style="{ '--delay': `${index * 90}ms` }"
    >
      {{ letter === " " ? "\u00A0" : letter }}
    </span>
  </div>
</template>

<script setup>
import { computed } from "vue";

defineOptions({
  name: "MovingWaveText",
});

const props = defineProps({
  text: {
    type: String,
    default: "MOVING TEXT",
  },
});

const letters = computed(() => Array.from(props.text));
</script>

<style scoped>
.moving-text {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 24px 32px;
  cursor: pointer;
  user-select: none;
  white-space: nowrap;
  animation: moving-text-drift 4s ease-in-out infinite;
}

.moving-text__letter {
  display: inline-block;
  color: #c084fc;
  font-size: clamp(2rem, 5vw, 4.5rem);
  font-weight: 800;
  line-height: 1;
  letter-spacing: -0.04em;
  text-shadow:
    0 0 12px rgba(192, 132, 252, 0.45),
    0 0 30px rgba(168, 85, 247, 0.2);
  animation: moving-text-wave 1.8s ease-in-out infinite;
  animation-delay: var(--delay);
  will-change: transform;
}

.moving-text:hover .moving-text__letter {
  animation-duration: 700ms;
}

@keyframes moving-text-wave {
  0%,
  100% {
    transform: translateY(0) rotate(0deg);
  }

  25% {
    transform: translateY(-10px) rotate(-3deg);
  }

  50% {
    transform: translateY(2px) rotate(0deg);
  }

  75% {
    transform: translateY(8px) rotate(3deg);
  }
}

@keyframes moving-text-drift {
  0%,
  100% {
    transform: translateX(-5px);
  }

  50% {
    transform: translateX(5px);
  }
}

@media (prefers-reduced-motion: reduce) {
  .moving-text,
  .moving-text__letter {
    animation: none;
  }
}
</style>