<template>
    <section class="flex items-center justify-center ">
        <TypewriterText :phrases="[
            'Reusable components.',
            'Modern interfaces.',
            'Clean code with Vue and Tailwind.',
        ]" />
    </section>

</template>

<script setup>
import TypewriterText from './TypewriterText.vue';
</script>