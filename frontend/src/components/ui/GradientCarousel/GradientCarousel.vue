<template>
  <div
    v-if="normalizedCards.length"
    class="gradient-carousel relative w-full select-none overflow-hidden overscroll-contain"
    :style="carouselStyle"
    @pointerdown="handlePointerDown"
    @pointermove="handlePointerMove"
    @pointerup="handlePointerUp"
    @pointercancel="handlePointerUp"
    @wheel.prevent.stop="handleWheel"
  >
    <article
      v-for="(card, index) in normalizedCards"
      :key="card.id"
      class="carousel-card absolute left-1/2 top-0 cursor-pointer overflow-hidden"
      :class="card.cardClass"
      :style="getCardStyle(index, card)"
      @click="goTo(index)"
    >
      <div
        class="relative flex h-full flex-col justify-end overflow-hidden"
        :class="card.contentClass"
        :style="getCardContentStyle(card)"
      >
        <div class="relative z-10">
          <component
            :is="titleTag"
            :class="card.titleClass"
            :style="getTitleStyle(card)"
          >
            {{ card.title }}
          </component>

          <component
            :is="descriptionTag"
            v-if="card.description"
            :class="card.descriptionClass"
            :style="getDescriptionStyle(card)"
          >
            {{ card.description }}
          </component>
        </div>
      </div>
    </article>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

const props = defineProps({
  cards: {
    type: Array,
    required: true,
    default: () => [],
  },

  height: {
    type: String,
    default: '460px',
  },

  cardWidth: {
    type: String,
    default: '340px',
  },

  cardHeight: {
    type: String,
    default: '420px',
  },

  cardSpacing: {
    type: Number,
    default: 360,
  },

  cardRadius: {
    type: String,
    default: '2rem',
  },

  cardPadding: {
    type: String,
    default: '1.5rem',
  },

  cardBorder: {
    type: String,
    default: '1px solid rgba(255, 255, 255, 0.15)',
  },

  cardShadow: {
    type: String,
    default: '0 25px 50px -12px rgba(0, 0, 0, 0.45)',
  },

  perspective: {
    type: String,
    default: '1200px',
  },

  titleTag: {
    type: String,
    default: 'h2',
  },

  descriptionTag: {
    type: String,
    default: 'p',
  },

  titleClass: {
    type: String,
    default: 'text-3xl font-semibold leading-tight',
  },

  descriptionClass: {
    type: String,
    default: 'mt-4 text-sm leading-6',
  },

  titleColor: {
    type: String,
    default: '#FFFFFF',
  },

  descriptionColor: {
    type: String,
    default: 'rgba(255, 255, 255, 0.85)',
  },

  fallbackGradient: {
    type: Array,
    default: () => ['#5227FF', '#8B5CF6', '#FF9FFC'],
  },

  glowEnabled: {
    type: Boolean,
    default: true,
  },

  glowWidth: {
    type: String,
    default: '900px',
  },

  glowHeight: {
    type: String,
    default: '560px',
  },

  glowBlur: {
    type: String,
    default: '100px',
  },

  glowTop: {
    type: String,
    default: '40%',
  },

  glowOpacity: {
    type: Number,
    default: 1,
  },

  depthStep: {
    type: Number,
    default: 150,
  },

  rotationStep: {
    type: Number,
    default: 16,
  },

  scaleStep: {
    type: Number,
    default: 0.11,
  },

  minScale: {
    type: Number,
    default: 0.76,
  },

  visibleDistance: {
    type: Number,
    default: 2.4,
  },

  inertia: {
    type: Number,
    default: 0.94,
  },

  wheelStrength: {
    type: Number,
    default: 0.0009,
  },

  dragStrength: {
    type: Number,
    default: 0.035,
  },

  clickStrength: {
    type: Number,
    default: 0.045,
  },

  maxWheelVelocity: {
    type: Number,
    default: 0.16,
  },

  maxReleaseVelocity: {
    type: Number,
    default: 0.12,
  },

  keyboardEnabled: {
    type: Boolean,
    default: true,
  },

  keyboardStrength: {
    type: Number,
    default: 0.08,
  },
})

const emit = defineEmits(['change', 'select'])

const position = ref(0)
const velocity = ref(0)
const isDragging = ref(false)
const dragStartX = ref(0)
const dragStartPosition = ref(0)
const lastDragX = ref(0)
const lastDragTime = ref(0)

let animationFrameId = null

const normalizedCards = computed(() => {
  return props.cards.map((card, index) => ({
    id: card.id ?? index,
    title: card.title ?? '',
    description: card.description ?? '',
    gradient: card.gradient?.length ? card.gradient : props.fallbackGradient,
    titleColor: card.titleColor ?? props.titleColor,
    descriptionColor: card.descriptionColor ?? props.descriptionColor,
    cardClass: card.cardClass ?? '',
    contentClass: card.contentClass ?? '',
    titleClass: card.titleClass ?? props.titleClass,
    descriptionClass: card.descriptionClass ?? props.descriptionClass,
    cardStyle: card.cardStyle ?? {},
    contentStyle: card.contentStyle ?? {},
  }))
})

const activeIndex = computed(() => {
  if (!normalizedCards.value.length) return 0

  return normalizeIndex(Math.round(position.value))
})

const activeCard = computed(() => {
  return normalizedCards.value[activeIndex.value]
})

const activeGradient = computed(() => {
  return activeCard.value?.gradient?.length
    ? activeCard.value.gradient
    : props.fallbackGradient
})

const carouselStyle = computed(() => {
  const [firstColor, secondColor, thirdColor] = activeGradient.value

  return {
    height: props.height,
    perspective: props.perspective,
    '--gradient-first': firstColor,
    '--gradient-second': secondColor,
    '--gradient-third': thirdColor,
    '--glow-width': props.glowWidth,
    '--glow-height': props.glowHeight,
    '--glow-blur': props.glowBlur,
    '--glow-top': props.glowTop,
    '--glow-opacity': props.glowEnabled ? props.glowOpacity : 0,
  }
})

function normalizeIndex(index) {
  const length = normalizedCards.value.length

  if (!length) return 0

  return ((index % length) + length) % length
}

function getLoopOffset(index) {
  const length = normalizedCards.value.length

  if (!length) return 0

  const half = length / 2
  const rawOffset = index - position.value

  return ((((rawOffset + half) % length) + length) % length) - half
}

function animate() {
  if (!isDragging.value) {
    position.value += velocity.value
    velocity.value *= props.inertia

    if (Math.abs(velocity.value) < 0.0004) {
      velocity.value = 0
    }
  }

  animationFrameId = requestAnimationFrame(animate)
}

function getCardContentStyle(card) {
  const [firstColor, secondColor, thirdColor] = card.gradient

  return {
    padding: props.cardPadding,
    borderRadius: props.cardRadius,
    background: `linear-gradient(135deg, ${firstColor} 0%, ${secondColor} 55%, ${thirdColor} 100%)`,
    ...card.contentStyle,
  }
}

function getCardStyle(index, card) {
  const offset = getLoopOffset(index)
  const distance = Math.abs(offset)

  const translateX = offset * props.cardSpacing
  const translateZ = -distance * props.depthStep
  const rotateY = offset * -props.rotationStep
  const scale = Math.max(props.minScale, 1 - distance * props.scaleStep)

  return {
    width: props.cardWidth,
    height: props.cardHeight,
    borderRadius: props.cardRadius,
    border: props.cardBorder,
    boxShadow: props.cardShadow,
    transform: `
      translateX(-50%)
      translate3d(${translateX}px, 0, ${translateZ}px)
      rotateY(${rotateY}deg)
      scale(${scale})
    `,
    zIndex: Math.round(100 - distance * 10),
    pointerEvents: distance <= props.visibleDistance ? 'auto' : 'none',
    ...card.cardStyle,
  }
}

function getTitleStyle(card) {
  return {
    color: card.titleColor,
  }
}

function getDescriptionStyle(card) {
  return {
    color: card.descriptionColor,
  }
}

function goTo(index) {
  const length = normalizedCards.value.length

  if (!length) return

  const currentIndex = normalizeIndex(Math.round(position.value))
  let difference = index - currentIndex

  if (difference > length / 2) {
    difference -= length
  }

  if (difference < -length / 2) {
    difference += length
  }

  velocity.value += difference * props.clickStrength

  emit('select', normalizedCards.value[index])
}

function handleWheel(event) {
  const delta = Math.abs(event.deltaX) > Math.abs(event.deltaY)
    ? event.deltaX
    : event.deltaY

  velocity.value += delta * props.wheelStrength
  velocity.value = clampVelocity(velocity.value, props.maxWheelVelocity)
}

function handlePointerDown(event) {
  isDragging.value = true
  dragStartX.value = event.clientX
  dragStartPosition.value = position.value
  lastDragX.value = event.clientX
  lastDragTime.value = performance.now()
  velocity.value = 0

  event.currentTarget.setPointerCapture?.(event.pointerId)
}

function handlePointerMove(event) {
  if (!isDragging.value) return

  const now = performance.now()
  const dragDistance = event.clientX - dragStartX.value
  const dragDelta = event.clientX - lastDragX.value
  const timeDelta = Math.max(now - lastDragTime.value, 1)

  position.value = dragStartPosition.value - dragDistance / props.cardSpacing
  velocity.value = -(dragDelta / timeDelta) * props.dragStrength

  lastDragX.value = event.clientX
  lastDragTime.value = now
}

function handlePointerUp() {
  isDragging.value = false
  velocity.value = clampVelocity(velocity.value, props.maxReleaseVelocity)
}

function handleKeyboard(event) {
  if (!props.keyboardEnabled) return

  if (event.key === 'ArrowRight') {
    velocity.value += props.keyboardStrength
  }

  if (event.key === 'ArrowLeft') {
    velocity.value -= props.keyboardStrength
  }
}

function clampVelocity(value, max) {
  return Math.max(Math.min(value, max), -max)
}

onMounted(() => {
  animationFrameId = requestAnimationFrame(animate)
  window.addEventListener('keydown', handleKeyboard)
})

onBeforeUnmount(() => {
  cancelAnimationFrame(animationFrameId)
  window.removeEventListener('keydown', handleKeyboard)
})
</script>

<style scoped>
.gradient-carousel {
  touch-action: none;
}

.gradient-carousel::before {
  content: '';
  position: absolute;
  left: 50%;
  top: var(--glow-top);
  z-index: 0;
  width: var(--glow-width);
  height: var(--glow-height);
  pointer-events: none;
  opacity: var(--glow-opacity);
  transform: translate(-50%, -50%);
  background:
    radial-gradient(circle at 25% 25%, color-mix(in srgb, var(--gradient-first) 72%, transparent), transparent 34%),
    radial-gradient(circle at 72% 32%, color-mix(in srgb, var(--gradient-second) 68%, transparent), transparent 38%),
    radial-gradient(circle at 50% 78%, color-mix(in srgb, var(--gradient-third) 64%, transparent), transparent 42%);
  filter: blur(var(--glow-blur));
  transition:
    background 420ms ease,
    opacity 240ms ease;
}

.carousel-card {
  z-index: 1;
  transform-style: preserve-3d;
  will-change: transform;
}
</style>