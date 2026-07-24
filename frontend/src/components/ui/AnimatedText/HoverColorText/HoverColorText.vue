<template>
  <div
    class="color-text"
    role="text"
    :aria-label="text"
  >
    <span
      v-for="(letter, index) in letters"
      :key="`${letter}-${index}`"
      class="color-text__letter"
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
  name: "HoverColorText",
});

const props = defineProps({
  text: {
    type: String,
    default: "COLOR SHIFT",
  },
});

const colors = [
  "#c084fc",
  "#a78bfa",
  "#818cf8",
  "#60a5fa",
  "#22d3ee",
  "#2dd4bf",
  "#f472b6",
];

const letters = computed(() => Array.from(props.text));

function getLetterStyle(index) {
  return {
    "--hover-color": colors[index % colors.length],
    "--delay": `${index * 35}ms`,
  };
}
</script>

<style scoped>
.color-text {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 20px 28px;
  cursor: pointer;
  user-select: none;
  white-space: nowrap;
}

.color-text__letter {
  display: inline-block;
  color: #e9d5ff;
  font-size: clamp(2rem, 5vw, 4.5rem);
  font-weight: 800;
  line-height: 1;
  letter-spacing: -0.04em;
  text-shadow: 0 0 18px rgba(168, 85, 247, 0.2);
  transform: translateY(0) scale(1);
  transition:
    color 350ms ease,
    text-shadow 350ms ease,
    transform 350ms cubic-bezier(0.16, 1, 0.3, 1);
  transition-delay: var(--delay);
}

.color-text:hover .color-text__letter {
  color: var(--hover-color);
  text-shadow:
    0 0 10px var(--hover-color),
    0 0 26px color-mix(in srgb, var(--hover-color) 55%, transparent);
  transform: translateY(-5px) scale(1.05);
}

.color-text:hover .color-text__letter:nth-child(even) {
  transform: translateY(5px) scale(1.05);
}

@media (prefers-reduced-motion: reduce) {
  .color-text__letter {
    transition-duration: 0ms;
  }
}
</style>