<template>
  <div
    class="spread-text"
    role="text"
    :aria-label="text"
  >
    <span
      v-for="(letter, index) in letters"
      :key="`${letter}-${index}`"
      class="spread-text__letter"
      aria-hidden="true"
      :style="getLetterStyle(index)"
    >
      {{ letter === " " ? "\u00A0" : letter }}
    </span>
  </div>
</template>

<script setup>
import { computed } from "vue";

defineOptions({
  name: "HoverSpreadText",
});

const props = defineProps({
  text: {
    type: String,
    default: "SPREAD TEXT",
  },
});

const letters = computed(() => Array.from(props.text));

function getLetterStyle(index) {
  const center = (letters.value.length - 1) / 2;
  const distanceFromCenter = index - center;

  return {
    "--spread-x": `${distanceFromCenter * 9}px`,
    "--spread-y": `${Math.sin((index + 1) * 1.6) * 13}px`,
    "--spread-rotation": `${distanceFromCenter * 2.5}deg`,
    "--delay": `${Math.abs(distanceFromCenter) * 12}ms`,
  };
}
</script>

<style scoped>
.spread-text {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 24px 42px;
  cursor: pointer;
  user-select: none;
  white-space: nowrap;
}

.spread-text__letter {
  display: inline-block;
  color: #a855f7;
  font-size: clamp(2rem, 5vw, 4.5rem);
  font-weight: 800;
  line-height: 1;
  letter-spacing: -0.04em;
  text-shadow: 0 0 22px rgba(168, 85, 247, 0.25);
  transform: translate3d(0, 0, 0) rotate(0deg);
  transition:
    color 300ms ease,
    text-shadow 300ms ease,
    transform 550ms cubic-bezier(0.16, 1, 0.3, 1);
  transition-delay: var(--delay);
  will-change: transform;
}

.spread-text:hover .spread-text__letter {
  color: #c084fc;
  text-shadow:
    0 0 12px rgba(192, 132, 252, 0.7),
    0 0 32px rgba(168, 85, 247, 0.35);
  transform:
    translate3d(
      var(--spread-x),
      var(--spread-y),
      0
    )
    rotate(var(--spread-rotation));
}

@media (prefers-reduced-motion: reduce) {
  .spread-text__letter {
    transition-duration: 0ms;
  }
}
</style>