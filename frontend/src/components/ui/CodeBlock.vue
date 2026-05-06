<template>
  <div class="flex h-full flex-col overflow-hidden">

    <div class="flex flex-shrink-0 items-center justify-between border-b border-white/[0.06] px-4 py-2.5">
      <span class="text-[11px] font-bold uppercase tracking-[0.1em] text-white/20">
        {{ lang }}
      </span>

      <button
        class="flex cursor-pointer items-center gap-1.5 rounded-md border border-white/[0.08] bg-white/[0.04] px-2.5 py-1 font-[inherit] text-[11px] font-semibold text-white/40 transition-colors duration-150 hover:border-white/[0.14] hover:bg-white/[0.07] hover:text-white/80"
        @click="copy">
        <i :class="['mdi text-[13px]', copied ? 'mdi-check' : 'mdi-content-copy']" />
        {{ copied ? 'Copiado!' : 'Copiar' }}
      </button>
    </div>

    <pre
      class="code-block m-0 flex-1 overflow-y-auto px-6 py-5 font-mono text-[12.5px] leading-[1.8] text-white/65"><code>{{ code }}</code></pre>

  </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  code: { type: String, required: true },
  lang: { type: String, default: 'vue' },
})

const copied = ref(false)

async function copy() {
  await navigator.clipboard.writeText(props.code)
  copied.value = true
  setTimeout(() => (copied.value = false), 2000)
}
</script>

<style scoped>
.code-block {
  font-family: 'Fira Code', 'Cascadia Code', 'JetBrains Mono', monospace;
  white-space: pre;
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.1) transparent;
}

.code-block::-webkit-scrollbar {
  width: 4px;
}

.code-block::-webkit-scrollbar-track {
  background: transparent;
}

.code-block::-webkit-scrollbar-thumb {
  border-radius: 99px;
  background: rgba(255, 255, 255, 0.1);
}
</style>