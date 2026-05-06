import { computed } from 'vue'
import { registry } from '../registry/index.js'

export function useComponentRegistry(slugRef) {
  const activeEntry = computed(() =>
    registry.find(entry => entry.slug === slugRef.value) ?? null
  )

  const activeComponent = computed(() => activeEntry.value?.component ?? null)
  const activeLabel = computed(() => activeEntry.value?.label ?? '')

  return { activeEntry, activeComponent, activeLabel }
}