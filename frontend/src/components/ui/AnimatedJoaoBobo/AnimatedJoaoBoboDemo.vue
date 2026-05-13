<template>
    <AnimatedJoaoBobo label="Clique em mim" :size="210" @click="handleBuddyClick" />
</template>

<script setup>
import AnimatedJoaoBobo from '../AnimatedJoaoBobo/AnimatedJoaoBobo.vue'

function handleBuddyClick() {
    console.log('João bobo clicado')
}
</script>