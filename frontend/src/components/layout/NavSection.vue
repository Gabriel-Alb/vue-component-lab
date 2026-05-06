<template>
  <div class="flex flex-col gap-0.5">
    <p class="mb-1.5 px-2.5 text-[9.5px] font-bold uppercase tracking-[0.16em] text-white">
      {{ title }}
    </p>

    <button v-for="item in items" :key="item.label" :class="[
      'flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-[13px] font-medium tracking-tight transition-colors duration-150 cursor-pointer border-none',
      active === item.label
        ? 'bg-white/[0.08] text-white'
        : 'bg-transparent text-white/45 hover:bg-white/[0.04] hover:text-white/80',
    ]" @click="$emit('select', item.label)">

      <span class="flex-1 truncate">{{ item.label }}</span>
    </button>
  </div>
</template>

<script setup>
defineProps({
  title: { type: String, required: true },
  items: { type: Array, required: true },
  active: { type: String, default: '' },
})

defineEmits(['select'])
</script>