<template>
  <FallingSkillButtons :items="buttons" />
</template>

<script setup>
import FallingSkillButtons from './SkillButtons.vue'

const buttons = [
  {
    label: 'Vue',
    colorLight: '#42d392',
    colorPrimary: '#42b883',
    colorDark: '#35495e',
  },
  {
    label: 'Tailwind',
    colorLight: '#67e8f9',
    colorPrimary: '#38bdf8',
    colorDark: '#0284c7',
  },
  {
    label: 'JavaScript',
    colorLight: '#facc15',
    colorPrimary: '#eab308',
    colorDark: '#a16207',
  },
  {
    label: 'Frontend',
    colorLight: '#fb7185',
    colorPrimary: '#f43f5e',
    colorDark: '#be123c',
  },
  {
    label: 'UX/UI',
    colorLight: '#c084fc',
    colorPrimary: '#9333ea',
    colorDark: '#6b21a8',
  },
]
</script>