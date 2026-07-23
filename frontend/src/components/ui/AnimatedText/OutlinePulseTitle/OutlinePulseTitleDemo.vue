<template>
  <div class="outline-pulse-title">
    {{ text }}
  </div>
</template>

<script setup>
defineProps({
  text: {
    type: String,
    default: "Outline Pulse",
  },
});
</script>

<style scoped>
.outline-pulse-title {
  display: inline-block;
  font-family: "Arial Black", "Montserrat", sans-serif;
  font-size: clamp(2rem, 6vw, 5rem);
  font-weight: 900;
  letter-spacing: 0.05em;
  color: transparent;
  text-transform: uppercase;
  -webkit-text-stroke: 2px #c084fc;
  animation: outlinePulse 2s ease-in-out infinite;
}

@keyframes outlinePulse {
  0%,
  100% {
    -webkit-text-stroke-color: #a855f7;
    filter:
      drop-shadow(0 0 4px rgba(168, 85, 247, 0.5))
      drop-shadow(0 0 10px rgba(126, 34, 206, 0.35));
    transform: scale(1);
  }

  50% {
    -webkit-text-stroke-color: #f3e8ff;
    filter:
      drop-shadow(0 0 10px rgba(216, 180, 254, 0.95))
      drop-shadow(0 0 26px rgba(147, 51, 234, 0.8));
    transform: scale(1.04);
  }
}

@media (prefers-reduced-motion: reduce) {
  .outline-pulse-title {
    animation: none;
  }
}
</style>