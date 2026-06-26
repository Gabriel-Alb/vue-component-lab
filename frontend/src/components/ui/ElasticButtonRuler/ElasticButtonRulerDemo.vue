<template>
  <div >
    <ElasticButtonRuler
      v-model="active"
      :items="items"
    />
  </div>
</template>

<script setup>
import { ref } from "vue";
import ElasticButtonRuler from "./ElasticButtonRuler.vue"

const active = ref("home");

const items = [
  {
    label: "Início",
    value: "home",
    icon: "mdi mdi-home-outline",
  },
  {
    label: "Carteira",
    value: "wallet",
    icon: "mdi mdi-wallet-outline",
  },
  {
    label: "Perfil",
    value: "profile",
    icon: "mdi mdi-account-circle-outline",
  },
  {
    label: "Ajustes",
    value: "settings",
    icon: "mdi mdi-cog-outline",
  },
];
</script>