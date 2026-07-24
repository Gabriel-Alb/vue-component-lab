<template>
  <div class="aurora-title">
    <span
      v-for="(letter, index) in letters"
      :key="`${letter}-${index}`"
      class="aurora-title__letter"
      :style="{ '--delay': `${index * 70}ms` }"
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
    default: "AURORA",
  },
});

const letters = computed(() => [...props.text]);
</script>

<style scoped>
.aurora-title {
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  font-family: Inter, Arial, sans-serif;
  font-size: clamp(2rem, 6vw, 5rem);
  font-weight: 900;
  letter-spacing: 0.08em;
  line-height: 1;
}

.aurora-title__letter {
  display: inline-block;
  color: transparent;
  background-image: linear-gradient(
    120deg,
    #7c3aed,
    #c026d3,
    #2563eb,
    #8b5cf6,
    #7c3aed
  );
  background-size: 300% 300%;
  background-clip: text;
  -webkit-background-clip: text;
  animation:
    aurora-gradient 4s linear infinite,
    aurora-entry 700ms cubic-bezier(0.2, 0.8, 0.2, 1) both;
  animation-delay: var(--delay);
}

@keyframes aurora-gradient {
  0% {
    background-position: 0% 50%;
  }

  50% {
    background-position: 100% 50%;
  }

  100% {
    background-position: 0% 50%;
  }
}

@keyframes aurora-entry {
  0% {
    opacity: 0;
    transform: translateY(35px) rotateX(-70deg);
  }

  100% {
    opacity: 1;
    transform: translateY(0) rotateX(0);
  }
}

@media (prefers-reduced-motion: reduce) {
  .aurora-title__letter {
    animation: none;
  }
}
</style>