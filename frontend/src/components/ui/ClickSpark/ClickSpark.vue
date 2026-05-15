<template>
  <div class="pointer-events-none fixed inset-0 overflow-hidden" :style="{ zIndex }" aria-hidden="true">
    <span v-for="spark in sparks" :key="spark.id" class="absolute left-0 top-0 h-0 w-0" :style="{
      transform: `translate(${spark.x}px, ${spark.y}px)`,
    }">
      <span v-for="ray in spark.rays" :key="ray.id" class="click-spark__ray" :style="{
        '--spark-angle': `${ray.angle}deg`,
        '--spark-radius': `${sparkRadius}px`,
        '--spark-duration': `${duration}ms`,
        '--spark-color': sparkColor,
        '--spark-length': `${sparkLength}px`,
        '--spark-thickness': `${sparkThickness}px`,
      }" />
    </span>
  </div>
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'

const props = defineProps({
  sparkColor: {
    type: String,
    default: '#ffffff',
  },

  sparkRadius: {
    type: Number,
    default: 14,
  },

  sparkLength: {
    type: Number,
    default: 5,
  },

  sparkThickness: {
    type: Number,
    default: 2,
  },

  sparkCount: {
    type: Number,
    default: 8,
  },

  duration: {
    type: Number,
    default: 360,
  },

  zIndex: {
    type: [Number, String],
    default: 9999,
  },

  targetSelector: {
    type: String,
    default: '',
  },
})

const sparks = ref([])

function createSpark(event) {
  const target = event.target instanceof Element ? event.target : null

  if (props.targetSelector && !target?.closest(props.targetSelector)) {
    return
  }

  const sparkId =
    typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random()}`

  const rays = Array.from({ length: props.sparkCount }, (_, index) => ({
    id: `${sparkId}-${index}`,
    angle: (360 / props.sparkCount) * index,
  }))

  sparks.value.push({
    id: sparkId,
    x: event.clientX,
    y: event.clientY,
    rays,
  })

  window.setTimeout(() => {
    sparks.value = sparks.value.filter((spark) => spark.id !== sparkId)
  }, props.duration)
}

onMounted(() => {
  window.addEventListener('click', createSpark, true)
})

onBeforeUnmount(() => {
  window.removeEventListener('click', createSpark, true)
})
</script>

<style scoped>
.click-spark__ray {
  position: absolute;
  left: 0;
  top: calc(var(--spark-thickness) / -2);
  width: var(--spark-length);
  height: var(--spark-thickness);
  border-radius: 999px;
  background-color: var(--spark-color);
  transform-origin: 0 center;
  animation: click-spark var(--spark-duration) ease-out forwards;
}

@keyframes click-spark {
  0% {
    opacity: 1;
    transform:
      rotate(var(--spark-angle)) translateX(0) scaleX(0.2);
  }

  65% {
    opacity: 1;
  }

  100% {
    opacity: 0;
    transform:
      rotate(var(--spark-angle)) translateX(var(--spark-radius)) scaleX(1);
  }
}
</style>