<template>
  <button ref="buddyRef" type="button" class="joao-bobo" :style="buddyStyle" aria-label="João bobo interativo"
    @click="handleHit">

    <span class="joao-bobo__character" aria-hidden="true">
      <span class="joao-bobo__gourd">
        <span class="joao-bobo__section joao-bobo__section--head" />
        <span class="joao-bobo__section joao-bobo__section--torso" />
        <span class="joao-bobo__section joao-bobo__section--base" />

        <span class="joao-bobo__belt" />

        <span class="joao-bobo__circle joao-bobo__circle--red">
          <span class="joao-bobo__circle-dots" />
          <span class="joao-bobo__circle-star" />
        </span>

        <span class="joao-bobo__volume joao-bobo__volume--left" />
        <span class="joao-bobo__volume joao-bobo__volume--right" />

        <span class="joao-bobo__star joao-bobo__star--left" />
        <span class="joao-bobo__star joao-bobo__star--right" />

        <span class="joao-bobo__point joao-bobo__point--top" />
        <span class="joao-bobo__base joao-bobo__base--bottom" />
      </span>
    </span>

    <span v-for="particle in particles" :key="particle.id" class="joao-bobo__particle" :style="particle.style"
      aria-hidden="true" />
  </button>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from "vue";

const buddyRef = ref(null);

const currentX = ref(0);
const currentY = ref(0);
const targetX = ref(0);
const targetY = ref(0);

const hitWave = ref(0);
const hitLift = ref(0);
const hitDirection = ref(1);
const hitElapsed = ref(0);
const isHitActive = ref(false);

const particles = ref([]);

let animationFrame = null;
let lastTimestamp = 0;
let particleId = 0;

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function lerp(start, end, amount) {
  return start + (end - start) * amount;
}

const buddyStyle = computed(() => {
  const followX = currentX.value;
  const followY = currentY.value;

  const rotateX = followY * -5.5;
  const rotateY = followX * 8;
  const rotateZ = followX * 2.2 + hitWave.value * hitDirection.value * 10;

  const starShift = followX * 18;
  const starVerticalShift = followY * 16;

  const medalVerticalShift = clamp(followY * 5, -5, 5);

  const leftStarOpacity = clamp(0.78 + followX * 0.22, 0.54, 1);
  const rightStarOpacity = clamp(0.78 - followX * 0.22, 0.54, 1);

  const leftStarScale = clamp(0.92 + followX * 0.08, 0.84, 1.04);
  const rightStarScale = clamp(0.92 - followX * 0.08, 0.84, 1.04);

  const verticalShift = followY * 16;

  const colorPerspective = clamp(followY, -1, 1);

  const headHeight = clamp(102 + colorPerspective * 18, 84, 120);

  const baseTop = clamp(136 + colorPerspective * 14, 122, 150);
  const baseHeight = clamp(152 - colorPerspective * 18, 134, 170);

  const torsoShift = starVerticalShift;

  const topPointOpacity = clamp(0.58 + followY * 0.22, 0.06, 0.82);
  const topPointScale = clamp(0.84 + followY * 0.08, 0.72, 0.96);

  const bottomBaseOpacity = clamp(0.72 - followY * 0.24, 0.16, 0.9);
  const bottomBaseScaleX = clamp(1 - followY * 0.08, 0.92, 1.08);
  const bottomBaseScaleY = clamp(1 - followY * 0.05, 0.95, 1.05);

  return {
    "--body-x": `${followX * 4}px`,
    "--body-y": `${followY * 3 + hitLift.value}px`,
    "--tilt-x": `${rotateX}deg`,
    "--tilt-y": `${rotateY}deg`,
    "--rotate-z": `${rotateZ}deg`,
    "--scale": `${1 - Math.abs(hitWave.value) * 0.015}`,
    "--shadow-x": `${followX * 8}px`,
    "--shadow-width": `${150 + Math.abs(followX) * 14}px`,

    "--star-left-shift": `${starShift}px`,
    "--star-right-shift": `${starShift}px`,
    "--star-vertical-shift": `${starVerticalShift}px`,
    "--medal-vertical-shift": `${medalVerticalShift}px`,
    "--star-left-opacity": leftStarOpacity,
    "--star-right-opacity": rightStarOpacity,
    "--star-left-scale": leftStarScale,
    "--star-right-scale": rightStarScale,

    "--point-top-shift": `${verticalShift}px`,
    "--point-top-opacity": topPointOpacity,
    "--point-top-scale": topPointScale,

    "--base-bottom-shift": `${verticalShift}px`,
    "--base-bottom-opacity": bottomBaseOpacity,
    "--base-bottom-scale-x": bottomBaseScaleX,
    "--base-bottom-scale-y": bottomBaseScaleY,

    "--head-height": `${headHeight}px`,
    "--torso-shift": `${torsoShift}px`,
    "--base-top": `${baseTop}px`,
    "--base-height": `${baseHeight}px`,
  };
});

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

  const nextX = lerp(currentX.value, targetX.value, 0.055);
  const nextY = lerp(currentY.value, targetY.value, 0.055);

  currentX.value =
    Math.abs(nextX - targetX.value) < 0.001 ? targetX.value : nextX;

  currentY.value =
    Math.abs(nextY - targetY.value) < 0.001 ? targetY.value : nextY;

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

  --star-left-shift: 0px;
  --star-right-shift: 0px;
  --star-vertical-shift: 0px;
  --medal-vertical-shift: 0px;
  --star-left-opacity: 0.78;
  --star-right-opacity: 0.78;
  --star-left-scale: 0.92;
  --star-right-scale: 0.92;

  --point-top-shift: 0px;
  --point-top-opacity: 0.58;
  --point-top-scale: 0.84;

  --base-bottom-shift: 0px;
  --base-bottom-opacity: 0.72;
  --base-bottom-scale-x: 1;
  --base-bottom-scale-y: 1;

  --head-height: 102px;
  --torso-shift: 0px;
  --base-top: 136px;
  --base-height: 152px;
}

.joao-bobo:focus-visible {
  border-radius: 28px;
  outline: 3px solid rgba(245, 191, 36, 0.35);
  outline-offset: 8px;
}

.joao-bobo__character {
  position: absolute;
  left: 50%;
  bottom: 28px;
  width: 220px;
  height: 285px;
  transform:
    translateX(-50%) translate(var(--body-x), var(--body-y)) perspective(900px) rotateX(var(--tilt-x)) rotateY(var(--tilt-y)) rotateZ(var(--rotate-z)) scale(var(--scale));
  transform-origin: 50% 96%;
  transform-style: preserve-3d;
  will-change: transform;
}

.joao-bobo__gourd {
  position: absolute;
  left: 50%;
  bottom: 0;
  width: 210px;
  height: 276px;
  overflow: hidden;
  transform: translateX(-50%);
  border-radius: 50% 50% 48% 52% / 68% 68% 30% 30%;
  background: #e0b31a;
  box-shadow:
    inset 18px 0 26px rgba(255, 255, 255, 0.18),
    inset -22px 0 28px rgba(51, 27, 5, 0.18),
    inset 0 -28px 30px rgba(41, 25, 5, 0.18);
}

.joao-bobo__section {
  position: absolute;
  left: 50%;
  width: 112%;
  pointer-events: none;
  transform: translateX(-50%);
}

.joao-bobo__section--head {
  top: -2px;
  z-index: 3;
  height: var(--head-height);
  background:
    radial-gradient(circle at 34% 22%, rgba(255, 255, 255, 0.38), transparent 32%),
    linear-gradient(135deg, #fde047 0%, #facc15 48%, #eab308 100%);
  border-radius: 50% 50% 46% 54% / 82% 82% 28% 36%;
}

.joao-bobo__section--torso {
  top: 76px;
  z-index: 2;
  height: 116px;
  background:
    radial-gradient(circle at 30% 28%, rgba(255, 255, 255, 0.28), transparent 34%),
    linear-gradient(135deg, #38bdf8 0%, #2563eb 54%, #1d4ed8 100%);
  border-radius: 48% 52% 50% 50% / 30% 34% 36% 34%;
  transform:
    translateX(-50%) translateY(var(--torso-shift));
}

.joao-bobo__section--base {
  top: var(--base-top);
  z-index: 1;
  width: 124%;
  height: var(--base-height);
  background:
    radial-gradient(circle at 36% 24%, rgba(255, 255, 255, 0.24), transparent 34%),
    linear-gradient(135deg, #fb923c 0%, #f97316 48%, #c2410c 100%);
  border-radius: 50%;
}

.joao-bobo__belt {
  position: absolute;
  top: calc(var(--base-top) - -11px);
  left: 50%;
  z-index: 5;
  width: 254px;
  height: 100px;
  border-radius: 50%;
  pointer-events: none;
  overflow: hidden;
  transform: translateX(-50%);
  will-change: top;
}

.joao-bobo__belt::before,
.joao-bobo__belt::after {
  content: "";
  position: absolute;
  left: 50%;
  width: 254px;
  height: 110px;
  border-radius: 50%;
  box-sizing: border-box;
  border-bottom: 8px solid #7dd3fc;
  background: transparent;
  transform: translateX(-50%);
}

.joao-bobo__belt::before {
  top: -60px;
}

.joao-bobo__belt::after {
  top: -40px;
}

.joao-bobo__circle {
  position: absolute;
  z-index: 6;
  pointer-events: none;
  border-radius: 999px;
  will-change: transform;
}

.joao-bobo__circle--red {
  top: calc(var(--base-top) + 40px);
  left: 50%;
  width: 52px;
  height: 52px;
  box-sizing: border-box;
  border-radius: 50%;
  background: #dc2626;
  border: 8px solid #7dd3fc;
  transform:
    translateX(-50%) translateX(var(--star-left-shift)) translateY(var(--medal-vertical-shift));
}

.joao-bobo__circle-dots {
  position: absolute;
  inset: -8px;
  z-index: 2;
  width: 52px;
  height: 52px;
  border-radius: 50%;
  pointer-events: none;
  background:
    radial-gradient(circle, #eff6ff 0 2.2px, transparent 2.4px) 23px 1px / 6px 6px no-repeat,
    radial-gradient(circle, #eff6ff 0 2.2px, transparent 2.4px) 39px 7px / 6px 6px no-repeat,
    radial-gradient(circle, #eff6ff 0 2.2px, transparent 2.4px) 45px 23px / 6px 6px no-repeat,
    radial-gradient(circle, #eff6ff 0 2.2px, transparent 2.4px) 39px 39px / 6px 6px no-repeat,
    radial-gradient(circle, #eff6ff 0 2.2px, transparent 2.4px) 23px 45px / 6px 6px no-repeat,
    radial-gradient(circle, #eff6ff 0 2.2px, transparent 2.4px) 7px 39px / 6px 6px no-repeat,
    radial-gradient(circle, #eff6ff 0 2.2px, transparent 2.4px) 1px 23px / 6px 6px no-repeat,
    radial-gradient(circle, #eff6ff 0 2.2px, transparent 2.4px) 7px 7px / 6px 6px no-repeat;
}

.joao-bobo__circle-star {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 35px;
  height: 35px;
  background: #facc15;
  transform: translate(-50%, -50%);
  clip-path: polygon(50% 0%,
      61% 34%,
      98% 35%,
      68% 56%,
      79% 91%,
      50% 70%,
      21% 91%,
      32% 56%,
      2% 35%,
      39% 34%);
}

.joao-bobo__volume {
  position: absolute;
  top: 0;
  z-index: 7;
  width: 46px;
  height: 100%;
  pointer-events: none;
}

.joao-bobo__volume--left {
  left: 0;
  background: linear-gradient(90deg,
      rgba(255, 255, 255, 0.2),
      transparent 78%);
}

.joao-bobo__volume--right {
  right: 0;
  background: linear-gradient(270deg,
      rgba(32, 20, 4, 0.24),
      transparent 78%);
}

.joao-bobo__star {
  position: absolute;
  top: 50%;
  z-index: 8;
  width: 46px;
  height: 46px;
  background: #dc2626;
  clip-path: polygon(50% 0%,
      61% 34%,
      98% 35%,
      68% 56%,
      79% 91%,
      50% 70%,
      21% 91%,
      32% 56%,
      2% 35%,
      39% 34%);
  pointer-events: none;
  will-change: transform, opacity;
}

.joao-bobo__star--left {
  left: -23px;
  opacity: var(--star-left-opacity);
  transform:
    translateY(calc(-50% + var(--star-vertical-shift))) translateX(var(--star-left-shift)) scale(var(--star-left-scale)) rotate(-8deg);
}

.joao-bobo__star--right {
  right: -23px;
  opacity: var(--star-right-opacity);
  transform:
    translateY(calc(-50% + var(--star-vertical-shift))) translateX(var(--star-right-shift)) scale(var(--star-right-scale)) rotate(8deg);
}

.joao-bobo__point {
  position: absolute;
  left: 50%;
  z-index: 9;
  width: 18px;
  height: 18px;
  border-radius: 999px;
  background: #22c55e;
  pointer-events: none;
  will-change: transform, opacity;
}

.joao-bobo__point--top {
  top: -7px;
  opacity: var(--point-top-opacity);
  transform:
    translateX(-50%) translateY(var(--point-top-shift)) scale(var(--point-top-scale));
}

.joao-bobo__base {
  position: absolute;
  left: 50%;
  bottom: -10px;
  z-index: 9;
  width: 104px;
  height: 24px;
  border-radius: 999px;
  background: rgba(30, 41, 59, 0.42);
  pointer-events: none;
  will-change: transform, opacity;
}

.joao-bobo__base--bottom {
  opacity: var(--base-bottom-opacity);
  transform:
    translateX(-50%) translateY(var(--base-bottom-shift)) scaleX(var(--base-bottom-scale-x)) scaleY(var(--base-bottom-scale-y));
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
      translate(calc(-50% + var(--particle-dx)),
        calc(-50% + var(--particle-dy))) scale(1);
  }
}
</style>