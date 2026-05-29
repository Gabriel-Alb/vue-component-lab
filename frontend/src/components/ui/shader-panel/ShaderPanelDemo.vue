<template>
  <div class="shader-panel-demo">
    <ShaderPanel
      :speed="0.90"
      :zoom="2.0"
      :wave-strength="1.42"
      :softness="0.60"
      :mouse-strength="0.00"
      :color-a="[0.00, 0.00, 0.00]"
      :color-b="[0.12, 0.06, 0.32]"
      :color-c="[0.32, 0.15, 1.00]"
      :color-d="[0.52, 0.28, 0.99]"
      :color-e="[0.78, 0.48, 0.98]"
      :color-f="[1.00, 0.62, 0.99]"
    />
  </div>
</template>

<script setup>
import ShaderPanel from './ShaderPanel.vue';
</script>

<style scoped>

:global(.content-scroll) {
  padding: 0 !important;
  overflow: hidden !important;
}

:global(.content-scroll > .flex) {
  width: 100% !important;
  height: 100% !important;
  min-height: 100% !important;
  display: block !important;
}

.shader-panel-demo {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 100%;
  overflow: hidden;
  background: #000000;
}

.shader-panel-demo :deep(.soft-liquid-wave-background) {
  position: absolute !important;
  inset: 0 !important;
  width: 100% !important;
  height: 100% !important;
  display: block !important;
  background: #000000 !important;
  pointer-events: none !important;
}
</style>