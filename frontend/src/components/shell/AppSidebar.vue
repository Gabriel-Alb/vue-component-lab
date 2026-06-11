<template>
  <!-- Overlay mobile -->
  <div v-if="isMobile && open" class="fixed inset-0 z-[29] bg-black/60 backdrop-blur-sm"
    style="animation: fadeIn 0.2s ease" @click="$emit('close')" />

  <aside :class="[
    'fixed bottom-0 left-0 top-14 z-30 flex w-60 flex-col border-r border-white/[0.06] bg-[#0d0d0d] transition-transform duration-[280ms] ease-[cubic-bezier(0.4,0,0.2,1)]',
    isMobile && !open ? '-translate-x-full' : 'translate-x-0',
  ]">
    <nav class="sidebar-nav flex-1 overflow-y-auto overflow-x-hidden px-3 py-5">
      <div class="flex flex-col gap-7">
        <NavSection v-for="section in sections" :key="section.title" :title="section.title" :items="section.items"
          :active="active" @select="onSelect" />
      </div>
    </nav>
  </aside>
</template>

<script setup>
import NavSection from './NavSection.vue'

const props = defineProps({
  sections: { type: Array, required: true },
  active: { type: String, required: true },
  open: { type: Boolean, default: true },
  isMobile: { type: Boolean, default: false },
})

const emit = defineEmits(['update:active', 'close'])

function onSelect(label) {
  emit('update:active', label)
  if (props.isMobile) emit('close')
}
</script>

<style scoped>
.sidebar-nav {
  scrollbar-width: none;
}

.sidebar-nav::-webkit-scrollbar {
  display: none;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}
</style>