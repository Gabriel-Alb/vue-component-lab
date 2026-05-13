<template>
  <button
    ref="buddyRef"
    type="button"
    class="joao-bobo"
    :style="buddyStyle"
    aria-label="João bobo interativo"
    @click="handleHit"
  >
    <span class="joao-bobo__shadow" aria-hidden="true" />

    <span class="joao-bobo__character" aria-hidden="true">
      <span class="joao-bobo__body">
        <span class="joao-bobo__body-highlight" />
      </span>

      <span class="joao-bobo__head">
        <span class="joao-bobo__head-highlight" />
      </span>
    </span>

    <span
      v-for="particle in particles"
      :key="particle.id"
      class="joao-bobo__particle"
      :style="particle.style"
      aria-hidden="true"
    />
  </button>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from "vue";

const buddyRef = ref(null);

const currentX = ref(0);
const currentY = ref(0);
const targetX = ref(0);
const targetY = ref(0);
const orbitAngle = ref(0);

const hitWave = ref(0);
const hitLift = ref(0);
const hitDirection = ref(1);
const hitElapsed = ref(0);
const isHitActive = ref(false);

const particles = ref([]);

let animationFrame = null;
let lastTimestamp = 0;
let particleId = 0;

const buddyStyle = computed(() => {
  const orbitX = Math.cos(orbitAngle.value) * 0.16;
  const orbitY = Math.sin(orbitAngle.value) * 0.12;

  const followX = currentX.value + orbitX;
  const followY = currentY.value + orbitY;

  const rotateX = followY * -5.5;
  const rotateY = followX * 8;
  const rotateZ = followX * 2.2 + hitWave.value * hitDirection.value * 10;

  return {
    "--body-x": `${followX * 4}px`,
    "--body-y": `${followY * 3 + hitLift.value}px`,
    "--tilt-x": `${rotateX}deg`,
    "--tilt-y": `${rotateY}deg`,
    "--rotate-z": `${rotateZ}deg`,
    "--scale": `${1 - Math.abs(hitWave.value) * 0.015}`,
    "--shadow-x": `${followX * 8}px`,
    "--shadow-width": `${150 + Math.abs(followX) * 14}px`,
  };
});

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function lerp(start, end, amount) {
  return start + (end - start) * amount;
}

function updateTargetByCursor(event) {
  const element = buddyRef.value;

  if (!element) return;

  const rect = element.getBoundingClientRect();

  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;

  const distanceX = event.clientX - centerX;
  const distanceY = event.clientY - centerY;

  targetX.value = clamp(distanceX / 520, -1, 1);
  targetY.value = clamp(distanceY / 460, -1, 1);
}

function animateBuddy(timestamp) {
  if (!lastTimestamp) {
    lastTimestamp = timestamp;
  }

  const delta = Math.min((timestamp - lastTimestamp) / 16.67, 2);

  lastTimestamp = timestamp;

  currentX.value = lerp(currentX.value, targetX.value, 0.055);
  currentY.value = lerp(currentY.value, targetY.value, 0.055);

  orbitAngle.value += 0.018 * delta;

  if (isHitActive.value) {
    hitElapsed.value += delta;

    const progress = clamp(hitElapsed.value / 52, 0, 1);
    const easing = Math.pow(1 - progress, 2.2);

    hitWave.value = Math.sin(progress * Math.PI * 4.5) * easing;
    hitLift.value = -Math.abs(hitWave.value) * 5;

    if (progress >= 1) {
      isHitActive.value = false;
      hitElapsed.value = 0;
      hitWave.value = 0;
      hitLift.value = 0;
    }
  }

  animationFrame = window.requestAnimationFrame(animateBuddy);
}

function createHitParticles(event) {
  const element = buddyRef.value;

  if (!element) return;

  const rect = element.getBoundingClientRect();

  const originX = event.clientX - rect.left;
  const originY = event.clientY - rect.top;

  const newParticles = Array.from({ length: 10 }, (_, index) => {
    const angle = -Math.PI / 2 + (index - 4.5) * 0.28;
    const distance = 28 + (index % 4) * 8;

    particleId += 1;

    return {
      id: particleId,
      style: {
        "--particle-x": `${originX}px`,
        "--particle-y": `${originY}px`,
        "--particle-dx": `${Math.cos(angle) * distance}px`,
        "--particle-dy": `${Math.sin(angle) * distance}px`,
        "--particle-size": `${5 + (index % 3)}px`,
        "--particle-delay": `${index * 12}ms`,
      },
    };
  });

  particles.value = [...particles.value, ...newParticles];

  window.setTimeout(() => {
    const idsToRemove = new Set(newParticles.map((particle) => particle.id));

    particles.value = particles.value.filter(
      (particle) => !idsToRemove.has(particle.id),
    );
  }, 760);
}

function handleHit(event) {
  updateTargetByCursor(event);

  hitDirection.value = targetX.value >= 0 ? 1 : -1;
  hitElapsed.value = 0;
  isHitActive.value = true;

  createHitParticles(event);
}

onMounted(() => {
  window.addEventListener("pointermove", updateTargetByCursor);
  animationFrame = window.requestAnimationFrame(animateBuddy);
});

onBeforeUnmount(() => {
  window.removeEventListener("pointermove", updateTargetByCursor);

  if (animationFrame) {
    window.cancelAnimationFrame(animationFrame);
  }
});
</script>

<style scoped>
.joao-bobo {
  position: relative;
  width: 260px;
  height: 320px;
  border: 0;
  padding: 0;
  background: transparent;
  cursor: pointer;
  outline: none;
  user-select: none;
  -webkit-tap-highlight-color: transparent;

  --body-x: 0px;
  --body-y: 0px;
  --tilt-x: 0deg;
  --tilt-y: 0deg;
  --rotate-z: 0deg;
  --scale: 1;
  --shadow-x: 0px;
  --shadow-width: 148px;
}

.joao-bobo:focus-visible {
  border-radius: 28px;
  outline: 3px solid rgba(245, 191, 36, 0.5);
  outline-offset: 8px;
}

.joao-bobo__shadow {
  position: absolute;
  left: 50%;
  bottom: 12px;
  width: var(--shadow-width);
  height: 28px;
  border-radius: 999px;
  background: radial-gradient(
    ellipse at center,
    rgba(54, 38, 7, 0.22) 0%,
    rgba(54, 38, 7, 0.14) 55%,
    rgba(54, 38, 7, 0) 100%
  );
  filter: blur(6px);
  transform: translateX(-50%) translateX(var(--shadow-x));
  transition:
    width 180ms ease,
    transform 180ms ease,
    opacity 180ms ease;
}

.joao-bobo__character {
  position: absolute;
  left: 50%;
  bottom: 28px;
  width: 220px;
  height: 285px;
  transform:
    translateX(-50%)
    translate(var(--body-x), var(--body-y))
    perspective(900px)
    rotateX(var(--tilt-x))
    rotateY(var(--tilt-y))
    rotateZ(var(--rotate-z))
    scale(var(--scale));
  transform-origin: 50% 96%;
  transform-style: preserve-3d;
  will-change: transform;
}

.joao-bobo__body,
.joao-bobo__head {
  position: absolute;
  left: 50%;
  transform-style: preserve-3d;
}

.joao-bobo__body {
  z-index: 1;
  bottom: 0;
  width: 214px;
  height: 214px;
  border-radius: 50%;
  background:
    radial-gradient(
      circle at 28% 24%,
      rgba(255, 255, 255, 0.68) 0 9%,
      transparent 24%
    ),
    radial-gradient(
      circle at 70% 74%,
      rgba(163, 100, 0, 0.22) 0 18%,
      transparent 48%
    ),
    linear-gradient(145deg, #ffe777 0%, #f4cb2e 38%, #e0a80f 75%, #c68100 100%);
  box-shadow:
    inset 16px 18px 26px rgba(255, 255, 255, 0.3),
    inset -26px -30px 34px rgba(123, 72, 0, 0.28),
    inset 0 -24px 40px rgba(125, 83, 0, 0.18),
    0 20px 34px rgba(51, 37, 8, 0.2);
  transform: translateX(-50%) translateZ(0);
}

.joao-bobo__body-highlight {
  position: absolute;
  top: 18px;
  left: 34px;
  width: 74px;
  height: 54px;
  border-radius: 50%;
  background: radial-gradient(
    ellipse at center,
    rgba(255, 255, 255, 0.5) 0%,
    rgba(255, 255, 255, 0.16) 55%,
    rgba(255, 255, 255, 0) 100%
  );
  transform: rotate(-18deg) translateZ(8px);
}

.joao-bobo__head {
  z-index: 3;
  top: 4px;
  width: 126px;
  height: 126px;
  border-radius: 50%;
  background:
    radial-gradient(
      circle at 28% 20%,
      rgba(255, 255, 255, 0.72) 0 11%,
      transparent 26%
    ),
    radial-gradient(
      circle at 72% 78%,
      rgba(158, 96, 0, 0.18) 0 20%,
      transparent 50%
    ),
    linear-gradient(145deg, #ffe97e 0%, #f7ce31 42%, #e4a912 78%, #c97f01 100%);
  box-shadow:
    inset 14px 14px 22px rgba(255, 255, 255, 0.28),
    inset -20px -24px 30px rgba(122, 73, 0, 0.23),
    0 14px 24px rgba(51, 37, 8, 0.14);
  transform: translateX(-50%) translateZ(12px);
}

.joao-bobo__head-highlight {
  position: absolute;
  top: 14px;
  left: 18px;
  width: 42px;
  height: 30px;
  border-radius: 50%;
  background: radial-gradient(
    ellipse at center,
    rgba(255, 255, 255, 0.62) 0%,
    rgba(255, 255, 255, 0.12) 55%,
    rgba(255, 255, 255, 0) 100%
  );
  transform: rotate(-18deg) translateZ(8px);
}

.joao-bobo__particle {
  position: absolute;
  left: var(--particle-x);
  top: var(--particle-y);
  z-index: 10;
  width: var(--particle-size);
  height: var(--particle-size);
  border-radius: 999px;
  background: #f8cf35;
  box-shadow:
    0 0 0 2px rgba(255, 255, 255, 0.55),
    0 4px 8px rgba(83, 54, 0, 0.18);
  pointer-events: none;
  transform: translate(-50%, -50%) scale(0.4);
  animation: particleBurst 660ms ease-out var(--particle-delay) forwards;
}

.joao-bobo__particle:nth-child(3n) {
  background: #ffffff;
}

.joao-bobo__particle:nth-child(3n + 1) {
  background: #f2b705;
}

.joao-bobo__particle:nth-child(3n + 2) {
  background: #60a5fa;
}

.joao-bobo:active .joao-bobo__character {
  filter: brightness(1.03);
}

@keyframes particleBurst {
  0% {
    opacity: 0;
    transform: translate(-50%, -50%) scale(0.35);
  }

  18% {
    opacity: 1;
  }

  100% {
    opacity: 0;
    transform:
      translate(
        calc(-50% + var(--particle-dx)),
        calc(-50% + var(--particle-dy))
      )
      scale(1);
  }
}
</style>