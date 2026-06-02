<template>
  <GradientCarousel
    class="block"
    style="width: 100%; min-height: 100vh; overflow: visible;"
    :cards="carouselCards"
    height="100vh"
    card-width="340px"
    card-height="420px"
    :card-spacing="380"
    card-radius="2rem"
    card-padding="1.5rem"
    title-class="text-3xl font-semibold leading-tight"
    description-class="mt-4 text-sm leading-6"
    title-color="#FFFFFF"
    description-color="rgba(255, 255, 255, 0.85)"
    :fallback-gradient="['#5227FF', '#8B5CF6', '#FF9FFC']"
    :glow-enabled="true"
    glow-width="900px"
    glow-height="560px"
    glow-blur="100px"
    glow-top="40%"
  />
</template>

<script setup>
import GradientCarousel from './GradientCarousel.vue'

const carouselCards = [
  {
    id: 1,
    title: 'Dashboard inteligente',
    description: 'Visualize dados, métricas e insights em um painel moderno e interativo.',
    gradient: ['#5227FF', '#8B5CF6', '#FF9FFC'],
    titleColor: '#FFFFFF',
    descriptionColor: 'rgba(255, 255, 255, 0.85)',
  },
  {
    id: 2,
    title: 'Cartão premium',
    description: 'Um card visual para representar conta, saldo, limite ou benefícios.',
    gradient: ['#0EA5E9', '#2563EB', '#1E1B4B'],
    titleColor: '#FFFFFF',
    descriptionColor: 'rgba(255, 255, 255, 0.85)',
  },
  {
    id: 3,
    title: 'Área segura',
    description: 'Ideal para destacar autenticação, proteção de dados e alertas importantes.',
    gradient: ['#F59E0B', '#EF4444', '#7F1D1D'],
    titleColor: '#FFFFFF',
    descriptionColor: 'rgba(255, 255, 255, 0.85)',
  },
  {
    id: 4,
    title: 'Relatórios visuais',
    description: 'Cards para gráficos, performance, indicadores e comparações.',
    gradient: ['#10B981', '#14B8A6', '#064E3B'],
    titleColor: '#FFFFFF',
    descriptionColor: 'rgba(255, 255, 255, 0.85)',
  },
  {
    id: 5,
    title: 'Experiência imersiva',
    description: 'Uma seção forte para portfólio, landing page ou vitrine de componentes.',
    gradient: ['#DB2777', '#9333EA', '#312E81'],
    titleColor: '#FFFFFF',
    descriptionColor: 'rgba(255, 255, 255, 0.85)',
  },
]
</script>