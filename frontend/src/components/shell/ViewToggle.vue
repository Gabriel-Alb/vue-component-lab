<template>
  <div class="flex items-center gap-0.5 rounded-[10px] border border-white/[0.07] bg-white/[0.04] p-[3px]" role="group"
    aria-label="Modo de visualização">
    <button v-for="opt in options" :key="opt.value" :class="[
      'flex items-center gap-1.5 rounded-[7px] border-none px-3 py-[5px] text-xs font-semibold tracking-[0.01em] whitespace-nowrap cursor-pointer transition-colors duration-150 font-[inherit]',
      modelValue === opt.value
        ? 'bg-white/[0.09] text-white'
        : 'bg-transparent text-white/[0.38] hover:text-white/70',
    ]" @click="$emit('update:modelValue', opt.value)">
      <i :class="['mdi text-sm', opt.icon]" />
      {{ opt.label }}
    </button>
  </div>
</template>

<script setup>
defineProps({
  modelValue: { type: String, required: true },
  options: { type: Array, required: true },
})

defineEmits(['update:modelValue'])
</script>