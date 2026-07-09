<template>
  <article
    class="organic-card group relative overflow-hidden rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_18px_50px_rgba(15,23,42,0.08)] transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_24px_70px_rgba(15,23,42,0.14)]"
  >
    <!-- FUNDO ORGÂNICO ANIMADO -->
    <div class="pointer-events-none absolute inset-0 overflow-hidden rounded-[28px]">
      <span class="organic-blob organic-blob-one"></span>
      <span class="organic-blob organic-blob-two"></span>
      <span class="organic-blob organic-blob-three"></span>
    </div>

    <!-- CONTEÚDO -->
    <div class="relative z-10 flex items-start gap-4">
      <!-- ÍCONE -->
      <div
        class="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-slate-950 text-white shadow-[0_10px_28px_rgba(15,23,42,0.22)] transition-transform duration-500 group-hover:scale-105"
      >
        <slot name="icon">
          <span class="text-lg font-bold">{{ icon }}</span>
        </slot>
      </div>

      <!-- TEXTOS -->
      <div class="min-w-0 flex-1">
        <p
          v-if="label"
          class="mb-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400"
        >
          {{ label }}
        </p>

        <h3 class="text-lg font-bold text-slate-950">
          {{ title }}
        </h3>

        <p class="mt-1 text-sm leading-6 text-slate-500">
          {{ description }}
        </p>

        <div v-if="$slots.default" class="mt-4">
          <slot />
        </div>
      </div>
    </div>
  </article>
</template>

<script setup>
defineProps({
  icon: {
    type: String,
    default: "↗",
  },
  label: {
    type: String,
    default: "",
  },
  title: {
    type: String,
    default: "Componente UI",
  },
  description: {
    type: String,
    default: "Um card reutilizável com animação orgânica e visual moderno.",
  },
});
</script>

<style scoped>
.organic-card {
  isolation: isolate;
}

.organic-blob {
  position: absolute;
  display: block;
  border-radius: 999px;
  filter: blur(18px);
  opacity: 0.7;
  transform-origin: center;
}

.organic-blob-one {
  width: 150px;
  height: 150px;
  right: -56px;
  top: -54px;
  background: rgba(37, 99, 235, 0.18);
  animation: organicFloatOne 8s ease-in-out infinite;
}

.organic-blob-two {
  width: 120px;
  height: 120px;
  left: -42px;
  bottom: -44px;
  background: rgba(124, 58, 237, 0.15);
  animation: organicFloatTwo 9s ease-in-out infinite;
}

.organic-blob-three {
  width: 80px;
  height: 80px;
  right: 36%;
  bottom: -34px;
  background: rgba(14, 165, 233, 0.12);
  animation: organicFloatThree 7s ease-in-out infinite;
}

@keyframes organicFloatOne {
  0% {
    transform: translate3d(0, 0, 0) scale(1);
    border-radius: 60% 40% 55% 45%;
  }

  35% {
    transform: translate3d(-18px, 20px, 0) scale(1.08);
    border-radius: 45% 55% 38% 62%;
  }

  70% {
    transform: translate3d(10px, 34px, 0) scale(0.96);
    border-radius: 58% 42% 48% 52%;
  }

  100% {
    transform: translate3d(0, 0, 0) scale(1);
    border-radius: 60% 40% 55% 45%;
  }
}

@keyframes organicFloatTwo {
  0% {
    transform: translate3d(0, 0, 0) scale(1);
    border-radius: 48% 52% 60% 40%;
  }

  40% {
    transform: translate3d(22px, -16px, 0) scale(1.12);
    border-radius: 62% 38% 44% 56%;
  }

  75% {
    transform: translate3d(8px, -30px, 0) scale(0.98);
    border-radius: 42% 58% 56% 44%;
  }

  100% {
    transform: translate3d(0, 0, 0) scale(1);
    border-radius: 48% 52% 60% 40%;
  }
}

@keyframes organicFloatThree {
  0% {
    transform: translate3d(0, 0, 0) scale(1);
    border-radius: 55% 45% 45% 55%;
  }

  50% {
    transform: translate3d(-12px, -18px, 0) scale(1.18);
    border-radius: 40% 60% 58% 42%;
  }

  100% {
    transform: translate3d(0, 0, 0) scale(1);
    border-radius: 55% 45% 45% 55%;
  }
}
</style>