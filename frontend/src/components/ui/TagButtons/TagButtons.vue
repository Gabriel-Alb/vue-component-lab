<template>
  <section ref="sceneRef" class="absolute inset-0 overflow-hidden">
    <button
      v-for="(item, index) in normalizedItems"
      :key="item.key"
      :ref="(el) => setButtonRef(el, index)"
      type="button"
      class="falling-button absolute left-0 top-0 inline-flex items-center justify-center overflow-hidden rounded-xl px-6 py-3 font-semibold text-white"
      :class="buttonClass"
      :style="getButtonStyle(item)"
      @click.stop="$emit('click', { item, index })"
    >
      <span class="pointer-events-none relative z-10 whitespace-nowrap">
        {{ item.label }}
      </span>
    </button>
  </section>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import Matter from 'matter-js'

const { Engine, Runner, Bodies, Body, Composite, Mouse, MouseConstraint } = Matter

const props = defineProps({
  items: {
    type: Array,
    default: () => [],
  },

  buttonClass: {
    type: String,
    default: '',
  },
})

defineEmits(['click'])

const sceneRef = ref(null)
const buttonRefs = ref([])

let engine = null
let runner = null
let mouse = null
let mouseConstraint = null
let frame = null
let resizeObserver = null
let restartTimeout = null

let boundaryElement = null
let oldBoundaryPosition = ''

const bodyMap = new Map()

const normalizedItems = computed(() =>
  props.items.map((item, index) => {
    if (typeof item === 'string') {
      return {
        key: `${item}-${index}`,
        label: item,
        colorLight: '#6438ff',
        colorPrimary: '#5227ff',
        colorDark: '#421bdc',
      }
    }

    return {
      key: item.key || `${item.label}-${index}`,
      label: item.label,
      colorLight: item.colorLight || '#6438ff',
      colorPrimary: item.colorPrimary || '#5227ff',
      colorDark: item.colorDark || '#421bdc',
    }
  }),
)

function setButtonRef(el, index) {
  if (el) {
    buttonRefs.value[index] = el
  }
}

function getButtonStyle(item) {
  return {
    background: `linear-gradient(135deg, ${item.colorLight} 0%, ${item.colorPrimary} 48%, ${item.colorDark} 100%)`,
    boxShadow: `0 14px 28px ${item.colorPrimary}35`,
    transform: 'translate3d(-9999px, -9999px, 0)',
  }
}

async function initPhysics() {
  destroyPhysics()

  await nextTick()

  const scene = sceneRef.value
  if (!scene) return

  prepareBoundary()

  await nextTick()

  const width = scene.clientWidth
  const height = scene.clientHeight

  if (!width || !height) return

  buttonRefs.value = buttonRefs.value.slice(0, normalizedItems.value.length)

  engine = Engine.create()
  engine.gravity.y = 0.9

  runner = Runner.create()

  Composite.add(engine.world, [
    ...createWalls(width, height),
    ...createButtons(width),
  ])

  mouse = Mouse.create(scene)

  mouseConstraint = MouseConstraint.create(engine, {
    mouse,
    constraint: {
      stiffness: 0.22,
      damping: 0.14,
      render: { visible: false },
    },
  })

  Composite.add(engine.world, mouseConstraint)

  Runner.run(runner, engine)
  render()
}

function prepareBoundary() {
  const scene = sceneRef.value

  boundaryElement = scene?.closest('.content-scroll') || scene?.parentElement

  if (!boundaryElement) return

  const currentPosition = window.getComputedStyle(boundaryElement).position

  if (currentPosition === 'static') {
    oldBoundaryPosition = boundaryElement.style.position
    boundaryElement.style.position = 'relative'
  }
}

function createWalls(width, height) {
  const thickness = 100

  const options = {
    isStatic: true,
    render: { visible: false },
  }

  return [
    Bodies.rectangle(width / 2, height + thickness / 2, width, thickness, options),
    Bodies.rectangle(-thickness / 2, height / 2, thickness, height, options),
    Bodies.rectangle(width + thickness / 2, height / 2, thickness, height, options),
    Bodies.rectangle(width / 2, -thickness / 2, width, thickness, options),
  ]
}

function createButtons(width) {
  bodyMap.clear()

  return buttonRefs.value.map((button, index) => {
    const rect = button.getBoundingClientRect()

    const buttonWidth = rect.width
    const buttonHeight = rect.height

    const body = Bodies.rectangle(
      70 + ((index * 170) % Math.max(width - buttonWidth - 140, 1)),
      70 + index * 18,
      buttonWidth,
      buttonHeight,
      {
        chamfer: { radius: 12 },
        restitution: 0.42,
        friction: 0.25,
        frictionAir: 0.02,
      },
    )

    Body.setAngle(body, (Math.random() - 0.5) * 0.35)

    bodyMap.set(body.id, {
      button,
      width: buttonWidth,
      height: buttonHeight,
    })

    return body
  })
}

function render() {
  if (!engine) return

  Composite.allBodies(engine.world).forEach((body) => {
    const data = bodyMap.get(body.id)

    if (!data) return

    data.button.style.transform = `
      translate3d(${body.position.x - data.width / 2}px, ${body.position.y - data.height / 2}px, 0)
      rotate(${body.angle}rad)
    `
  })

  frame = requestAnimationFrame(render)
}

function restartPhysics() {
  clearTimeout(restartTimeout)

  restartTimeout = setTimeout(() => {
    initPhysics()
  }, 120)
}

function destroyPhysics() {
  cancelAnimationFrame(frame)

  if (mouse) {
    Mouse.clearSourceEvents(mouse)
  }

  if (runner) {
    Runner.stop(runner)
  }

  if (engine) {
    Composite.clear(engine.world, false)
    Engine.clear(engine)
  }

  engine = null
  runner = null
  mouse = null
  mouseConstraint = null
  frame = null

  bodyMap.clear()
}

watch(() => props.items, restartPhysics, { deep: true })

onMounted(async () => {
  await initPhysics()

  if (boundaryElement) {
    resizeObserver = new ResizeObserver(restartPhysics)
    resizeObserver.observe(boundaryElement)
  }
})

onBeforeUnmount(() => {
  clearTimeout(restartTimeout)

  destroyPhysics()

  resizeObserver?.disconnect()

  if (boundaryElement) {
    boundaryElement.style.position = oldBoundaryPosition
  }
})
</script>

<style scoped>
.falling-button {
  cursor: grab;
  touch-action: none;
  will-change: transform;
}

.falling-button:hover {
  filter: brightness(1.06);
}

.falling-button:active {
  cursor: grabbing;
}
</style>