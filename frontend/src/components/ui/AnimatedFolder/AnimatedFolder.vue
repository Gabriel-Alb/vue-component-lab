<template>
    <div
        class="animated-folder-card relative flex w-full max-w-[340px] flex-col items-center bg-transparent p-0 text-center transition-all duration-300 hover:-translate-y-1"
        :class="folderClasses"
        :style="folderStyle"
        tabindex="0"
        @mouseenter="handleMouseEnter"
        @mouseleave="handleMouseLeave"
        @click="handleCardClick"
        @keydown.escape="closeFolder()"
    >
        <!-- Background glow -->
        <div
            aria-hidden="true"
            class="pointer-events-none absolute inset-0 -z-10 opacity-0 transition-opacity duration-500"
            :class="{ 'opacity-100': showBackgroundGlow }"
        >
            <div
                class="absolute left-1/2 top-8 size-56 -translate-x-1/2 rounded-full bg-[var(--folder-main)]/30 blur-3xl"
            />
        </div>

        <!-- Folder scene -->
        <div class="folder-scene relative h-[290px] w-[300px]">
            <!-- Main click area -->
            <button
                type="button"
                class="folder-trigger absolute inset-x-0 bottom-8 z-20 h-[190px] cursor-pointer border-0 bg-transparent p-0"
                :aria-label="triggerAriaLabel"
                :aria-expanded="isOpenOrOpening"
                :disabled="isTriggerDisabled"
                @click.stop="handleTriggerClick"
            />

            <!-- Floating papers/buttons -->
            <div class="floating-papers">
                <button
                    v-for="(paper, index) in visiblePapers"
                    :key="getPaperKey(paper, index)"
                    type="button"
                    class="floating-paper"
                    :class="`floating-paper-${index + 1}`"
                    :aria-label="getPaperAriaLabel(paper, index)"
                    :disabled="arePapersDisabled"
                    @click.stop="selectPaper(paper)"
                >
                    <span>{{ getPaperLabel(paper, index) }}</span>
                </button>
            </div>

            <!-- Papers inside folder on hover -->
            <div class="inside-papers" aria-hidden="true">
                <div class="inside-paper inside-paper-front" />
                <div class="inside-paper inside-paper-middle" />
                <div class="inside-paper inside-paper-back" />
            </div>

            <!-- Folder body -->
            <div class="folder-tab" aria-hidden="true" />
            <div class="folder-back" aria-hidden="true" />
            <div class="folder-front" aria-hidden="true" />
            <div class="folder-shadow" aria-hidden="true" />
        </div>
    </div>
</template>

<script setup>
import { computed, onBeforeUnmount, ref } from 'vue'

const props = defineProps({
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
    neutralColor: {
        type: String,
        default: '#4253c0',
    },
    paperFrontColor: {
        type: String,
        default: '#e0e0e0',
    },
    paperMiddleColor: {
        type: String,
        default: '#eeeeee',
    },
    paperBackColor: {
        type: String,
        default: '#ffffff',
    },
    paperHoverColor: {
        type: String,
        default: '#ffffff',
    },
    paperTextColor: {
        type: String,
        default: 'rgba(20, 20, 20, 0.62)',
    },
    papers: {
        type: Array,
        default: () => [
            { id: 'vue', label: 'Vue', value: 'vue' },
            { id: 'tailwind', label: 'Tailwind', value: 'tailwind' },
            { id: 'css', label: 'CSS', value: 'css' },
        ],
    },
})

const emit = defineEmits(['open', 'close', 'select'])

const FOLDER_STATE = {
    IDLE: 'idle',
    HOVERING: 'hovering',
    OPENING: 'opening',
    EXPANDED: 'expanded',
    RETURNING: 'returning',
}

const ANIMATION_DURATION = {
    opening: 680,
    closing: 620,
    paperReturn: 560,
    labelOpen: 360,
    labelReturn: 180,
}

const folderState = ref(FOLDER_STATE.IDLE)

let openingTimer = null
let closingTimer = null
let pendingSelectedPaper = null

// The visual composition supports up to 3 floating papers.
const visiblePapers = computed(() => props.papers.slice(0, 3))

const isIdle = computed(() => folderState.value === FOLDER_STATE.IDLE)
const isHovering = computed(() => folderState.value === FOLDER_STATE.HOVERING)
const isOpening = computed(() => folderState.value === FOLDER_STATE.OPENING)
const isFullyExpanded = computed(() => folderState.value === FOLDER_STATE.EXPANDED)
const isReturning = computed(() => folderState.value === FOLDER_STATE.RETURNING)

const isAnimating = computed(() => isOpening.value || isReturning.value)

const isOpenOrOpening = computed(() => (
    folderState.value === FOLDER_STATE.OPENING ||
    folderState.value === FOLDER_STATE.EXPANDED
))

const showBackgroundGlow = computed(() => (
    isHovering.value ||
    isOpenOrOpening.value ||
    isReturning.value
))

const isTriggerDisabled = computed(() => isAnimating.value)

const arePapersDisabled = computed(() => (
    !isFullyExpanded.value ||
    isAnimating.value
))

const triggerAriaLabel = computed(() => (
    isFullyExpanded.value ? 'Fechar pasta' : 'Abrir pasta'
))

const folderClasses = computed(() => ({
    'is-hovering': isHovering.value,
    'is-expanded': isOpenOrOpening.value,
    'is-opening': isOpening.value,
    'is-returning': isReturning.value,
}))

const folderStyle = computed(() => ({
    '--folder-main': props.color,
    '--folder-light': props.colorLight,
    '--folder-dark': props.colorDark,
    '--folder-neutral': props.neutralColor,
    '--folder-focus': 'rgba(82, 39, 255, 0.85)',

    '--paper-front': props.paperFrontColor,
    '--paper-middle': props.paperMiddleColor,
    '--paper-back': props.paperBackColor,
    '--paper-hover': props.paperHoverColor,
    '--paper-text': props.paperTextColor,

    '--folder-open-duration': `${ANIMATION_DURATION.opening}ms`,
    '--folder-close-duration': `${ANIMATION_DURATION.closing}ms`,
    '--paper-open-duration': `${ANIMATION_DURATION.opening}ms`,
    '--paper-return-duration': `${ANIMATION_DURATION.paperReturn}ms`,
    '--paper-label-open-duration': `${ANIMATION_DURATION.labelOpen}ms`,
    '--paper-label-return-duration': `${ANIMATION_DURATION.labelReturn}ms`,
}))

function getPaperLabel(paper, index) {
    if (typeof paper === 'string') {
        return paper || `Paper ${index + 1}`
    }

    return paper?.label || paper?.title || paper?.value || `Paper ${index + 1}`
}

function getPaperKey(paper, index) {
    const fallbackLabel = getPaperLabel(paper, index)

    const rawKey = typeof paper === 'object' && paper !== null
        ? paper.id || paper.value || paper.to || paper.href || paper.label
        : paper

    return `paper-${index}-${String(rawKey || fallbackLabel)}`
}

function getPaperAriaLabel(paper, index) {
    return `Selecionar ${getPaperLabel(paper, index)}`
}

function clearAnimationTimers() {
    if (openingTimer) {
        clearTimeout(openingTimer)
    }

    if (closingTimer) {
        clearTimeout(closingTimer)
    }

    openingTimer = null
    closingTimer = null
}

function handleMouseEnter() {
    if (!isIdle.value || isAnimating.value) return

    folderState.value = FOLDER_STATE.HOVERING
}

function handleMouseLeave() {
    if (!isHovering.value || isAnimating.value) return

    folderState.value = FOLDER_STATE.IDLE
}

function handleTriggerClick() {
    if (isAnimating.value) return

    if (isFullyExpanded.value) {
        closeFolder()
        return
    }

    openFolder()
}

function openFolder() {
    if (isAnimating.value || (!isIdle.value && !isHovering.value)) return

    clearAnimationTimers()

    pendingSelectedPaper = null
    folderState.value = FOLDER_STATE.OPENING

    emit('open')

    openingTimer = setTimeout(() => {
        folderState.value = FOLDER_STATE.EXPANDED
        openingTimer = null
    }, ANIMATION_DURATION.opening)
}

function closeFolder(selectedPaper = null) {
    if (!isFullyExpanded.value || isAnimating.value) return

    clearAnimationTimers()

    pendingSelectedPaper = selectedPaper
    folderState.value = FOLDER_STATE.RETURNING

    closingTimer = setTimeout(() => {
        folderState.value = FOLDER_STATE.IDLE

        emit('close')

        if (pendingSelectedPaper) {
            emit('select', pendingSelectedPaper)
        }

        pendingSelectedPaper = null
        closingTimer = null
    }, ANIMATION_DURATION.closing)
}

function selectPaper(paper) {
    if (!isFullyExpanded.value || isAnimating.value || !paper) return

    closeFolder(paper)
}

function handleCardClick(event) {
    if (!isFullyExpanded.value || isAnimating.value) return

    const clickedPaper = event.target.closest?.('.floating-paper')

    if (clickedPaper) return

    closeFolder()
}

onBeforeUnmount(() => {
    clearAnimationTimers()
})
</script>

<style scoped>
/* Base */
.animated-folder-card {
    --paper-front: #e0e0e0;
    --paper-middle: #eeeeee;
    --paper-back: #ffffff;
    --paper-hover: #ffffff;
    --paper-text: rgba(20, 20, 20, 0.62);

    --folder-main: #5227ff;
    --folder-light: #6438ff;
    --folder-dark: #421bdc;
    --folder-neutral: #4253c0;
    --folder-focus: rgba(82, 39, 255, 0.85);

    --folder-open-duration: 680ms;
    --folder-close-duration: 620ms;
    --folder-motion-duration: var(--folder-open-duration);

    --paper-open-duration: 680ms;
    --paper-return-duration: 560ms;
    --paper-label-open-duration: 360ms;
    --paper-label-return-duration: 180ms;
}

.animated-folder-card.is-returning {
    --folder-motion-duration: var(--folder-close-duration);
}

/* Scene */
.folder-scene {
    perspective: 1100px;
    transform-style: preserve-3d;
    isolation: isolate;
}

/* Folder */
.folder-trigger:disabled {
    cursor: default;
}

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
        width var(--folder-motion-duration) ease,
        opacity var(--folder-motion-duration) ease,
        transform var(--folder-motion-duration) ease;
}

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
        transform var(--folder-motion-duration) cubic-bezier(0.2, 0.85, 0.2, 1),
        box-shadow var(--folder-motion-duration) ease;
}

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
        linear-gradient(
            145deg,
            var(--folder-light) 0%,
            var(--folder-main) 45%,
            var(--folder-dark) 100%
        );
    box-shadow:
        inset 0 1px 0 rgba(255, 255, 255, 0.18),
        inset 0 -20px 30px rgba(0, 0, 0, 0.18),
        0 18px 34px rgba(0, 0, 0, 0.28);
    transform-origin: bottom center;
    transform: translateY(0) scaleX(1) scaleY(1) skewX(0deg);
    clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%);
    transition:
        left var(--folder-motion-duration) cubic-bezier(0.2, 0.85, 0.2, 1),
        width var(--folder-motion-duration) cubic-bezier(0.2, 0.85, 0.2, 1),
        bottom var(--folder-motion-duration) cubic-bezier(0.2, 0.85, 0.2, 1),
        transform var(--folder-motion-duration) cubic-bezier(0.2, 0.85, 0.2, 1),
        clip-path var(--folder-motion-duration) cubic-bezier(0.2, 0.85, 0.2, 1),
        border-radius var(--folder-motion-duration) ease,
        filter var(--folder-motion-duration) ease;
}

/* Inside papers */
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
        opacity 280ms ease,
        transform var(--folder-motion-duration) cubic-bezier(0.2, 0.85, 0.2, 1);
}

.inside-paper-front {
    z-index: 1;
    width: 164px;
    height: 92px;
    background: var(--paper-front);
    transition-delay: 20ms;
}

.inside-paper-middle {
    z-index: 2;
    width: 180px;
    height: 82px;
    background: var(--paper-middle);
    transition-delay: 50ms;
}

.inside-paper-back {
    z-index: 3;
    width: 196px;
    height: 72px;
    background: var(--paper-back);
    transition-delay: 80ms;
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
    color: var(--paper-text);
    font-size: 13px;
    font-weight: 800;
    letter-spacing: -0.03em;
    box-shadow:
        inset 0 1px 0 rgba(255, 255, 255, 0.95),
        0 22px 38px rgba(0, 0, 0, 0.24);
    cursor: pointer;
    opacity: 0;
    transform:
        translateX(-50%)
        translate3d(var(--paper-start-x), var(--paper-start-y), 0)
        rotate(var(--paper-start-rotate))
        scale(var(--paper-start-scale));
    transform-origin: center;
    backface-visibility: hidden;
    will-change: transform, opacity;
    transition:
        opacity 220ms ease,
        transform 520ms cubic-bezier(0.2, 0.85, 0.2, 1),
        background 200ms ease,
        box-shadow 200ms ease;
}

.floating-paper:disabled {
    cursor: default;
}

.floating-paper:hover:not(:disabled) {
    background: var(--paper-hover);
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

/* States */
.animated-folder-card.is-hovering .folder-shadow {
    width: 225px;
    opacity: 0.95;
}

.animated-folder-card.is-expanded .folder-shadow {
    width: 245px;
    opacity: 1;
    transform: translateX(-50%) translateY(6px);
}

.animated-folder-card.is-hovering .folder-back {
    transform: translateY(-8px);
}

.animated-folder-card.is-expanded .folder-back {
    transform: translateY(-10px);
}

.animated-folder-card.is-hovering .folder-front {
    left: 10px;
    bottom: 120px;
    width: 280px;
    transform: translateY(36px) scaleY(0.58) skewX(0deg);
    clip-path: polygon(
        0 0,
        100% 0,
        91.5% 100%,
        8.5% 100%
    );
    border-radius: 22px 22px 34px 34px;
    filter: saturate(1.08);
}

.animated-folder-card.is-expanded .folder-front {
    left: 10px;
    bottom: 60px;
    width: 280px;
    transform: translateY(2px) scaleY(0.54) skewX(0deg);
    clip-path: polygon(
        0 0,
        100% 0,
        88% 100%,
        12% 100%
    );
    border-radius: 22px 22px 36px 36px;
    filter: saturate(1.12);
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
.animated-folder-card.is-returning .inside-paper {
    opacity: 0;
    transform: translateX(-50%) translateY(30px) scale(0.92);
    transition-delay: 0s;
}

.animated-folder-card.is-expanded .folder-trigger,
.animated-folder-card.is-opening .folder-trigger,
.animated-folder-card.is-returning .folder-trigger {
    pointer-events: none;
}

.animated-folder-card.is-expanded .floating-papers {
    pointer-events: auto;
}

.animated-folder-card.is-opening .floating-papers,
.animated-folder-card.is-returning .floating-papers {
    pointer-events: none;
}

.animated-folder-card.is-expanded .floating-paper {
    opacity: 1;
    transform:
        translateX(-50%)
        translate3d(var(--paper-open-x), var(--paper-open-y), 0)
        rotate(var(--paper-open-rotate))
        scale(var(--paper-open-scale));
}

.animated-folder-card.is-opening .floating-paper {
    animation: floatingPaperOpen var(--paper-open-duration) cubic-bezier(0.22, 1, 0.36, 1) both;
    animation-delay: var(--paper-delay);
    transition:
        background 200ms ease,
        box-shadow 200ms ease;
}

.animated-folder-card.is-returning .floating-paper {
    animation: floatingPaperReturn var(--paper-return-duration) cubic-bezier(0.45, 0, 0.25, 1) both;
    animation-delay: var(--paper-return-delay);
    transition:
        background 200ms ease,
        box-shadow 200ms ease;
}

.animated-folder-card.is-expanded .floating-paper span {
    opacity: 1;
    transform: translate3d(0, 0, 0);
    transition-delay: 160ms;
}

.animated-folder-card.is-opening .floating-paper span {
    animation: floatingPaperLabelOpen var(--paper-label-open-duration) ease both;
    animation-delay: calc(var(--paper-delay) + 170ms);
    transition: none;
}

.animated-folder-card.is-returning .floating-paper span {
    animation: floatingPaperLabelReturn var(--paper-label-return-duration) ease both;
    transition: none;
}

.animated-folder-card.is-expanded .floating-paper-1,
.animated-folder-card.is-returning .floating-paper-1 {
    background: var(--paper-middle);
}

.animated-folder-card.is-expanded .floating-paper-2,
.animated-folder-card.is-returning .floating-paper-2 {
    background: var(--paper-back);
}

.animated-folder-card.is-expanded .floating-paper-3,
.animated-folder-card.is-returning .floating-paper-3 {
    background: var(--paper-middle);
}

.animated-folder-card.is-expanded:not(.is-opening):not(.is-returning) .floating-paper-1:hover {
    transform:
        translateX(-50%)
        translate3d(-104px, -88px, 0)
        rotate(-13deg)
        scale(1.08);
}

.animated-folder-card.is-expanded:not(.is-opening):not(.is-returning) .floating-paper-2:hover {
    transform:
        translateX(-50%)
        translate3d(0, -126px, 0)
        rotate(4deg)
        scale(1.12);
}

.animated-folder-card.is-expanded:not(.is-opening):not(.is-returning) .floating-paper-3:hover {
    transform:
        translateX(-50%)
        translate3d(104px, -88px, 0)
        rotate(13deg)
        scale(1.08);
}

/* Animations */
@keyframes floatingPaperOpen {
    0% {
        opacity: 0;
        transform:
            translateX(-50%)
            translate3d(var(--paper-start-x), var(--paper-start-y), 0)
            rotate(var(--paper-start-rotate))
            scale(var(--paper-start-scale));
    }

    14% {
        opacity: 0;
        transform:
            translateX(-50%)
            translate3d(var(--paper-start-x), var(--paper-start-y), 0)
            rotate(var(--paper-start-rotate))
            scale(var(--paper-start-scale));
    }

    28% {
        opacity: 1;
    }

    100% {
        opacity: 1;
        transform:
            translateX(-50%)
            translate3d(var(--paper-open-x), var(--paper-open-y), 0)
            rotate(var(--paper-open-rotate))
            scale(var(--paper-open-scale));
    }
}

@keyframes floatingPaperReturn {
    0% {
        opacity: 1;
        transform:
            translateX(-50%)
            translate3d(var(--paper-open-x), var(--paper-open-y), 0)
            rotate(var(--paper-open-rotate))
            scale(var(--paper-open-scale));
    }

    18% {
        opacity: 1;
        transform:
            translateX(-50%)
            translate3d(
                calc(var(--paper-open-x) * 0.35),
                calc(var(--paper-open-y) * 0.7),
                0
            )
            rotate(calc(var(--paper-open-rotate) * 0.55))
            scale(0.82);
    }

    42% {
        opacity: 1;
        transform:
            translateX(-50%)
            translate3d(var(--paper-start-x), -22px, 0)
            rotate(var(--paper-start-rotate))
            scale(0.62);
    }

    50% {
        opacity: 0;
        transform:
            translateX(-50%)
            translate3d(var(--paper-start-x), -4px, 0)
            rotate(var(--paper-start-rotate))
            scale(0.54);
    }

    100% {
        opacity: 0;
        transform:
            translateX(-50%)
            translate3d(var(--paper-start-x), var(--paper-start-y), 0)
            rotate(var(--paper-start-rotate))
            scale(var(--paper-start-scale));
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

/* Accessibility */
.animated-folder-card:focus-visible,
.folder-trigger:focus-visible,
.floating-paper:focus-visible {
    outline: 2px solid var(--folder-focus);
    outline-offset: 4px;
}

@media (prefers-reduced-motion: reduce) {
    .animated-folder-card,
    .animated-folder-card * {
        animation-duration: 1ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 1ms !important;
        scroll-behavior: auto !important;
    }
}

/* Responsive */
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