<template>
  <button
    ref="buttonRef"
    type="button"
    :disabled="disabled"
    class="relative inline-flex items-center justify-center overflow-hidden rounded-xl px-6 py-3 font-semibold text-white transition-transform ease-out disabled:cursor-not-allowed disabled:opacity-60"
    :style="buttonStyle"
    @click="handleClick"
  >
    <span
      v-if="rippleVisible"
      :key="rippleKey"
      class="magnetic-button__ripple pointer-events-none absolute rounded-full bg-white/30"
      :style="rippleStyle"
    />

    <span
      class="pointer-events-none relative z-10 transition-transform ease-out"
      :style="contentStyle"
    >
      <slot>
        {{ label }}
      </slot>
    </span>
  </button>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from "vue";

const props = defineProps({
  label: {
    type: String,
    default: "Clique aqui",
  },

  href: {
    type: String,
    default: "",
  },

  disabled: {
    type: Boolean,
    default: false,
  },

  activationRadius: {
    type: Number,
    default: 160,
  },

  strength: {
    type: Number,
    default: 28,
  },

  contentStrength: {
    type: Number,
    default: 10,
  },

  redirectDelay: {
    type: Number,
    default: 280,
  },

  colorLight: {
    type: String,
    default: "#6438ff",
  },

  colorPrimary: {
    type: String,
    default: "#5227ff",
  },

  colorDark: {
    type: String,
    default: "#421bdc",
  },
});

const emit = defineEmits(["click"]);

const buttonRef = ref(null);

const x = ref(0);
const y = ref(0);
const contentX = ref(0);
const contentY = ref(0);

const isActive = ref(false);
const isClicking = ref(false);

const rippleX = ref(0);
const rippleY = ref(0);
const rippleVisible = ref(false);
const rippleKey = ref(0);

let clickTimeout = null;
let rippleTimeout = null;
let redirectTimeout = null;

const buttonStyle = computed(() => ({
  background: `linear-gradient(135deg, ${props.colorLight} 0%, ${props.colorPrimary} 48%, ${props.colorDark} 100%)`,
  boxShadow: `0 14px 28px ${props.colorPrimary}35`,
  transform: `translate3d(${x.value}px, ${y.value}px, 0) scale(${
    isClicking.value ? 0.94 : 1
  })`,
  transitionDuration: isActive.value ? "120ms" : "320ms",
}));

const contentStyle = computed(() => ({
  transform: `translate3d(${contentX.value}px, ${contentY.value}px, 0) scale(${
    isClicking.value ? 0.96 : 1
  })`,
  transitionDuration: isActive.value ? "120ms" : "320ms",
}));

const rippleStyle = computed(() => ({
  left: `${rippleX.value}px`,
  top: `${rippleY.value}px`,
}));

function handleMouseMove(event) {
  if (!buttonRef.value || props.disabled) return;

  const rect = buttonRef.value.getBoundingClientRect();

  const buttonCenterX = rect.left + rect.width / 2;
  const buttonCenterY = rect.top + rect.height / 2;

  const distanceX = event.clientX - buttonCenterX;
  const distanceY = event.clientY - buttonCenterY;

  const distance = Math.sqrt(distanceX ** 2 + distanceY ** 2);

  if (distance > props.activationRadius) {
    resetPosition();
    return;
  }

  isActive.value = true;

  const magneticForce = 1 - distance / props.activationRadius;

  x.value = distanceX * magneticForce * (props.strength / 100);
  y.value = distanceY * magneticForce * (props.strength / 100);

  contentX.value = distanceX * magneticForce * (props.contentStrength / 100);
  contentY.value = distanceY * magneticForce * (props.contentStrength / 100);
}

function handleClick(event) {
  if (props.disabled) return;

  emit("click", event);

  const rect = event.currentTarget.getBoundingClientRect();

  rippleX.value = event.clientX - rect.left;
  rippleY.value = event.clientY - rect.top;

  isClicking.value = true;
  rippleVisible.value = false;
  rippleKey.value += 1;

  nextTick(() => {
    rippleVisible.value = true;
  });

  clearTimeout(clickTimeout);
  clearTimeout(rippleTimeout);
  clearTimeout(redirectTimeout);

  clickTimeout = setTimeout(() => {
    isClicking.value = false;
  }, 180);

  rippleTimeout = setTimeout(() => {
    rippleVisible.value = false;
  }, 520);

  if (props.href) {
    redirectTimeout = setTimeout(() => {
      window.open(props.href, "_blank", "noopener,noreferrer");
    }, props.redirectDelay);
  }
}

function resetPosition() {
  isActive.value = false;
  x.value = 0;
  y.value = 0;
  contentX.value = 0;
  contentY.value = 0;
}

onMounted(() => {
  window.addEventListener("mousemove", handleMouseMove);
});

onBeforeUnmount(() => {
  window.removeEventListener("mousemove", handleMouseMove);

  clearTimeout(clickTimeout);
  clearTimeout(rippleTimeout);
  clearTimeout(redirectTimeout);
});
</script>

<style scoped>
.magnetic-button__ripple {
  width: 18px;
  height: 18px;
  transform: translate(-50%, -50%) scale(0);
  animation: magnetic-ripple 520ms ease-out forwards;
}

@keyframes magnetic-ripple {
  0% {
    opacity: 0.45;
    transform: translate(-50%, -50%) scale(0);
  }

  100% {
    opacity: 0;
    transform: translate(-50%, -50%) scale(16);
  }
}
</style>