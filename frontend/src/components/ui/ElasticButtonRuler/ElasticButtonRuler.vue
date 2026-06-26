<template>
  <nav
    ref="navRef"
    class="dock-nav relative inline-flex h-[76px] items-center gap-1.5 rounded-[24px] border border-white/10 bg-[#060A11]/78 px-3 shadow-[0_1px_0_rgba(255,255,255,0.08)_inset,0_22px_55px_-18px_rgba(0,0,0,0.85)] backdrop-blur-xl"
    aria-label="Navegação principal"
    @mousemove="handleMouseMove"
    @mouseleave="handleMouseLeave"
    @keydown="handleKeydown"
  >
    <span
      class="dock-pill pointer-events-none absolute rounded-[18px] border border-white/10 bg-white/[0.075]"
      :style="pillStyle"
      aria-hidden="true"
    />

    <button
      v-for="(item, index) in items"
      :key="item.value"
      :ref="(el) => setItemRef(el, index)"
      type="button"
      class="dock-item relative z-10 flex h-14 w-14 items-center justify-center rounded-[18px] text-[22px] text-[#7C8794] outline-none transition-colors duration-200 hover:text-[#E5E7EB] focus-visible:ring-2 focus-visible:ring-[#64748B] focus-visible:ring-offset-2 focus-visible:ring-offset-[#060A11]"
      :class="modelValue === item.value ? 'text-white' : ''"
      :style="getItemStyle(index)"
      :aria-label="item.label"
      :aria-current="modelValue === item.value ? 'true' : undefined"
      @click="selectItem(item.value)"
    >
      <i
        :class="item.icon"
        class="dock-icon relative leading-none"
        aria-hidden="true"
      />

      <span
        class="dock-tooltip pointer-events-none absolute -top-11 left-1/2 whitespace-nowrap rounded-lg border border-white/10 bg-[#0F172A]/85 px-2.5 py-1 text-[11px] font-medium text-[#CBD5E1] opacity-0 shadow-[0_10px_24px_rgba(0,0,0,0.42)] backdrop-blur-md"
      >
        {{ item.label }}
      </span>
    </button>
  </nav>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from "vue";

const props = defineProps({
  modelValue: {
    type: [String, Number],
    required: true,
  },
  items: {
    type: Array,
    required: true,
  },
});

const emit = defineEmits(["update:modelValue", "change"]);

const navRef = ref(null);
const itemRefs = ref([]);
const mouseX = ref(null);
const hoveredIndex = ref(null);

const pillStyle = ref({
  width: "0px",
  height: "0px",
  transform: "translate3d(0px, 0px, 0px)",
  opacity: 0,
});

let animationFrame = null;

const activeIndex = computed(() =>
  props.items.findIndex((item) => item.value === props.modelValue)
);

function setItemRef(el, index) {
  if (el) {
    itemRefs.value[index] = el;
  }
}

function getClosestItemIndex(clientX) {
  let closestIndex = null;
  let closestDistance = Infinity;

  itemRefs.value.forEach((item, index) => {
    if (!item) return;

    const rect = item.getBoundingClientRect();
    const center = rect.left + rect.width / 2;
    const distance = Math.abs(clientX - center);

    if (distance < closestDistance) {
      closestDistance = distance;
      closestIndex = index;
    }
  });

  return closestDistance <= 70 ? closestIndex : null;
}

function handleMouseMove(event) {
  if (animationFrame) {
    cancelAnimationFrame(animationFrame);
  }

  animationFrame = requestAnimationFrame(() => {
    mouseX.value = event.clientX;
    hoveredIndex.value = getClosestItemIndex(event.clientX);
  });
}

function handleMouseLeave() {
  mouseX.value = null;
  hoveredIndex.value = null;
}

function handleKeydown(event) {
  if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;

  const currentIndex = itemRefs.value.findIndex(
    (el) => el === document.activeElement
  );

  if (currentIndex === -1) return;

  event.preventDefault();

  const direction = event.key === "ArrowRight" ? 1 : -1;
  const nextIndex =
    (currentIndex + direction + props.items.length) % props.items.length;

  itemRefs.value[nextIndex]?.focus();
}

function getItemStyle(index) {
  if (hoveredIndex.value === null || mouseX.value === null) {
    return {
      transform: "translate3d(0, 0, 0) scale(1)",
      opacity: 1,
      zIndex: 10,
    };
  }

  const distanceFromHover = Math.abs(index - hoveredIndex.value);

  if (distanceFromHover === 0) {
    return {
      transform: "translate3d(0, -7px, 0) scale(1.18)",
      opacity: 1,
      zIndex: 30,
    };
  }

  if (distanceFromHover === 1) {
    return {
      transform: "translate3d(0, 2px, 0) scale(0.94)",
      opacity: 0.78,
      zIndex: 20,
    };
  }

  if (distanceFromHover === 2) {
    return {
      transform: "translate3d(0, 1px, 0) scale(0.98)",
      opacity: 0.88,
      zIndex: 10,
    };
  }

  return {
    transform: "translate3d(0, 0, 0) scale(1)",
    opacity: 0.72,
    zIndex: 10,
  };
}

function updatePill() {
  const el = itemRefs.value[activeIndex.value];

  if (!navRef.value || !el || activeIndex.value === -1) {
    pillStyle.value = {
      ...pillStyle.value,
      opacity: 0,
    };
    return;
  }

  pillStyle.value = {
    width: `${el.offsetWidth}px`,
    height: `${el.offsetHeight}px`,
    transform: `translate3d(${el.offsetLeft}px, ${el.offsetTop}px, 0)`,
    opacity: 1,
  };
}

function selectItem(value) {
  if (value === props.modelValue) return;

  emit("update:modelValue", value);
  emit("change", value);
}

watch(activeIndex, () => {
  nextTick(updatePill);
});

watch(
  () => props.items,
  () => {
    itemRefs.value = [];
    nextTick(updatePill);
  },
  { deep: true }
);

onMounted(() => {
  nextTick(updatePill);
  window.addEventListener("resize", updatePill);
});

onBeforeUnmount(() => {
  if (animationFrame) {
    cancelAnimationFrame(animationFrame);
  }

  window.removeEventListener("resize", updatePill);
});
</script>

<style scoped>
.dock-nav {
  isolation: isolate;
}

.dock-nav::before {
  content: "";
  position: absolute;
  inset: 0;
  z-index: 0;
  border-radius: inherit;
  background:
    linear-gradient(
      180deg,
      rgba(255, 255, 255, 0.08),
      rgba(255, 255, 255, 0.025) 42%,
      rgba(255, 255, 255, 0.015)
    );
  pointer-events: none;
}

.dock-nav::after {
  content: "";
  position: absolute;
  inset: 1px;
  z-index: 0;
  border-radius: 23px;
  background:
    radial-gradient(
      circle at 50% 0%,
      rgba(255, 255, 255, 0.08),
      transparent 42%
    );
  pointer-events: none;
}

.dock-item {
  will-change: transform, opacity;
  transition:
    transform 260ms cubic-bezier(0.2, 0.8, 0.2, 1),
    opacity 220ms ease,
    color 180ms ease;
}

.dock-item:active {
  transform: translate3d(0, 0, 0) scale(0.9) !important;
}

.dock-icon {
  transition:
    transform 220ms cubic-bezier(0.2, 0.8, 0.2, 1),
    filter 180ms ease;
}

.dock-item:hover .dock-icon {
  transform: translateY(-1px);
}

.dock-pill {
  top: 0;
  left: 0;
  z-index: 1;
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.12),
    inset 0 -1px 0 rgba(255, 255, 255, 0.03),
    0 14px 30px -16px rgba(15, 23, 42, 0.95);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  will-change: transform, width, height, opacity;
  transition:
    transform 360ms cubic-bezier(0.2, 0.8, 0.2, 1),
    width 360ms cubic-bezier(0.2, 0.8, 0.2, 1),
    height 360ms cubic-bezier(0.2, 0.8, 0.2, 1),
    opacity 180ms ease;
}

.dock-tooltip {
  transform: translate(-50%, 5px) scale(0.96);
  transition:
    opacity 160ms ease,
    transform 180ms cubic-bezier(0.2, 0.8, 0.2, 1);
}

.dock-tooltip::after {
  content: "";
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  border: 5px solid transparent;
  border-top-color: rgba(15, 23, 42, 0.85);
}

.dock-item:hover .dock-tooltip,
.dock-item:focus-visible .dock-tooltip {
  opacity: 1;
  transform: translate(-50%, 0) scale(1);
}

@media (prefers-reduced-motion: reduce) {
  .dock-item,
  .dock-icon,
  .dock-pill,
  .dock-tooltip {
    transition: none !important;
  }
}
</style>