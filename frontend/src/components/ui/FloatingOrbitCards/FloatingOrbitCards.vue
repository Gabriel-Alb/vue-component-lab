<template>
  <section
    class="relative flex min-h-[420px] w-full items-center justify-center overflow-hidden px-5 py-12"
  >
    <!-- CARDS DECORATIVOS -->
    <div
      v-for="card in orbitCards"
      :key="card.id"
      :class="[
        'orbit-card-position pointer-events-none absolute z-0',
        `orbit-card-position--${card.id}`,
      ]"
      :style="{
        '--reveal-delay': `${card.revealDelay}ms`,
        '--from-x': card.fromX,
        '--from-y': card.fromY,
      }"
      aria-hidden="true"
    >
      <div
        :class="[
          'orbit-card relative',
          `orbit-card--animation-${card.animation}`,
        ]"
        :style="{
          '--float-duration': `${card.duration}s`,
          '--float-delay': `${card.floatDelay}s`,
        }"
      >
        <!-- BRILHO -->
        <div
          class="absolute inset-0 scale-[1.45] rounded-2xl opacity-60 blur-xl"
          :style="{ background: card.gradient }"
        />

        <!-- CARD -->
        <div
          class="relative h-14 w-14 rounded-2xl border border-white/40 shadow-[0_14px_35px_rgba(99,102,241,0.22)] sm:h-16 sm:w-16"
          :style="{ background: card.gradient }"
        >
          <div
            class="absolute inset-[1px] rounded-[15px] bg-gradient-to-br from-white/25 via-white/5 to-transparent"
          />
        </div>
      </div>
    </div>

    <!-- TÍTULO -->
    <h2
      class="relative z-10 text-center text-3xl font-semibold tracking-[-0.04em] text-zinc-900 sm:text-4xl dark:text-white"
    >
      {{ title }}
    </h2>
  </section>
</template>

<script setup>
defineProps({
  title: {
    type: String,
    default: "Cards",
  },
});

const orbitCards = [
  {
    id: 1,
    animation: 1,
    revealDelay: 80,
    duration: 8,
    floatDelay: -1,
    fromX: "190px",
    fromY: "100px",
    gradient:
      "linear-gradient(135deg, #7c3aed 0%, #a78bfa 48%, #60a5fa 100%)",
  },
  {
    id: 2,
    animation: 2,
    revealDelay: 160,
    duration: 10,
    floatDelay: -4,
    fromX: "70px",
    fromY: "160px",
    gradient:
      "linear-gradient(135deg, #9333ea 0%, #c084fc 48%, #38bdf8 100%)",
  },
  {
    id: 3,
    animation: 3,
    revealDelay: 240,
    duration: 9,
    floatDelay: -2,
    fromX: "-90px",
    fromY: "140px",
    gradient:
      "linear-gradient(135deg, #4f46e5 0%, #8b5cf6 50%, #7dd3fc 100%)",
  },
  {
    id: 4,
    animation: 4,
    revealDelay: 320,
    duration: 11,
    floatDelay: -5,
    fromX: "-190px",
    fromY: "60px",
    gradient:
      "linear-gradient(135deg, #8b5cf6 0%, #d946ef 48%, #60a5fa 100%)",
  },
  {
    id: 5,
    animation: 5,
    revealDelay: 400,
    duration: 8.5,
    floatDelay: -3,
    fromX: "-180px",
    fromY: "-90px",
    gradient:
      "linear-gradient(135deg, #6366f1 0%, #a78bfa 52%, #0ea5e9 100%)",
  },
  {
    id: 6,
    animation: 6,
    revealDelay: 480,
    duration: 10.5,
    floatDelay: -6,
    fromX: "-60px",
    fromY: "-150px",
    gradient:
      "linear-gradient(135deg, #7c3aed 0%, #c4b5fd 50%, #38bdf8 100%)",
  },
  {
    id: 7,
    animation: 7,
    revealDelay: 560,
    duration: 9.5,
    floatDelay: -2,
    fromX: "80px",
    fromY: "-140px",
    gradient:
      "linear-gradient(135deg, #6d28d9 0%, #a855f7 48%, #7dd3fc 100%)",
  },
  {
    id: 8,
    animation: 8,
    revealDelay: 640,
    duration: 12,
    floatDelay: -7,
    fromX: "180px",
    fromY: "-70px",
    gradient:
      "linear-gradient(135deg, #4f46e5 0%, #d8b4fe 52%, #60a5fa 100%)",
  },
];
</script>

<style scoped>
.orbit-card-position {
  opacity: 0;
  transform: translate(var(--from-x), var(--from-y)) scale(0.3);
  animation: reveal-card 900ms cubic-bezier(0.16, 1, 0.3, 1) forwards;
  animation-delay: var(--reveal-delay);
}

/* POSICIONAMENTO */

.orbit-card-position--1 {
  top: 14%;
  left: 14%;
}

.orbit-card-position--2 {
  top: 9%;
  left: 42%;
}

.orbit-card-position--3 {
  top: 17%;
  right: 15%;
}

.orbit-card-position--4 {
  top: 42%;
  right: 7%;
}

.orbit-card-position--5 {
  right: 17%;
  bottom: 12%;
}

.orbit-card-position--6 {
  bottom: 8%;
  left: 43%;
}

.orbit-card-position--7 {
  bottom: 15%;
  left: 13%;
}

.orbit-card-position--8 {
  top: 44%;
  left: 7%;
}

/* ANIMAÇÃO CONTÍNUA */

.orbit-card {
  animation-duration: var(--float-duration);
  animation-delay: var(--float-delay);
  animation-iteration-count: infinite;
  animation-timing-function: ease-in-out;
  will-change: transform;
}

.orbit-card--animation-1 {
  animation-name: orbit-movement-1;
}

.orbit-card--animation-2 {
  animation-name: orbit-movement-2;
}

.orbit-card--animation-3 {
  animation-name: orbit-movement-3;
}

.orbit-card--animation-4 {
  animation-name: orbit-movement-4;
}

.orbit-card--animation-5 {
  animation-name: orbit-movement-5;
}

.orbit-card--animation-6 {
  animation-name: orbit-movement-6;
}

.orbit-card--animation-7 {
  animation-name: orbit-movement-7;
}

.orbit-card--animation-8 {
  animation-name: orbit-movement-8;
}

@keyframes reveal-card {
  from {
    opacity: 0;
    transform: translate(var(--from-x), var(--from-y)) scale(0.3)
      rotate(-12deg);
  }

  to {
    opacity: 1;
    transform: translate(0, 0) scale(1) rotate(0deg);
  }
}

@keyframes orbit-movement-1 {
  0%,
  100% {
    transform: translate(0, 0) rotate(-2deg);
  }

  25% {
    transform: translate(18px, -10px) rotate(3deg);
  }

  50% {
    transform: translate(9px, 16px) rotate(-1deg);
  }

  75% {
    transform: translate(-12px, 8px) rotate(2deg);
  }
}

@keyframes orbit-movement-2 {
  0%,
  100% {
    transform: translate(0, 0) rotate(2deg);
  }

  30% {
    transform: translate(-14px, 13px) rotate(-3deg);
  }

  60% {
    transform: translate(15px, 18px) rotate(3deg);
  }

  80% {
    transform: translate(20px, -8px) rotate(1deg);
  }
}

@keyframes orbit-movement-3 {
  0%,
  100% {
    transform: translate(0, 0) rotate(1deg);
  }

  25% {
    transform: translate(-18px, -9px) rotate(-3deg);
  }

  55% {
    transform: translate(-8px, 18px) rotate(2deg);
  }

  80% {
    transform: translate(14px, 7px) rotate(-1deg);
  }
}

@keyframes orbit-movement-4 {
  0%,
  100% {
    transform: translate(0, 0) rotate(-1deg);
  }

  30% {
    transform: translate(12px, 16px) rotate(3deg);
  }

  55% {
    transform: translate(-15px, 9px) rotate(-2deg);
  }

  80% {
    transform: translate(-9px, -14px) rotate(2deg);
  }
}

@keyframes orbit-movement-5 {
  0%,
  100% {
    transform: translate(0, 0) rotate(2deg);
  }

  20% {
    transform: translate(-17px, 5px) rotate(-2deg);
  }

  50% {
    transform: translate(-5px, -17px) rotate(3deg);
  }

  75% {
    transform: translate(15px, -10px) rotate(-1deg);
  }
}

@keyframes orbit-movement-6 {
  0%,
  100% {
    transform: translate(0, 0) rotate(-2deg);
  }

  25% {
    transform: translate(13px, -16px) rotate(2deg);
  }

  50% {
    transform: translate(-13px, -9px) rotate(-3deg);
  }

  75% {
    transform: translate(-18px, 12px) rotate(1deg);
  }
}

@keyframes orbit-movement-7 {
  0%,
  100% {
    transform: translate(0, 0) rotate(1deg);
  }

  30% {
    transform: translate(16px, 8px) rotate(-2deg);
  }

  55% {
    transform: translate(8px, -18px) rotate(3deg);
  }

  80% {
    transform: translate(-15px, -7px) rotate(-1deg);
  }
}

@keyframes orbit-movement-8 {
  0%,
  100% {
    transform: translate(0, 0) rotate(-1deg);
  }

  20% {
    transform: translate(-10px, -16px) rotate(3deg);
  }

  50% {
    transform: translate(16px, -6px) rotate(-2deg);
  }

  75% {
    transform: translate(8px, 15px) rotate(2deg);
  }
}

@media (max-width: 768px) {
  .orbit-card-position--1 {
    top: 12%;
    left: 6%;
  }

  .orbit-card-position--2 {
    top: 7%;
    left: 43%;
  }

  .orbit-card-position--3 {
    top: 14%;
    right: 5%;
  }

  .orbit-card-position--4 {
    top: 46%;
    right: 1%;
  }

  .orbit-card-position--5 {
    right: 6%;
    bottom: 10%;
  }

  .orbit-card-position--6 {
    bottom: 5%;
    left: 43%;
  }

  .orbit-card-position--7 {
    bottom: 12%;
    left: 4%;
  }

  .orbit-card-position--8 {
    top: 47%;
    left: 1%;
  }
}

@media (prefers-reduced-motion: reduce) {
  .orbit-card-position,
  .orbit-card {
    animation: none;
  }

  .orbit-card-position {
    opacity: 1;
    transform: none;
  }
}
</style>