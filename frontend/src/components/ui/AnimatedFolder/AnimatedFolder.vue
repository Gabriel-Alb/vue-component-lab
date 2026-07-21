<template>
    <div
        class="animated-folder-card relative flex w-full max-w-[340px] flex-col items-center bg-transparent p-0 text-center transition-all duration-300 hover:-translate-y-1"
        :class="[
            `is-${folderState}`,
            { 'is-expanded': isOpenOrOpening },
        ]"
        :style="folderStyle"
        tabindex="0"
        @mouseenter="handleMouseEnter"
        @mouseleave="handleMouseLeave"
        @click="handleCardClick"
        @keydown.escape="closeFolder()"
    >
        <div
            aria-hidden="true"
            class="pointer-events-none absolute inset-0 -z-10 opacity-0 transition-opacity duration-500"
            :class="{ 'opacity-100': showBackgroundGlow }"
        >
            <div
                class="absolute left-1/2 top-8 size-56 -translate-x-1/2 rounded-full bg-[var(--folder-main)]/30 blur-3xl"
            />
        </div>

        <div class="folder-scene relative h-[290px] w-[300px]">
            <button
                type="button"
                class="folder-trigger absolute inset-x-0 bottom-8 z-20 h-[190px] cursor-pointer border-0 bg-transparent p-0"
                :aria-label="triggerAriaLabel"
                :aria-expanded="isOpenOrOpening"
                :disabled="isAnimating"
                @click.stop="handleTriggerClick"
            />

            <div class="floating-papers">
                <button
                    v-for="paper in visiblePapers"
                    :key="paper.key"
                    type="button"
                    class="floating-paper"
                    :style="paper.style"
                    :aria-label="paper.ariaLabel"
                    :disabled="!isExpanded"
                    @click.stop="selectPaper(paper.original)"
                >
                    <span>{{ paper.label }}</span>
                </button>
            </div>

            <div class="inside-papers" aria-hidden="true">
                <div
                    v-for="layer in insidePaperLayers"
                    :key="layer"
                    class="inside-paper"
                    :class="`inside-paper-${layer}`"
                />
            </div>

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

const PAPER_STYLES = [
    {
        '--paper-open-x': '-104px',
        '--paper-open-y': '-88px',
        '--paper-open-rotate': '-13deg',
        '--paper-start-x': '-18px',
        '--paper-start-y': '9px',
        '--paper-start-rotate': '-6deg',
        '--paper-expanded-background': 'var(--paper-middle)',
        '--paper-hover-scale': '1.08',
    },
    {
        '--paper-open-y': '-126px',
        '--paper-open-rotate': '4deg',
        '--paper-open-scale': '1.04',
        '--paper-start-y': '6px',
        '--paper-start-rotate': '2deg',
        '--paper-delay': '34ms',
        '--paper-expanded-background': 'var(--paper-back)',
        '--paper-hover-scale': '1.12',
    },
    {
        '--paper-open-x': '104px',
        '--paper-open-y': '-88px',
        '--paper-open-rotate': '13deg',
        '--paper-start-x': '18px',
        '--paper-start-y': '9px',
        '--paper-start-rotate': '6deg',
        '--paper-delay': '68ms',
        '--paper-expanded-background': 'var(--paper-middle)',
        '--paper-hover-scale': '1.08',
    },
]

const insidePaperLayers = ['front', 'middle', 'back']

const folderState = ref(FOLDER_STATE.IDLE)

let animationTimer = null
let pendingSelectedPaper = null

const isExpanded = computed(
    () => folderState.value === FOLDER_STATE.EXPANDED,
)

const isAnimating = computed(
    () =>
        folderState.value === FOLDER_STATE.OPENING ||
        folderState.value === FOLDER_STATE.RETURNING,
)

const isOpenOrOpening = computed(
    () =>
        folderState.value === FOLDER_STATE.OPENING ||
        folderState.value === FOLDER_STATE.EXPANDED,
)

const showBackgroundGlow = computed(
    () => folderState.value !== FOLDER_STATE.IDLE,
)

const triggerAriaLabel = computed(
    () => (isExpanded.value ? 'Fechar pasta' : 'Abrir pasta'),
)

const visiblePapers = computed(() =>
    props.papers.slice(0, 3).map((paper, index) => {
        const fallbackLabel = `Paper ${index + 1}`

        const label =
            typeof paper === 'string'
                ? paper || fallbackLabel
                : paper?.label ||
                  paper?.title ||
                  paper?.value ||
                  fallbackLabel

        const rawKey =
            typeof paper === 'object' && paper !== null
                ? paper.id ||
                  paper.value ||
                  paper.to ||
                  paper.href ||
                  paper.label ||
                  label
                : paper || label

        return {
            original: paper,
            label,
            key: `paper-${index}-${String(rawKey)}`,
            ariaLabel: `Selecionar ${label}`,
            style: PAPER_STYLES[index],
        }
    }),
)

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

function clearAnimationTimer() {
    if (!animationTimer) return

    clearTimeout(animationTimer)
    animationTimer = null
}

function startAnimationTimer(duration, callback) {
    clearAnimationTimer()

    animationTimer = setTimeout(() => {
        animationTimer = null
        callback()
    }, duration)
}

function handleMouseEnter() {
    if (folderState.value !== FOLDER_STATE.IDLE) return

    folderState.value = FOLDER_STATE.HOVERING
}

function handleMouseLeave() {
    if (folderState.value !== FOLDER_STATE.HOVERING) return

    folderState.value = FOLDER_STATE.IDLE
}

function handleTriggerClick() {
    if (isAnimating.value) return

    if (isExpanded.value) {
        closeFolder()
        return
    }

    openFolder()
}

function openFolder() {
    const canOpen =
        folderState.value === FOLDER_STATE.IDLE ||
        folderState.value === FOLDER_STATE.HOVERING

    if (!canOpen) return

    pendingSelectedPaper = null
    folderState.value = FOLDER_STATE.OPENING

    emit('open')

    startAnimationTimer(ANIMATION_DURATION.opening, () => {
        folderState.value = FOLDER_STATE.EXPANDED
    })
}

function closeFolder(selectedPaper = null) {
    if (!isExpanded.value) return

    pendingSelectedPaper = selectedPaper
    folderState.value = FOLDER_STATE.RETURNING

    startAnimationTimer(ANIMATION_DURATION.closing, () => {
        folderState.value = FOLDER_STATE.IDLE

        emit('close')

        if (pendingSelectedPaper) {
            emit('select', pendingSelectedPaper)
        }

        pendingSelectedPaper = null
    })
}

function selectPaper(paper) {
    if (!isExpanded.value || !paper) return

    closeFolder(paper)
}

function handleCardClick(event) {
    if (!isExpanded.value) return
    if (event.target.closest?.('.floating-paper')) return

    closeFolder()
}

onBeforeUnmount(clearAnimationTimer)
</script>

<style scoped>
.animated-folder-card {
    --folder-motion-duration: var(--folder-open-duration);
}

.animated-folder-card.is-returning {
    --folder-motion-duration: var(--folder-close-duration);
}

.folder-scene {
    perspective: 1100px;
    transform-style: preserve-3d;
    isolation: isolate;
}

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
        transform var(--folder-motion-duration)
            cubic-bezier(0.2, 0.85, 0.2, 1),
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
        linear-gradient(
            180deg,
            rgba(255, 255, 255, 0.08),
            transparent 36%
        ),
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
        left var(--folder-motion-duration)
            cubic-bezier(0.2, 0.85, 0.2, 1),
        width var(--folder-motion-duration)
            cubic-bezier(0.2, 0.85, 0.2, 1),
        bottom var(--folder-motion-duration)
            cubic-bezier(0.2, 0.85, 0.2, 1),
        transform var(--folder-motion-duration)
            cubic-bezier(0.2, 0.85, 0.2, 1),
        clip-path var(--folder-motion-duration)
            cubic-bezier(0.2, 0.85, 0.2, 1),
        border-radius var(--folder-motion-duration) ease,
        filter var(--folder-motion-duration) ease;
}

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
        transform var(--folder-motion-duration)
            cubic-bezier(0.2, 0.85, 0.2, 1);
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
    --paper-expanded-background: var(--paper-front);
    --paper-hover-scale: 1.08;

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
        translate3d(
            var(--paper-start-x),
            var(--paper-start-y),
            0
        )
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
    clip-path: polygon(0 0, 100% 0, 91.5% 100%, 8.5% 100%);
    border-radius: 22px 22px 34px 34px;
    filter: saturate(1.08);
}

.animated-folder-card.is-expanded .folder-front {
    left: 10px;
    bottom: 60px;
    width: 280px;
    transform: translateY(2px) scaleY(0.54) skewX(0deg);
    clip-path: polygon(0 0, 100% 0, 88% 100%, 12% 100%);
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
    background: var(--paper-expanded-background);
    transform:
        translateX(-50%)
        translate3d(
            var(--paper-open-x),
            var(--paper-open-y),
            0
        )
        rotate(var(--paper-open-rotate))
        scale(var(--paper-open-scale));
}

.animated-folder-card.is-opening .floating-paper {
    animation:
        floatingPaperOpen
        var(--paper-open-duration)
        cubic-bezier(0.22, 1, 0.36, 1)
        both;
    animation-delay: var(--paper-delay);
    transition:
        background 200ms ease,
        box-shadow 200ms ease;
}

.animated-folder-card.is-returning .floating-paper {
    background: var(--paper-expanded-background);
    animation:
        floatingPaperReturn
        var(--paper-return-duration)
        cubic-bezier(0.45, 0, 0.25, 1)
        both;
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
    animation:
        floatingPaperLabelOpen
        var(--paper-label-open-duration)
        ease
        both;
    animation-delay: calc(var(--paper-delay) + 170ms);
    transition: none;
}

.animated-folder-card.is-returning .floating-paper span {
    animation:
        floatingPaperLabelReturn
        var(--paper-label-return-duration)
        ease
        both;
    transition: none;
}

.animated-folder-card.is-expanded:not(.is-opening):not(.is-returning)
    .floating-paper:hover {
    transform:
        translateX(-50%)
        translate3d(
            var(--paper-open-x),
            var(--paper-open-y),
            0
        )
        rotate(var(--paper-open-rotate))
        scale(var(--paper-hover-scale));
}

@keyframes floatingPaperOpen {
    0%,
    14% {
        opacity: 0;
        transform:
            translateX(-50%)
            translate3d(
                var(--paper-start-x),
                var(--paper-start-y),
                0
            )
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
            translate3d(
                var(--paper-open-x),
                var(--paper-open-y),
                0
            )
            rotate(var(--paper-open-rotate))
            scale(var(--paper-open-scale));
    }
}

@keyframes floatingPaperReturn {
    0% {
        opacity: 1;
        transform:
            translateX(-50%)
            translate3d(
                var(--paper-open-x),
                var(--paper-open-y),
                0
            )
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
            translate3d(
                var(--paper-start-x),
                var(--paper-start-y),
                0
            )
            rotate(var(--paper-start-rotate))
            scale(var(--paper-start-scale));
    }
}

@keyframes floatingPaperLabelOpen {
    from {
        opacity: 0;
        transform: translate3d(0, 10px, 0);
    }

    to {
        opacity: 1;
        transform: translate3d(0, 0, 0);
    }
}

@keyframes floatingPaperLabelReturn {
    from {
        opacity: 1;
        transform: translate3d(0, 0, 0);
    }

    to {
        opacity: 0;
        transform: translate3d(0, 8px, 0);
    }
}

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