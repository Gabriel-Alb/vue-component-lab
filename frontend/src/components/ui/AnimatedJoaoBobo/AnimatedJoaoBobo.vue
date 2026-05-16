<template>
  <ClickSpark
    target-selector=".joao-bobo"
    spark-color="rgba(239, 91, 36, 0.42)"
    :spark-radius="18"
    :spark-length="7"
    :spark-thickness="2"
    :spark-count="10"
    :duration="420"
  />

  <button
    ref="buddyRef"
    type="button"
    class="joao-bobo"
    :class="{
      'joao-bobo--blink': isEyeBlinking,
      'joao-bobo--spiral': isEyeSpiralActive,
    }"
    :style="buddyStyle"
    aria-label="João bobo interativo"
    @click="handleHit"
  >
    <span class="joao-bobo__character" aria-hidden="true">
      <span class="joao-bobo__gourd">
        <span class="joao-bobo__section joao-bobo__section--head" />
        <span class="joao-bobo__section joao-bobo__section--torso" />
        <span class="joao-bobo__section joao-bobo__section--base" />

        <span class="joao-bobo__face">
          <span class="joao-bobo__eye joao-bobo__eye--left" />
          <span class="joao-bobo__eye joao-bobo__eye--right" />
          <span class="joao-bobo__nose" />
          <span class="joao-bobo__mouth" />
        </span>

        <span class="joao-bobo__belt" />

        <span class="joao-bobo__circle joao-bobo__circle--red">
          <span class="joao-bobo__circle-dots" />
          <span class="joao-bobo__circle-star" />
        </span>

        <span class="joao-bobo__volume joao-bobo__volume--left" />
        <span class="joao-bobo__volume joao-bobo__volume--right" />

        <span class="joao-bobo__star joao-bobo__star--left" />
        <span class="joao-bobo__star joao-bobo__star--right" />

        <span class="joao-bobo__base joao-bobo__base--bottom" />
      </span>
    </span>
  </button>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import ClickSpark from "../ClickSpark/ClickSpark.vue";

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

const isEyeBlinking = ref(false);
const isEyeSpiralActive = ref(false);
const hitCount = ref(0);

const BLINK_DURATION = 260;
const TRIPLE_HIT_INTERVAL = 700;
const SPIRAL_DURATION = 10000;

let animationFrame = null;
let lastTimestamp = 0;
let blinkTimeout = null;
let hitSequenceTimeout = null;
let spiralTimeout = null;

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

  const faceShiftX = followX * 4;
  const faceShiftY = followY * 3;

  const eyeLeftShift = followX * 5;
  const eyeRightShift = followX * 5;
  const eyeVerticalShift = followY * 5;

  const eyeLeftScale = clamp(1 + followX * 0.035, 0.96, 1.04);
  const eyeRightScale = clamp(1 - followX * 0.035, 0.96, 1.04);

  const pupilX = followX * 3.5;
  const pupilY = followY * 2.8;

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

    "--face-shift-x": `${faceShiftX}px`,
    "--face-shift-y": `${faceShiftY}px`,
    "--eye-left-shift": `${eyeLeftShift}px`,
    "--eye-right-shift": `${eyeRightShift}px`,
    "--eye-vertical-shift": `${eyeVerticalShift}px`,
    "--eye-left-scale": eyeLeftScale,
    "--eye-right-scale": eyeRightScale,
    "--pupil-x": `${pupilX}px`,
    "--pupil-y": `${pupilY}px`,
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

  const followAmount = 1 - Math.pow(0.94, delta);

  const nextX = lerp(currentX.value, targetX.value, followAmount);
  const nextY = lerp(currentY.value, targetY.value, followAmount);

  currentX.value =
    Math.abs(nextX - targetX.value) < 0.0008 ? targetX.value : nextX;

  currentY.value =
    Math.abs(nextY - targetY.value) < 0.0008 ? targetY.value : nextY;

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

function blinkEyes() {
  if (isEyeSpiralActive.value) return;

  isEyeBlinking.value = false;

  if (blinkTimeout) {
    window.clearTimeout(blinkTimeout);
  }

  window.requestAnimationFrame(() => {
    isEyeBlinking.value = true;

    blinkTimeout = window.setTimeout(() => {
      isEyeBlinking.value = false;
    }, BLINK_DURATION);
  });
}

function activateSpiralEyes() {
  isEyeBlinking.value = false;
  isEyeSpiralActive.value = true;
  hitCount.value = 0;

  if (blinkTimeout) {
    window.clearTimeout(blinkTimeout);
  }

  if (hitSequenceTimeout) {
    window.clearTimeout(hitSequenceTimeout);
  }

  if (spiralTimeout) {
    window.clearTimeout(spiralTimeout);
  }

  spiralTimeout = window.setTimeout(() => {
    isEyeSpiralActive.value = false;
  }, SPIRAL_DURATION);
}

function registerHitSequence() {
  hitCount.value += 1;

  if (hitSequenceTimeout) {
    window.clearTimeout(hitSequenceTimeout);
  }

  if (hitCount.value >= 3) {
    activateSpiralEyes();
    return;
  }

  hitSequenceTimeout = window.setTimeout(() => {
    hitCount.value = 0;
  }, TRIPLE_HIT_INTERVAL);
}

function handleHit(event) {
  updateTargetByCursor(event);

  hitDirection.value = targetX.value >= 0 ? 1 : -1;
  hitElapsed.value = 0;
  isHitActive.value = true;

  blinkEyes();
  registerHitSequence();
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

  if (blinkTimeout) {
    window.clearTimeout(blinkTimeout);
  }

  if (hitSequenceTimeout) {
    window.clearTimeout(hitSequenceTimeout);
  }

  if (spiralTimeout) {
    window.clearTimeout(spiralTimeout);
  }
});
</script>

<style scoped>
.joao-bobo {
  position: relative;
  width: 260px;
  height: 340px;
  border: 0;
  padding: 0;
  background: transparent;
  cursor: pointer;
  outline: none;
  user-select: none;
  -webkit-tap-highlight-color: transparent;

  /* ── Cores base + variações mais vivas ── */
  --skin: #f0d19f;
  --skin-light: #ffe2aa;
  --skin-dark: #d79d52;

  --head: #00306b;
  --head-light: #006ed6;
  --head-mid: #004f9f;
  --head-dark: #001f50;

  --torso: #efac2f;
  --torso-light: #ffd34f;
  --torso-mid: #f4a51f;
  --torso-dark: #bd7200;

  --accent: #ef5b24;
  --accent-light: #ff7a34;
  --accent-mid: #f04a17;
  --accent-dark: #b83208;

  --detail: #51a5b6;
  --detail-light: #7ee7f6;
  --detail-mid: #22b6cf;
  --detail-dark: #087287;

  --circle-detail: #de9613;
  --circle-detail-light: #ffd23e;
  --circle-detail-mid: #eca015;
  --circle-detail-dark: #a76100;

  --eye-blue-light: #b5f5ff;
  --eye-blue: #12c6eb;
  --eye-blue-dark: #066fb8;

  --ink: #111827;

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

  --face-shift-x: 0px;
  --face-shift-y: 0px;
  --eye-left-shift: 0px;
  --eye-right-shift: 0px;
  --eye-vertical-shift: 0px;
  --eye-left-scale: 1;
  --eye-right-scale: 1;
  --pupil-x: 0px;
  --pupil-y: 0px;
}

.joao-bobo:focus-visible {
  border-radius: 28px;
  outline: 3px solid rgba(239, 172, 47, 0.46);
  outline-offset: 8px;
}

.joao-bobo__character {
  position: absolute;
  left: 50%;
  bottom: 38px;
  width: 220px;
  height: 285px;
  transform:
    translateX(-50%)
    translate3d(var(--body-x), var(--body-y), 0)
    perspective(900px)
    rotateX(var(--tilt-x))
    rotateY(var(--tilt-y))
    rotateZ(var(--rotate-z))
    scale(var(--scale));
  transform-origin: 50% 96%;
  transform-style: preserve-3d;
  backface-visibility: hidden;
  will-change: transform;
  filter: drop-shadow(0 18px 18px rgba(0, 0, 0, 0.2));
}

/* ── Corpo geral ── */
.joao-bobo__gourd {
  position: absolute;
  left: 50%;
  bottom: 0;
  z-index: 1;
  width: 210px;
  height: 276px;
  overflow: hidden;
  transform: translateX(-50%);
  border-radius: 50% 50% 48% 52% / 68% 68% 30% 30%;
  background: var(--head);
  box-shadow:
    inset 0 -18px 28px rgba(0, 0, 0, 0.14),
    0 22px 44px rgba(0, 0, 0, 0.22);
  backface-visibility: hidden;
}

.joao-bobo__gourd::before,
.joao-bobo__gourd::after {
  display: none;
}

/* ── Seções ── */
.joao-bobo__section {
  position: absolute;
  left: 50%;
  width: 112%;
  pointer-events: none;
  transform: translateX(-50%);
  backface-visibility: hidden;
}

/* Cabeça */
.joao-bobo__section--head {
  top: 0;
  z-index: 3;
  height: calc(var(--head-height) + 12px);
  border-radius: 50% 50% 46% 54% / 86% 86% 28% 36%;
  background:
    linear-gradient(
      145deg,
      var(--head-light) 0%,
      var(--head-mid) 42%,
      var(--head) 68%,
      var(--head-dark) 100%
    );
  box-shadow:
    inset 0 -18px 28px rgba(0, 0, 0, 0.14),
    0 12px 24px rgba(0, 0, 0, 0.16);
}

/* Dorso */
.joao-bobo__section--torso {
  top: 76px;
  z-index: 2;
  height: 116px;
  border-radius: 48% 52% 50% 50% / 30% 34% 36% 34%;
  background:
    linear-gradient(
      145deg,
      var(--torso-light) 0%,
      var(--torso) 44%,
      var(--torso-mid) 68%,
      var(--torso-dark) 100%
    );
  box-shadow:
    inset 0 -18px 28px rgba(0, 0, 0, 0.13),
    0 10px 22px rgba(0, 0, 0, 0.13);
  transform:
    translateX(-50%)
    translateY(var(--torso-shift));
}

/* Base */
.joao-bobo__section--base {
  top: var(--base-top);
  z-index: 1;
  width: 124%;
  height: var(--base-height);
  border-radius: 50%;
  background:
    linear-gradient(
      145deg,
      var(--head-light) 0%,
      var(--head-mid) 42%,
      var(--head) 68%,
      var(--head-dark) 100%
    );
  box-shadow:
    inset 0 -20px 30px rgba(0, 0, 0, 0.18),
    0 18px 34px rgba(0, 0, 0, 0.2);
}

/* ── Face ── */
.joao-bobo__face {
  position: absolute;
  top: 5px;
  left: 50%;
  z-index: 12;
  width: 127px;
  height: 100px;
  pointer-events: none;
  transform:
    translateX(-50%)
    translate3d(var(--face-shift-x), var(--face-shift-y), 0);
  will-change: transform;
  backface-visibility: hidden;
}

.joao-bobo__eye {
  will-change: transform;
}

/* Máscara / olhos externos */
.joao-bobo__eye--left,
.joao-bobo__eye--right {
  position: absolute;
  top: 14px;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  overflow: hidden;
  background:
    linear-gradient(
      145deg,
      var(--detail-light) 0%,
      var(--detail-mid) 46%,
      var(--detail) 70%,
      var(--detail-dark) 100%
    );
  clip-path: polygon(
    0% 100%,
    0% 8%,
    100% 34%,
    100% 100%
  );
  box-shadow:
    inset 0 -10px 16px rgba(0, 0, 0, 0.14),
    0 3px 6px rgba(0, 0, 0, 0.12);
}

.joao-bobo__eye--left {
  left: 4px;
  transform:
    translateX(var(--eye-left-shift))
    translateY(var(--eye-vertical-shift))
    scale(var(--eye-left-scale))
    rotate(15deg);
  transform-origin: 50% 50%;
}

.joao-bobo__eye--right {
  right: 4px;
  transform:
    translateX(var(--eye-right-shift))
    translateY(var(--eye-vertical-shift))
    scaleX(-1)
    scale(var(--eye-right-scale))
    rotate(15deg);
  transform-origin: 50% 50%;
}

/* Parte interna dos olhos */
.joao-bobo__eye--left::before,
.joao-bobo__eye--right::before {
  content: "";
  position: absolute;
  top: 50%;
  left: 50%;
  width: 42px;
  height: 42px;
  border-radius: 50%;
  background:
    linear-gradient(
      145deg,
      var(--skin-light) 0%,
      var(--skin) 58%,
      var(--skin-dark) 100%
    );
  transform: translate(-50%, -50%);
  clip-path: polygon(
    0% 100%,
    0% 8%,
    100% 34%,
    100% 100%
  );
  box-shadow: inset 0 -6px 10px rgba(0, 0, 0, 0.08);
}

/* Pupila + íris azul + brilho */
.joao-bobo__eye--left::after,
.joao-bobo__eye--right::after {
  content: "";
  position: absolute;
  top: 53%;
  left: 50%;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  transform: translate(-50%, -50%);
  transform-origin: 50% 50%;
  box-shadow:
    inset 2px 2px 4px rgba(255, 255, 255, 0.3),
    inset -2px -2px 4px rgba(0, 36, 90, 0.2);
}

.joao-bobo__eye--left::after {
  background:
    radial-gradient(
      circle at calc(42% + var(--pupil-x)) calc(38% + var(--pupil-y)),
      rgba(255, 255, 255, 0.98) 0 2px,
      transparent 2.5px
    ),
    radial-gradient(
      circle at calc(50% + var(--pupil-x)) calc(50% + var(--pupil-y)),
      var(--ink) 0 4px,
      transparent 4.6px
    ),
    radial-gradient(
      circle at 34% 28%,
      var(--eye-blue-light) 0%,
      var(--eye-blue) 52%,
      var(--eye-blue-dark) 100%
    );
}

.joao-bobo__eye--right::after {
  background:
    radial-gradient(
      circle at calc(42% - var(--pupil-x)) calc(38% + var(--pupil-y)),
      rgba(255, 255, 255, 0.98) 0 2px,
      transparent 2.5px
    ),
    radial-gradient(
      circle at calc(50% - var(--pupil-x)) calc(50% + var(--pupil-y)),
      var(--ink) 0 4px,
      transparent 4.6px
    ),
    radial-gradient(
      circle at 34% 28%,
      var(--eye-blue-light) 0%,
      var(--eye-blue) 52%,
      var(--eye-blue-dark) 100%
    );
}

/* Nariz */
.joao-bobo__nose {
  position: absolute;
  top: 59px;
  left: 50%;
  z-index: 8;
  width: 0;
  height: 0;
  background: transparent;
  border-left: 10px solid transparent;
  border-right: 10px solid transparent;
  border-bottom: 14px solid var(--accent-light);
  filter: drop-shadow(0 2px 0 rgba(180, 44, 8, 0.34));
  transform:
    translateX(calc(-50% + var(--eye-left-shift)))
    translateY(var(--eye-vertical-shift));
  transform-origin: 50% 50%;
  pointer-events: none;
  will-change: transform;
}

/* Boca */
.joao-bobo__mouth {
  position: absolute;
  top: 75px;
  left: 50%;
  z-index: 8;
  width: 58px;
  height: 25px;
  box-sizing: border-box;
  border: 5px solid var(--detail-mid);
  border-radius: 50%;
  background:
    linear-gradient(
      145deg,
      var(--skin-light) 0%,
      var(--skin) 58%,
      var(--skin-dark) 100%
    );
  box-shadow:
    inset 0 -6px 10px rgba(0, 0, 0, 0.08),
    0 2px 4px rgba(0, 0, 0, 0.1);
  transform:
    translateX(calc(-50% + var(--eye-left-shift)))
    translateY(var(--eye-vertical-shift));
  transform-origin: 50% 50%;
  pointer-events: none;
  will-change: transform;
}

.joao-bobo__mouth::after {
  content: "";
  position: absolute;
  left: 50%;
  top: 4px;
  width: 28px;
  height: 12px;
  border-top: 4px solid var(--ink);
  border-radius: 50% 50% 0 0;
  transform: translateX(-50%);
}

.joao-bobo--spiral .joao-bobo__mouth::after {
  top: 2px;
  width: 30px;
  height: 12px;
  border: 0;
  border-radius: 0;
  background:
    url("data:image/svg+xml,%3Csvg width='60' height='24' viewBox='0 0 60 24' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M4 12 C9 4 15 4 20 12 C25 20 31 20 36 12 C41 4 47 4 56 12' fill='none' stroke='%23111827' stroke-width='6' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")
    center / contain no-repeat;
  transform: translateX(-50%);
}

/* Estados dos olhos */
.joao-bobo--blink .joao-bobo__eye--left::after,
.joao-bobo--blink .joao-bobo__eye--right::after {
  animation: joao-bobo-pupil-blink 260ms ease-in-out;
}

.joao-bobo--spiral .joao-bobo__eye--left::after,
.joao-bobo--spiral .joao-bobo__eye--right::after {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background:
    url("data:image/svg+xml,%3Csvg width='120' height='120' viewBox='0 0 120 120' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M60 60 C73 60 73 45 60 45 C38 45 38 75 60 75 C94 75 94 30 60 30 C18 30 18 94 60 94' fill='none' stroke='black' stroke-width='7' stroke-linecap='round'/%3E%3C/svg%3E")
    center / contain no-repeat;
  box-shadow: none;
  animation: joao-bobo-eye-spiral 680ms linear infinite;
}

/* Cinto — sólido */
.joao-bobo__belt {
  position: absolute;
  top: calc(var(--base-top) - -11px);
  left: 50%;
  z-index: 11;
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
  background: transparent;
  transform: translateX(-50%);
}

.joao-bobo__belt::before {
  top: -60px;
  border-bottom: 8px solid var(--detail-dark);
}

.joao-bobo__belt::after {
  top: -40px;
  border-bottom: 8px solid var(--detail-light);
  opacity: 1;
}

/* Medalha */
.joao-bobo__circle {
  position: absolute;
  z-index: 12;
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
  background:
    linear-gradient(
      145deg,
      var(--head-light) 0%,
      var(--head-mid) 46%,
      var(--head) 70%,
      var(--head-dark) 100%
    );
  border: 8px solid var(--detail-mid);
  box-shadow:
    inset 0 -10px 14px rgba(0, 0, 0, 0.14),
    0 4px 8px rgba(0, 0, 0, 0.16);
  transform:
    translateX(-50%)
    translateX(var(--star-left-shift))
    translateY(var(--medal-vertical-shift));
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
    radial-gradient(circle, var(--circle-detail-light) 0 2.4px, transparent 2.7px) 23px 1px / 6px 6px no-repeat,
    radial-gradient(circle, var(--circle-detail-light) 0 2.4px, transparent 2.7px) 39px 7px / 6px 6px no-repeat,
    radial-gradient(circle, var(--circle-detail-light) 0 2.4px, transparent 2.7px) 45px 23px / 6px 6px no-repeat,
    radial-gradient(circle, var(--circle-detail-light) 0 2.4px, transparent 2.7px) 39px 39px / 6px 6px no-repeat,
    radial-gradient(circle, var(--circle-detail-light) 0 2.4px, transparent 2.7px) 23px 45px / 6px 6px no-repeat,
    radial-gradient(circle, var(--circle-detail-light) 0 2.4px, transparent 2.7px) 7px 39px / 6px 6px no-repeat,
    radial-gradient(circle, var(--circle-detail-light) 0 2.4px, transparent 2.7px) 1px 23px / 6px 6px no-repeat,
    radial-gradient(circle, var(--circle-detail-light) 0 2.4px, transparent 2.7px) 7px 7px / 6px 6px no-repeat;
}

.joao-bobo__circle-star {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 35px;
  height: 35px;
  background:
    linear-gradient(
      145deg,
      var(--torso-light) 0%,
      var(--circle-detail-light) 38%,
      var(--circle-detail-mid) 68%,
      var(--circle-detail-dark) 100%
    );
  transform: translate(-50%, -50%);
  clip-path: polygon(
    50% 0%,
    61% 34%,
    98% 35%,
    68% 56%,
    79% 91%,
    50% 70%,
    21% 91%,
    32% 56%,
    2% 35%,
    39% 34%
  );
}

/* Laterais removidas visualmente, mas elementos preservados no template */
.joao-bobo__volume {
  display: none;
}

/* Estrelas laterais */
.joao-bobo__star {
  position: absolute;
  top: 50%;
  z-index: 14;
  width: 46px;
  height: 46px;
  background:
    linear-gradient(
      145deg,
      var(--accent-light) 0%,
      var(--accent) 44%,
      var(--accent-mid) 68%,
      var(--accent-dark) 100%
    );
  clip-path: polygon(
    50% 0%,
    61% 34%,
    98% 35%,
    68% 56%,
    79% 91%,
    50% 70%,
    21% 91%,
    32% 56%,
    2% 35%,
    39% 34%
  );
  pointer-events: none;
  will-change: transform, opacity;
  filter: drop-shadow(0 4px 6px rgba(0, 0, 0, 0.16));
}

.joao-bobo__star--left {
  left: -23px;
  opacity: var(--star-left-opacity);
  transform:
    translateY(calc(-50% + var(--star-vertical-shift)))
    translateX(var(--star-left-shift))
    scale(var(--star-left-scale))
    rotate(-8deg);
}

.joao-bobo__star--right {
  right: -23px;
  opacity: var(--star-right-opacity);
  transform:
    translateY(calc(-50% + var(--star-vertical-shift)))
    translateX(var(--star-right-shift))
    scale(var(--star-right-scale))
    rotate(8deg);
}

/* Base oval inferior */
.joao-bobo__base {
  position: absolute;
  left: 50%;
  bottom: -10px;
  z-index: 15;
  width: 104px;
  height: 24px;
  border-radius: 999px;
  background: rgba(0, 0, 0, 0.28);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.18);
  pointer-events: none;
  will-change: transform, opacity;
}

.joao-bobo__base--bottom {
  opacity: var(--base-bottom-opacity);
  transform:
    translateX(-50%)
    translateY(var(--base-bottom-shift))
    scaleX(var(--base-bottom-scale-x))
    scaleY(var(--base-bottom-scale-y));
}

/* Animações */
@keyframes joao-bobo-pupil-blink {
  0%,
  100% {
    transform: translate(-50%, -50%) scaleY(1);
    opacity: 1;
  }

  45%,
  55% {
    transform: translate(-50%, -50%) scaleY(0.08);
    opacity: 0.2;
  }
}

@keyframes joao-bobo-eye-spiral {
  from {
    transform: translate(-50%, -50%) rotate(0deg);
  }

  to {
    transform: translate(-50%, -50%) rotate(360deg);
  }
}
</style>