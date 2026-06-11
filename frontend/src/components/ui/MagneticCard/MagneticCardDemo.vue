<template>
    <MagneticCard
        class="h-[250px] w-[360px] cursor-pointer"
        content-class="flex flex-col justify-between p-6"
        title="Magnetic Card"
        subtitle="A modern card with smooth magnetic movement and proximity interaction."
        :activation-distance="400"
        :strength="15"
        :content-strength="5"
        @click="openLinkedIn"
    >
    </MagneticCard>
</template>

<script setup>
import MagneticCard from "./MagneticCard.vue";

function openLinkedIn() {
    window.open(
        "https://github.com/Gabriel-Alb"
    );
}
</script>