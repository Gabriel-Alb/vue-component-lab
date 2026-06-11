<template>
  <div
    ref="gridRef"
    class="magnetic-dot-field"
    :class="customClass"
    :style="componentStyle"
    :aria-hidden="decorative"
  >
    <div
      v-for="rowIndex in rows"
      :key="`row-${rowIndex}`"
      class="magnetic-dot-field__row"
    >
      <span
        v-for="columnIndex in columns"
        :key="`dot-${rowIndex}-${columnIndex}`"
        :ref="(el) => setDotRef(el, getDotIndex(rowIndex, columnIndex))"
        class="magnetic-dot-field__dot"
      />
    </div>
  </div>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from "vue";

const props = defineProps({
  rows: {
    type: Number,
    default: 7,
  },
  columns: {
    type: Number,
    default: 10,
  },
  gap: {
    type: Number,
    default: 12,
  },
  dotSize: {
    type: Number,
    default: 24,
  },
  dotColor: {
    type: String,
    default: "currentColor",
  },
  dotOpacity: {
    type: Number,
    default: 1,
  },
  pullDistance: {
    type: Number,
    default: 70,
  },
  pullIntensity: {
    type: Number,
    default: 1,
  },
  moveDuration: {
    type: Number,
    default: 160,
  },
  returnDuration: {
    type: Number,
    default: 900,
  },
  returnEasing: {
    type: String,
    default: "cubic-bezier(0.2, 1.4, 0.35, 1)",
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  decorative: {
    type: Boolean,
    default: true,
  },
  customClass: {
    type: [String, Array, Object],
    default: "",
  },
});

const gridRef = ref(null);
const dotRefs = ref([]);
const dotCenters = ref([]);
const pulledDots = ref(new Set());

const componentStyle = computed(() => ({
  "--dot-size": `${props.dotSize}px`,
  "--gap": `${props.gap}px`,
  "--dot-color": props.dotColor,
  "--dot-opacity": props.dotOpacity,
}));

const getDots = () => dotRefs.value.filter(Boolean);

const getDotIndex = (rowIndex, columnIndex) => {
  return (rowIndex - 1) * props.columns + (columnIndex - 1);
};

const setDotRef = (el, index) => {
  if (el) {
    dotRefs.value[index] = el;
  }
};

const updateDotCenters = () => {
  dotCenters.value = getDots().map((dot) => {
    const rect = dot.getBoundingClientRect();

    return {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    };
  });
};

const resetDot = (dot) => {
  dot.style.transition = `transform ${props.returnDuration}ms ${props.returnEasing}`;
  dot.style.transform = "translate3d(0px, 0px, 0px)";
};

const resetAllDots = () => {
  pulledDots.value.clear();

  getDots().forEach((dot) => {
    resetDot(dot);
  });
};

const handlePointerMove = (event) => {
  if (props.disabled) {
    resetAllDots();
    return;
  }

  const pointerX = event.clientX;
  const pointerY = event.clientY;

  getDots().forEach((dot, index) => {
    const center = dotCenters.value[index];

    if (!center) return;

    const diffX = pointerX - center.x;
    const diffY = pointerY - center.y;
    const distance = Math.sqrt(diffX * diffX + diffY * diffY);

    if (distance < props.pullDistance) {
      const percent = distance / props.pullDistance;

      const x = diffX * percent * props.pullIntensity;
      const y = diffY * percent * props.pullIntensity;

      pulledDots.value.add(index);

      dot.style.transition = `transform ${props.moveDuration}ms ease-out`;
      dot.style.transform = `translate3d(${x}px, ${y}px, 0px)`;

      return;
    }

    if (!pulledDots.value.has(index)) return;

    pulledDots.value.delete(index);
    resetDot(dot);
  });
};

const handleVisibilityChange = () => {
  if (document.hidden) {
    resetAllDots();
  }
};

onMounted(async () => {
  await nextTick();

  updateDotCenters();

  window.addEventListener("resize", updateDotCenters);
  window.addEventListener("scroll", updateDotCenters, { passive: true });
  window.addEventListener("pointermove", handlePointerMove);
  window.addEventListener("blur", resetAllDots);
  document.addEventListener("visibilitychange", handleVisibilityChange);
});

onBeforeUnmount(() => {
  window.removeEventListener("resize", updateDotCenters);
  window.removeEventListener("scroll", updateDotCenters);
  window.removeEventListener("pointermove", handlePointerMove);
  window.removeEventListener("blur", resetAllDots);
  document.removeEventListener("visibilitychange", handleVisibilityChange);
});

watch(
  () => [
    props.rows,
    props.columns,
    props.gap,
    props.dotSize,
    props.pullDistance,
  ],
  async () => {
    await nextTick();
    updateDotCenters();
  },
);
</script>

<style scoped>
.magnetic-dot-field {
  display: inline-flex;
  width: max-content;
  height: max-content;
  flex-direction: column;
  gap: var(--gap);
  color: var(--dot-color);
  user-select: none;
  pointer-events: none;
}

.magnetic-dot-field__row {
  display: flex;
  gap: var(--gap);
}

.magnetic-dot-field__dot {
  width: var(--dot-size);
  height: var(--dot-size);
  flex: 0 0 auto;
  border-radius: 9999px;
  background-color: currentColor;
  opacity: var(--dot-opacity);
  will-change: transform;
}
</style>