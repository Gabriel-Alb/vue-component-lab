<template>
  <header
    class="fixed inset-x-0 top-0 z-50 flex h-14 items-center justify-between border-b border-white/[0.06] bg-[#080808]/90 px-5 backdrop-blur-xl"
  >
    <div class="flex items-center gap-2.5">
      <button
        v-if="showToggle"
        class="grid size-[34px] cursor-pointer place-items-center rounded-lg border-none bg-transparent text-xl text-white/45 transition-colors duration-150 hover:bg-white/[0.06] hover:text-white/90"
        :aria-label="sidebarOpen ? 'Fechar menu' : 'Abrir menu'"
        @click="$emit('toggle-sidebar')"
      >
        <i :class="['mdi', sidebarOpen ? 'mdi-close' : 'mdi-menu']" />
      </button>

      <span class="text-sm font-semibold tracking-tight text-white">
        Interface Library
      </span>
    </div>

    <div class="flex items-center gap-1.5">
      <a
        href="#"
        target="_blank"
        rel="noopener"
        aria-label="LinkedIn"
        class="grid size-[34px] place-items-center rounded-lg text-xl text-white/45 transition-colors duration-150 hover:bg-white/[0.06] hover:text-white/90"
      >
        <i class="mdi mdi-linkedin" />
      </a>

      <a
        href="#"
        target="_blank"
        rel="noopener"
        aria-label="GitHub"
        class="grid size-[34px] place-items-center rounded-lg text-xl text-white/45 transition-colors duration-150 hover:bg-white/[0.06] hover:text-white/90"
      >
        <i class="mdi mdi-github" />
      </a>
    </div>
  </header>
</template>

<script setup>
defineProps({
  sidebarOpen: { type: Boolean, default: true },
  showToggle: { type: Boolean, default: false },
})

defineEmits(['toggle-sidebar'])
</script>