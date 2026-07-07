<template>
  <article
    class="group relative h-[300px] w-[360px] overflow-visible rounded-[42px] border-[6px] border-[#5B21B6] bg-violet-50 shadow-[0_24px_65px_rgba(109,40,217,0.18)]">
    <!-- IMAGEM SUPERIOR -->
    <div
      class="absolute inset-x-0 top-0 z-10 h-[215px] overflow-hidden rounded-t-[35px] shadow-[0_18px_35px_rgba(30,41,59,0.10)] transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:-translate-y-[87px]">
      <img :src="image" :alt="title" class="h-full w-full object-cover" />
    </div>

    <!-- CARD VIOLETA INFERIOR -->
    <div
      class="absolute -bottom-[7px] -left-[7px] -right-[7px] z-20 h-[180px] rounded-tl-[34px] rounded-tr-[34px] rounded-bl-[35px] rounded-br-[35px] bg-[#7C3AED] px-7 py-7 text-white shadow-[0_-18px_45px_rgba(109,40,217,0.22),0_18px_45px_rgba(76,29,149,0.18)]">
      <!-- CURVA ORGÂNICA ESQUERDA -->
      <div class="absolute -top-[34px] left-0 h-[68px] w-[155px] rounded-tr-[48px] bg-[#7C3AED]" />

      <div class="relative z-10 flex h-full flex-col justify-between">
        <h3
          class="max-w-[150px] text-[25px] font-light leading-[1.05] tracking-[-0.04em] text-white drop-shadow-[0_3px_14px_rgba(49,46,129,0.24)]">
          {{ title }}
        </h3>

        <div class="flex items-end gap-3">
          <strong
            class="text-[42px] font-light leading-none tracking-[-0.06em] text-white drop-shadow-[0_3px_14px_rgba(49,46,129,0.24)]">
            {{ number }}
          </strong>

          <span class="pb-1 text-[20px] font-light text-violet-100/80">
            {{ label }}
          </span>
        </div>
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
defineProps({
  image: {
    type: String,
    required: true,
  },

  title: {
    type: String,
    default: 'View Collection',
  },

  number: {
    type: String,
    default: '05',
  },

  label: {
    type: String,
    default: 'Doc',
  },
})
</script>