<template>
  <OrganicCard
    label="Tempo real"
    title="Diagnóstico ativo"
    description="Acompanhe dados operacionais com uma interface moderna, reutilizável e com profundidade visual."
    badge="Online"
    meta="Atualizado agora"
    action-text="Ver detalhes"
    variant="dark"
    clickable
    @click="abrirCard"
    @action="abrirDetalhes"
  />

</template>

<script setup>
import OrganicCard from "./OrganicCard.vue";
</script>