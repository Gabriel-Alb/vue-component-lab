<template>
  <AnimatedFolder
    :papers="[
      { label: 'Vue' },
      { label: 'Tailwind' },
      { label: 'CSS' },
    ]"
    @select="handleSelect"
  />
</template>

<script setup>
import AnimatedFolder from './AnimatedFolder.vue'

function handleSelect(paper) {
  console.log('Selecionado:', paper)
}
</script>