<template>
    <div class="animated-folder-card relative flex w-full max-w-[340px] flex-col items-center bg-transparent p-0 text-center transition-all duration-300 hover:-translate-y-1"
        :class="{
            'is-hovering': isHovering && !isExpanded && !isOpening && !isReturning && !isClosing,
            'is-expanded': isExpanded,
            'is-opening': isOpening,
            'is-returning': isReturning,
            'is-closing': isClosing,
        }" :style="folderStyle" @mouseenter="isHovering = true" @mouseleave="handleMouseLeave">
        <!-- Background glow -->
        <div class="pointer-events-none absolute inset-0 -z-10 opacity-0 transition-opacity duration-500"
            :class="{ 'opacity-100': isHovering || isExpanded || isReturning || isClosing }">
            <div
                class="absolute left-1/2 top-8 size-56 -translate-x-1/2 rounded-full bg-[var(--folder-main)]/30 blur-3xl" />
        </div>

        <!-- Folder Scene -->
        <div class="folder-scene relative h-[290px] w-[300px]">
            <!-- Click area -->
            <button type="button"
                class="folder-trigger absolute inset-x-0 bottom-8 z-20 h-[190px] cursor-pointer border-0 bg-transparent p-0"
                :aria-label="isExpanded ? 'Pasta expandida' : 'Abrir pasta'" @click="openFolder" />

            <!-- Floating papers/buttons -->
            <div class="floating-papers">
                <button v-for="(paper, index) in visiblePapers" :key="paper.label" type="button" class="floating-paper"
                    :class="`floating-paper-${index + 1}`" @click.stop="selectPaper(paper)">
                    <span>{{ paper.label }}</span>
                </button>
            </div>

            <!-- Papers inside folder on hover -->
            <div class="inside-papers" aria-hidden="true">
                <div class="inside-paper inside-paper-front"></div>
                <div class="inside-paper inside-paper-middle"></div>
                <div class="inside-paper inside-paper-back"></div>
            </div>

            <!-- Folder body -->
            <div class="folder-tab"></div>
            <div class="folder-back"></div>
            <div class="folder-front"></div>
            <div class="folder-shadow"></div>
        </div>
    </div>
</template>

<script setup>
import { computed, onBeforeUnmount, ref } from 'vue'

const props = defineProps({
    title: {
        type: String,
        default: 'Animated Folder',
    },
    description: {
        type: String,
        default: 'Passe o mouse para abrir. Clique para expandir os arquivos.',
    },
    color: {
        type: String,
        default: '#5227ff',
    },
    colorLight: {
        type: String,
        default: '#6438ff',
    },
    colorDark: {
        type: String,
        default: '#421bdc',
    },
    papers: {
        type: Array,
        default: () => [
            { label: 'Vue' },
            { label: 'Tailwind' },
            { label: 'CSS' },
        ],
    },
})

const emit = defineEmits(['select'])

const OPENING_DURATION = 680
const CLOSING_DURATION = 620

const isHovering = ref(false)
const isExpanded = ref(false)
const isOpening = ref(false)
const isReturning = ref(false)
const isClosing = ref(false)

let openingTimer = null
let closingTimer = null
let pendingSelectedPaper = null

const visiblePapers = computed(() => props.papers.slice(0, 3))

const folderStyle = computed(() => ({
    '--folder-main': props.color,
    '--folder-light': props.colorLight,
    '--folder-dark': props.colorDark,
}))

function clearAnimationTimers() {
    window.clearTimeout(openingTimer)
    window.clearTimeout(closingTimer)
}

function openFolder() {
    if (isExpanded.value || isOpening.value || isReturning.value || isClosing.value) return

    clearAnimationTimers()

    pendingSelectedPaper = null
    isReturning.value = false
    isClosing.value = false
    isExpanded.value = true
    isOpening.value = true

    openingTimer = window.setTimeout(() => {
        isOpening.value = false
    }, OPENING_DURATION)
}

function selectPaper(paper) {
    if (isReturning.value || isClosing.value) return

    clearAnimationTimers()

    pendingSelectedPaper = paper

    isHovering.value = false
    isOpening.value = false

    /*
        Aqui está o ajuste principal:
        - a pasta começa a fechar imediatamente
        - os papers recolhem ao mesmo tempo
    */
    isExpanded.value = false
    isReturning.value = true
    isClosing.value = true

    closingTimer = window.setTimeout(() => {
        isReturning.value = false
        isClosing.value = false

        if (pendingSelectedPaper) {
            emit('select', pendingSelectedPaper)
            pendingSelectedPaper = null
        }
    }, CLOSING_DURATION)
}

function handleMouseLeave() {
    isHovering.value = false
}

onBeforeUnmount(() => {
    clearAnimationTimers()
})
</script>

<style scoped>
.animated-folder-card {
    --paper-front: #e0e0e0;
    --paper-middle: #eeeeee;
    --paper-back: #ffffff;

    --folder-neutral: #4253c0;
}
.folder-scene {
    perspective: 1100px;
    transform-style: preserve-3d;
    isolation: isolate;
}

/* Shadow */
.folder-shadow {
    position: absolute;
    left: 50%;
    bottom: 24px;
    z-index: 1;
    width: 185px;
    height: 28px;
    transform: translateX(-50%);
    border-radius: 99px;
    background: rgba(0, 0, 0, 0.5);
    filter: blur(15px);
    opacity: 0.85;
    transition:
        width 0.45s ease,
        opacity 0.45s ease,
        transform 0.45s ease;
}

.animated-folder-card.is-hovering .folder-shadow {
    width: 225px;
    opacity: 0.95;
}

.animated-folder-card.is-expanded .folder-shadow {
    width: 245px;
    opacity: 1;
    transform: translateX(-50%) translateY(6px);
}

/* Folder back */
.folder-back {
    position: absolute;
    left: 34px;
    bottom: 82px;
    z-index: 5;
    width: 232px;
    height: 158px;
    border-radius: 18px 18px 26px 26px;
    background: var(--folder-neutral);
    box-shadow:
        inset 0 -18px 28px rgba(0, 0, 0, 0.14),
        0 22px 44px rgba(0, 0, 0, 0.22);
    transform: translateY(0);
    transition:
        transform 0.48s cubic-bezier(0.2, 0.85, 0.2, 1),
        box-shadow 0.48s ease;
}

.animated-folder-card.is-hovering .folder-back {
    transform: translateY(-8px);
}

.animated-folder-card.is-expanded .folder-back {
    transform: translateY(-10px);
}

/* Folder tab */
.folder-tab {
    position: absolute;
    left: 34px;
    bottom: 222px;
    z-index: 4;
    width: 82px;
    height: 46px;
    border-radius: 11px 11px 0 0;
    background: var(--folder-neutral);
    box-shadow: none;
}

.folder-tab::after {
    content: '';
    position: absolute;
    left: 70px;
    bottom: 0;
    width: 162px;
    height: 30px;
    border-radius: 0 18px 0 0;
    background: var(--folder-neutral);
}

/* Papers inside folder */
.inside-papers {
    position: absolute;
    left: 50%;
    bottom: 155px;
    z-index: 8;
    width: 210px;
    height: 102px;
    transform: translateX(-50%);
    pointer-events: none;
}

.inside-paper {
    position: absolute;
    left: 50%;
    bottom: 0;
    border-radius: 20px 20px 8px 8px;
    box-shadow:
        inset 0 1px 0 rgba(255, 255, 255, 0.9),
        0 10px 20px rgba(0, 0, 0, 0.12);
    opacity: 0;
    transform: translateX(-50%) translateY(58px) scaleY(0.86);
    transform-origin: bottom center;
    transition:
        opacity 0.28s ease,
        transform 0.48s cubic-bezier(0.2, 0.85, 0.2, 1);
}

.inside-paper-front {
    z-index: 1;
    width: 164px;
    height: 92px;
    background: var(--paper-front);
    transition-delay: 0.02s;
}

.inside-paper-middle {
    z-index: 2;
    width: 180px;
    height: 82px;
    background: var(--paper-middle);
    transition-delay: 0.05s;
}

.inside-paper-back {
    z-index: 3;
    width: 196px;
    height: 72px;
    background: var(--paper-back);
    transition-delay: 0.08s;
}

.animated-folder-card.is-hovering .inside-paper {
    opacity: 1;
}

.animated-folder-card.is-hovering .inside-paper-front {
    transform: translateX(-50%) translateY(0) scaleY(1);
}

.animated-folder-card.is-hovering .inside-paper-middle {
    transform: translateX(-50%) translateY(12px) scaleY(1);
}

.animated-folder-card.is-hovering .inside-paper-back {
    transform: translateX(-50%) translateY(24px) scaleY(1);
}

.animated-folder-card.is-expanded .inside-paper,
.animated-folder-card.is-returning .inside-paper,
.animated-folder-card.is-closing .inside-paper {
    opacity: 0;
    transform: translateX(-50%) translateY(30px) scale(0.92);
    transition-delay: 0s;
}

/* Folder front */
.folder-front {
    position: absolute;
    left: 34px;
    bottom: 82px;
    z-index: 15;
    pointer-events: none;

    width: 232px;
    height: 158px;

    border-radius: 18px 18px 26px 26px;

    background:
        linear-gradient(180deg, rgba(255, 255, 255, 0.08), transparent 36%),
        linear-gradient(145deg,
            var(--folder-light) 0%,
            var(--folder-main) 45%,
            var(--folder-dark) 100%);

    box-shadow:
        inset 0 1px 0 rgba(255, 255, 255, 0.18),
        inset 0 -20px 30px rgba(0, 0, 0, 0.18),
        0 18px 34px rgba(0, 0, 0, 0.28);

    transform-origin: bottom center;
    transform: translateY(0) scaleX(1) scaleY(1) skewX(0deg);

    clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%);

    transition:
        left 0.52s cubic-bezier(0.2, 0.85, 0.2, 1),
        width 0.52s cubic-bezier(0.2, 0.85, 0.2, 1),
        bottom 0.52s cubic-bezier(0.2, 0.85, 0.2, 1),
        transform 0.52s cubic-bezier(0.2, 0.85, 0.2, 1),
        clip-path 0.52s cubic-bezier(0.2, 0.85, 0.2, 1),
        border-radius 0.52s ease,
        filter 0.52s ease;
}

/* Hover: frente abre, achata e fica mais larga no topo */
.animated-folder-card.is-hovering .folder-front {
    left: 10px;
    bottom: 120px;
    width: 280px;

    transform: translateY(36px) scaleY(0.58) skewX(0deg);

    clip-path: polygon(0 0,
            100% 0,
            91.5% 100%,
            8.5% 100%);

    border-radius: 22px 22px 34px 34px;
    filter: saturate(1.08);
}

/* Expandido */
.animated-folder-card.is-expanded .folder-front {
    left: 10px;
    bottom: 60px;
    width: 280px;

    transform: translateY(2px) scaleY(0.54) skewX(0deg);

    clip-path: polygon(0 0,
            100% 0,
            88% 100%,
            12% 100%);

    border-radius: 22px 22px 36px 36px;
    filter: saturate(1.12);
}

/* Floating papers */
.floating-papers {
    position: absolute;
    inset: 0;
    z-index: 14;
    pointer-events: none;
}

.floating-paper {
    --paper-open-x: 0px;
    --paper-open-y: -110px;
    --paper-open-rotate: 0deg;
    --paper-open-scale: 1;

    --paper-start-x: 0px;
    --paper-start-y: 8px;
    --paper-start-rotate: 0deg;
    --paper-start-scale: 0.52;

    --paper-delay: 0ms;
    --paper-return-delay: 0ms;

    position: absolute;
    left: 50%;
    top: 122px;
    display: grid;
    place-items: center;
    width: 142px;
    height: 126px;
    border: 0;
    border-radius: 20px;
    background: var(--paper-front);
    color: rgba(20, 20, 20, 0.62);
    font-size: 13px;
    font-weight: 800;
    letter-spacing: -0.03em;
    box-shadow:
        inset 0 1px 0 rgba(255, 255, 255, 0.95),
        0 22px 38px rgba(0, 0, 0, 0.24);
    cursor: pointer;
    opacity: 0;

    transform:
        translateX(-50%) translate3d(var(--paper-start-x), var(--paper-start-y), 0) rotate(var(--paper-start-rotate)) scale(var(--paper-start-scale));

    transform-origin: center;
    backface-visibility: hidden;
    will-change: transform, opacity;

    transition:
        opacity 220ms ease,
        transform 520ms cubic-bezier(0.2, 0.85, 0.2, 1),
        background 0.2s ease,
        box-shadow 0.2s ease;
}

.floating-paper:hover {
    background: #ffffff;
    box-shadow:
        inset 0 1px 0 rgba(255, 255, 255, 1),
        0 30px 54px rgba(0, 0, 0, 0.34);
}

.floating-paper span {
    opacity: 0;
    transform: translate3d(0, 8px, 0);
    transition:
        opacity 220ms ease,
        transform 260ms cubic-bezier(0.2, 0.85, 0.2, 1);
}

.floating-paper-1 {
    --paper-open-x: -104px;
    --paper-open-y: -88px;
    --paper-open-rotate: -13deg;
    --paper-open-scale: 1;

    --paper-start-x: -18px;
    --paper-start-y: 9px;
    --paper-start-rotate: -6deg;
    --paper-start-scale: 0.52;

    --paper-delay: 0ms;
    --paper-return-delay: 0ms;
}

.floating-paper-2 {
    --paper-open-x: 0px;
    --paper-open-y: -126px;
    --paper-open-rotate: 4deg;
    --paper-open-scale: 1.04;

    --paper-start-x: 0px;
    --paper-start-y: 6px;
    --paper-start-rotate: 2deg;
    --paper-start-scale: 0.52;

    --paper-delay: 34ms;
    --paper-return-delay: 0ms;
}

.floating-paper-3 {
    --paper-open-x: 104px;
    --paper-open-y: -88px;
    --paper-open-rotate: 13deg;
    --paper-open-scale: 1;

    --paper-start-x: 18px;
    --paper-start-y: 9px;
    --paper-start-rotate: 6deg;
    --paper-start-scale: 0.52;

    --paper-delay: 68ms;
    --paper-return-delay: 0ms;
}

.animated-folder-card.is-expanded .folder-trigger,
.animated-folder-card.is-opening .folder-trigger,
.animated-folder-card.is-returning .folder-trigger,
.animated-folder-card.is-closing .folder-trigger {
    pointer-events: none;
}

.animated-folder-card.is-expanded .floating-papers {
    pointer-events: auto;
}

.animated-folder-card.is-opening .floating-papers,
.animated-folder-card.is-returning .floating-papers,
.animated-folder-card.is-closing .floating-papers {
    pointer-events: none;
}

.animated-folder-card.is-expanded .floating-paper {
    opacity: 1;

    transform:
        translateX(-50%) translate3d(var(--paper-open-x), var(--paper-open-y), 0) rotate(var(--paper-open-rotate)) scale(var(--paper-open-scale));
}

.animated-folder-card.is-opening .floating-paper {
    animation: floatingPaperOpen 680ms cubic-bezier(0.22, 1, 0.36, 1) both;
    animation-delay: var(--paper-delay);

    transition:
        background 0.2s ease,
        box-shadow 0.2s ease;
}

.animated-folder-card.is-expanded .floating-paper span {
    opacity: 1;
    transform: translate3d(0, 0, 0);
    transition-delay: 160ms;
}

.animated-folder-card.is-opening .floating-paper span {
    animation: floatingPaperLabelOpen 360ms ease both;
    animation-delay: calc(var(--paper-delay) + 170ms);
    transition: none;
}

.animated-folder-card.is-returning .floating-paper {
    animation: floatingPaperReturn 560ms cubic-bezier(0.45, 0, 0.25, 1) both;
    animation-delay: var(--paper-return-delay);

    transition:
        background 0.2s ease,
        box-shadow 0.2s ease;
}

.animated-folder-card.is-returning .floating-paper span {
    animation: floatingPaperLabelReturn 180ms ease both;
    transition: none;
}

.animated-folder-card.is-expanded .floating-paper-1,
.animated-folder-card.is-returning .floating-paper-1 {
    background: #eeeeee;
}

.animated-folder-card.is-expanded .floating-paper-2,
.animated-folder-card.is-returning .floating-paper-2 {
    background: #ffffff;
}

.animated-folder-card.is-expanded .floating-paper-3,
.animated-folder-card.is-returning .floating-paper-3 {
    background: #eeeeee;
}

.animated-folder-card.is-expanded:not(.is-opening):not(.is-returning) .floating-paper-1:hover {
    transform:
        translateX(-50%) translate3d(-104px, -88px, 0) rotate(-13deg) scale(1.08);
}

.animated-folder-card.is-expanded:not(.is-opening):not(.is-returning) .floating-paper-2:hover {
    transform:
        translateX(-50%) translate3d(0, -126px, 0) rotate(4deg) scale(1.12);
}

.animated-folder-card.is-expanded:not(.is-opening):not(.is-returning) .floating-paper-3:hover {
    transform:
        translateX(-50%) translate3d(104px, -88px, 0) rotate(13deg) scale(1.08);
}

.animated-folder-card.is-closing:not(.is-returning) .floating-paper {
    opacity: 0;
    transform:
        translateX(-50%) translate3d(var(--paper-start-x), var(--paper-start-y), 0) rotate(var(--paper-start-rotate)) scale(var(--paper-start-scale));
    transition-delay: 0s;
}

.animated-folder-card.is-closing:not(.is-returning) .floating-paper span {
    opacity: 0;
    transform: translate3d(0, 8px, 0);
    transition-delay: 0s;
}

@keyframes floatingPaperOpen {
    0% {
        opacity: 0;
        transform:
            translateX(-50%) translate3d(var(--paper-start-x), var(--paper-start-y), 0) rotate(var(--paper-start-rotate)) scale(var(--paper-start-scale));
    }

    14% {
        opacity: 0;
        transform:
            translateX(-50%) translate3d(var(--paper-start-x), var(--paper-start-y), 0) rotate(var(--paper-start-rotate)) scale(var(--paper-start-scale));
    }

    28% {
        opacity: 1;
    }

    100% {
        opacity: 1;
        transform:
            translateX(-50%) translate3d(var(--paper-open-x), var(--paper-open-y), 0) rotate(var(--paper-open-rotate)) scale(var(--paper-open-scale));
    }
}

@keyframes floatingPaperReturn {
    0% {
        opacity: 1;
        transform:
            translateX(-50%) translate3d(var(--paper-open-x), var(--paper-open-y), 0) rotate(var(--paper-open-rotate)) scale(var(--paper-open-scale));
    }

    18% {
        opacity: 1;
        transform:
            translateX(-50%) translate3d(calc(var(--paper-open-x) * 0.35),
                calc(var(--paper-open-y) * 0.7),
                0) rotate(calc(var(--paper-open-rotate) * 0.55)) scale(0.82);
    }

    42% {
        opacity: 1;
        transform:
            translateX(-50%) translate3d(var(--paper-start-x), -22px, 0) rotate(var(--paper-start-rotate)) scale(0.62);
    }

    50% {
        opacity: 0;
        transform:
            translateX(-50%) translate3d(var(--paper-start-x), -4px, 0) rotate(var(--paper-start-rotate)) scale(0.54);
    }

    100% {
        opacity: 0;
        transform:
            translateX(-50%) translate3d(var(--paper-start-x), var(--paper-start-y), 0) rotate(var(--paper-start-rotate)) scale(var(--paper-start-scale));
    }
}

@keyframes floatingPaperLabelOpen {
    0% {
        opacity: 0;
        transform: translate3d(0, 10px, 0);
    }

    100% {
        opacity: 1;
        transform: translate3d(0, 0, 0);
    }
}

@keyframes floatingPaperLabelReturn {
    0% {
        opacity: 1;
        transform: translate3d(0, 0, 0);
    }

    100% {
        opacity: 0;
        transform: translate3d(0, 8px, 0);
    }
}

.folder-trigger:focus-visible,
.floating-paper:focus-visible {
    outline: 2px solid rgba(255, 255, 255, 0.75);
    outline-offset: 4px;
}

@media (max-width: 420px) {
    .animated-folder-card {
        max-width: 300px;
    }

    .folder-scene {
        width: 270px;
        transform: scale(0.9);
    }
}
</style>