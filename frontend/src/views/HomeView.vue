<template>
  <div class="h-screen overflow-hidden bg-[#080808] font-sans text-[#e8e8e8]">
    <AppHeader
      :sidebar-open="sidebarOpen"
      :show-toggle="isMobile"
      @toggle-sidebar="sidebarOpen = !sidebarOpen"
    />

    <AppSidebar
      :sections="sidebarSections"
      :active="selectedSlug"
      :open="sidebarOpen"
      :is-mobile="isMobile"
      @update:active="selectedSlug = $event"
      @close="sidebarOpen = false"
    />

    <main
      :class="[
        'h-screen overflow-hidden pt-14 transition-[padding] duration-[280ms] ease-[cubic-bezier(0.4,0,0.2,1)]',
        isMobile ? 'pl-0' : 'pl-60',
      ]"
    >
      <div class="flex h-full flex-col gap-4 px-6 pb-5 pt-6">
        <!-- Page Header -->
        <div class="flex flex-shrink-0 items-center justify-between">
          <h1 class="text-[22px] font-bold leading-none tracking-[-0.03em] text-white">
            {{ activeLabel }}
          </h1>

          <ViewToggle v-model="activeView" :options="viewOptions" />
        </div>

        <!-- Content Area -->
        <div class="min-h-0 flex-1 overflow-hidden rounded-2xl border border-white/[0.07] bg-[#0d0d0d]">
          <!-- Preview -->
          <div v-if="activeView === 'preview'" class="content-scroll h-full overflow-y-auto px-6 py-6">
            <div class="flex min-h-full items-center justify-center">
              <component :is="activeComponent" v-if="activeComponent" />
            </div>
          </div>

          <!-- Code -->
          <CodeBlock v-else :code="''" lang="vue" />
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

import AppHeader from '../components/layout/AppHeader.vue'
import AppSidebar from '../components/layout/AppSidebar.vue'
import ViewToggle from '../components/layout/ViewToggle.vue'
import CodeBlock from '../components/ui/CodeBlock/CodeBlock.vue/index.js'

import { useBreakpoint } from '../composables/useBreakpoint'
import { useComponentRegistry } from '../composables/useComponentRegistry'
import { registry } from '../registry/index.js'

const { isMobile } = useBreakpoint()
const sidebarOpen = ref(true)
const activeView = ref('preview')

const selectedSlug = ref(registry[0]?.slug ?? '')

const { activeComponent, activeLabel } = useComponentRegistry(selectedSlug)

const sidebarSections = computed(() => {
  const groups = {}
  for (const entry of registry) {
    if (!groups[entry.category]) groups[entry.category] = []
    groups[entry.category].push({ label: entry.label, slug: entry.slug })
  }
  return Object.entries(groups).map(([title, items]) => ({ title, items }))
})

watch(isMobile, (mobile) => {
  sidebarOpen.value = !mobile
})

const viewOptions = [
  { value: 'preview', label: 'Preview', icon: 'mdi-eye-outline' },
  { value: 'code', label: 'Code', icon: 'mdi-code-tags' },
]
</script>

<style scoped>
.content-scroll {
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.1) transparent;
}

.content-scroll::-webkit-scrollbar {
  width: 4px;
}

.content-scroll::-webkit-scrollbar-track {
  background: transparent;
}

.content-scroll::-webkit-scrollbar-thumb {
  border-radius: 99px;
  background: rgba(255, 255, 255, 0.1);
}
</style>