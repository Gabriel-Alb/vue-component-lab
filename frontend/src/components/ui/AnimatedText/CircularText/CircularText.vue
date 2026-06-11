<template>
  <div
    ref="circularTextRef"
    class="circular-text"
    :style="componentStyle"
    :aria-label="ariaLabel || readableText"
    @mouseenter="isHovering = true"
    @mouseleave="isHovering = false"
  >
    <span
      v-for="(item, index) in circleItems"
      :key="`${item.value}-${index}`"
      class="circular-text__char"
      :class="{
        'circular-text__separator': item.type === 'separator',
        'circular-text__gap': item.type === 'gap',
      }"
      :style="{ transform: getCharTransform(index, item.type) }"
    >
      {{ item.value }}
    </span>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

const props = defineProps({
  text: {
    type: String,
    default: 'Animated Text',
  },
  words: {
    type: Array,
    default: () => [],
  },
  separator: {
    type: String,
    default: '•',
  },
  minWords: {
    type: Number,
    default: 3,
  },
  maxCharacters: {
    type: Number,
    default: 25,
  },
  size: {
    type: Number,
    default: null,
  },
  color: {
    type: String,
    default: '#f8fafc',
  },
  fontSize: {
    type: Number,
    default: null,
  },
  fontWeight: {
    type: [Number, String],
    default: 950,
  },
  spinDuration: {
    type: Number,
    default: 13,
  },
  hoverSlowdown: {
    type: Number,
    default: 2.4,
  },
  reverse: {
    type: Boolean,
    default: false,
  },
  ariaLabel: {
    type: String,
    default: '',
  },
})

const circularTextRef = ref(null)
const isHovering = ref(false)

let frameId = null
let lastTime = 0
let rotation = 0

const baseWords = computed(() => {
  const text = props.words.length
    ? props.words.join(' ')
    : props.text

  const limitedText = text
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, props.maxCharacters)
    .trim()

  const words = limitedText
    ? limitedText.split(' ')
    : ['Animated', 'Text', 'Motion']

  if (words.length >= props.minWords) {
    return words
  }

  return Array.from(
    { length: props.minWords },
    (_, index) => words[index % words.length],
  )
})

const circleItems = computed(() => {
  return baseWords.value.flatMap((word) => [
    ...Array.from(word.toUpperCase()).map((letter) => ({
      type: 'letter',
      value: letter,
    })),
    { type: 'gap', value: '' },
    { type: 'separator', value: props.separator },
    { type: 'gap', value: '' },
  ])
})

const readableText = computed(() => {
  return baseWords.value.join(` ${props.separator} `)
})

const calculatedFontSize = computed(() => {
  if (props.fontSize) {
    return props.fontSize
  }

  return baseWords.value.length === 1 ? 26 : 22
})

const calculatedSize = computed(() => {
  if (props.size) {
    return props.size
  }

  return Math.min(150 + circleItems.value.length * 2.8, 245)
})

const calculatedRadius = computed(() => {
  return calculatedSize.value / 2 - calculatedFontSize.value * 1.35
})

const componentStyle = computed(() => ({
  '--circular-size': `${calculatedSize.value}px`,
  '--circular-radius': `${calculatedRadius.value}px`,
  '--circular-color': props.color,
  '--circular-font-size': `${calculatedFontSize.value}px`,
  '--circular-font-weight': props.fontWeight,
  '--circular-rotation': '0deg',
}))

const getCharTransform = (index, type) => {
  const angle = (360 / circleItems.value.length) * index
  const extraSpace = type === 'separator' ? '3px' : '0px'

  return `
    translate(-50%, -50%)
    rotate(${angle}deg)
    translateY(calc((var(--circular-radius) + ${extraSpace}) * -1))
  `
}

const animate = (time) => {
  if (!lastTime) {
    lastTime = time
  }

  const delta = (time - lastTime) / 1000
  lastTime = time

  const duration = isHovering.value
    ? props.spinDuration * props.hoverSlowdown
    : props.spinDuration

  const direction = props.reverse ? -1 : 1

  rotation += (360 / duration) * delta * direction
  rotation %= 360

  circularTextRef.value?.style.setProperty(
    '--circular-rotation',
    `${rotation}deg`,
  )

  frameId = requestAnimationFrame(animate)
}

onMounted(() => {
  frameId = requestAnimationFrame(animate)
})

onBeforeUnmount(() => {
  cancelAnimationFrame(frameId)
})
</script>

<style scoped>
.circular-text {
  position: relative;
  width: min(var(--circular-size), 100%);
  aspect-ratio: 1;
  transform: rotate(var(--circular-rotation));
  transform-origin: center;
  will-change: transform;
}

.circular-text__char {
  position: absolute;
  top: 50%;
  left: 50%;
  color: var(--circular-color);
  font-size: var(--circular-font-size);
  font-weight: var(--circular-font-weight);
  line-height: 1;
  text-transform: uppercase;
  transform-origin: center;
  user-select: none;
  will-change: transform;
}

.circular-text__separator {
  padding-inline: 3px;
  font-size: calc(var(--circular-font-size) * 0.9);
}

.circular-text__gap {
  opacity: 0;
}
</style>