<template>
  <component
    :is="tag"
    class="inline-flex min-h-[1.2em] items-center"
    :class="[sizeClass, weightClass, textClass]"
  >
    <span>{{ displayedText }}</span>

    <span
      v-if="showCursor"
      class="ml-1 inline-block animate-pulse text-sky-300"
    >
      |
    </span>
  </component>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";

const props = defineProps({
  phrases: {
    type: Array,
    default: () => [""],
  },

  tag: {
    type: String,
    default: "p",
  },

  sizeClass: {
    type: String,
    default: "text-2xl md:text-3xl",
  },

  weightClass: {
    type: String,
    default: "font-bold",
  },

  textClass: {
    type: String,
    default: "text-white",
  },

  showCursor: {
    type: Boolean,
    default: true,
  },

  typeSpeed: {
    type: Number,
    default: 70,
  },

  deleteSpeed: {
    type: Number,
    default: 35,
  },

  pauseDelay: {
    type: Number,
    default: 1400,
  },

  nextPhraseDelay: {
    type: Number,
    default: 250,
  },

  loop: {
    type: Boolean,
    default: true,
  },
});

const displayedText = ref("");
const phraseIndex = ref(0);
const charIndex = ref(0);
const isDeleting = ref(false);

let timer = null;

const normalizedPhrases = computed(() => {
  return props.phrases.map((phrase) => String(phrase));
});

const clearTimer = () => {
  if (timer) {
    clearTimeout(timer);
    timer = null;
  }
};

const scheduleNextStep = (delay) => {
  clearTimer();
  timer = setTimeout(typeStep, delay);
};

const resetAnimation = () => {
  clearTimer();

  displayedText.value = "";
  phraseIndex.value = 0;
  charIndex.value = 0;
  isDeleting.value = false;

  scheduleNextStep(props.nextPhraseDelay);
};

const typeStep = () => {
  const phrases = normalizedPhrases.value;

  if (!phrases.length) {
    displayedText.value = "";
    return;
  }

  const currentPhrase = phrases[phraseIndex.value] || "";
  const isLastPhrase = phraseIndex.value === phrases.length - 1;

  if (!isDeleting.value) {
    charIndex.value += 1;
    displayedText.value = currentPhrase.slice(0, charIndex.value);

    if (charIndex.value < currentPhrase.length) {
      scheduleNextStep(props.typeSpeed);
      return;
    }

    if (!props.loop && isLastPhrase) {
      return;
    }

    isDeleting.value = true;
    scheduleNextStep(props.pauseDelay);
    return;
  }

  charIndex.value -= 1;
  displayedText.value = currentPhrase.slice(0, charIndex.value);

  if (charIndex.value > 0) {
    scheduleNextStep(props.deleteSpeed);
    return;
  }

  isDeleting.value = false;
  phraseIndex.value = (phraseIndex.value + 1) % phrases.length;

  scheduleNextStep(props.nextPhraseDelay);
};

watch(
  () => props.phrases,
  () => {
    resetAnimation();
  },
  { deep: true }
);

onMounted(() => {
  resetAnimation();
});

onBeforeUnmount(() => {
  clearTimer();
});
</script>