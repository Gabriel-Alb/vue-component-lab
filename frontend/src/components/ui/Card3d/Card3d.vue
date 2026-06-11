<template>
    <component :is="tag" ref="cardRef" v-bind="$attrs"
        class="card-3d-area inline-block max-w-full [perspective:var(--card-perspective)] [transform-style:preserve-3d]"
        :class="[
            {
                'pointer-events-none opacity-70': disabled,
            },
            disabled ? 'cursor-default' : 'cursor-pointer',
        ]" :style="areaStyle" @pointermove="handlePointerMove" @pointerleave="resetTilt" @pointercancel="resetTilt"
        @click="handleCardClick">
        <article class="card-3d relative w-full [aspect-ratio:var(--card-ratio)] [transform-style:preserve-3d]"
            :class="cardClass" :style="cardStyle">
            <div class="card-3d__flipper relative size-full [transform-style:preserve-3d]"
                :class="{ 'is-flipped': isFlipped }">
                <section class="card-3d__face card-3d__face--front absolute inset-0 overflow-hidden backdrop-blur-2xl">
                    <div class="card-3d__surface absolute inset-px pointer-events-none" />

                    <div class="card-3d__content relative z-[2] flex h-full flex-col justify-end" :class="contentClass">
                        <slot name="front">
                            <slot name="eyebrow">
                                <span v-if="eyebrow"
                                    class="card-3d__eyebrow mb-auto w-fit rounded-full border px-2.5 py-[5px] text-[0.68rem] font-bold uppercase tracking-[0.04em]">
                                    {{ eyebrow }}
                                </span>
                            </slot>

                            <slot name="title">
                                <h3 v-if="title"
                                    class="card-3d__title m-0 text-[1.22rem] font-extrabold leading-[1.15]">
                                    {{ title }}
                                </h3>
                            </slot>

                            <slot name="description">
                                <p v-if="description" class="card-3d__description mt-2.5 text-[0.86rem] leading-normal">
                                    {{ description }}
                                </p>
                            </slot>

                            <slot />
                        </slot>
                    </div>
                </section>

                <section class="card-3d__face card-3d__face--back absolute inset-0 overflow-hidden backdrop-blur-2xl">
                    <div class="card-3d__surface absolute inset-px pointer-events-none" />

                    <div class="card-3d__content relative z-[2] flex h-full flex-col" :class="backContentClass">
                        <slot name="back">
                            <div class="flex h-full flex-col justify-between">
                                <span v-if="backEyebrow"
                                    class="card-3d__eyebrow w-fit rounded-full border px-2.5 py-[5px] text-[0.68rem] font-bold uppercase tracking-[0.04em]">
                                    {{ backEyebrow }}
                                </span>

                                <div>
                                    <h3 v-if="backTitle"
                                        class="card-3d__title m-0 text-[1.22rem] font-extrabold leading-[1.15]">
                                        {{ backTitle }}
                                    </h3>

                                    <p v-if="backDescription"
                                        class="card-3d__description mt-2.5 text-[0.86rem] leading-normal">
                                        {{ backDescription }}
                                    </p>
                                </div>
                            </div>
                        </slot>
                    </div>
                </section>
            </div>
        </article>
    </component>
</template>

<script setup>
import { computed, ref } from 'vue'

defineOptions({
    name: 'Card3d',
})

const props = defineProps({
    modelValue: {
        type: Boolean,
        default: undefined,
    },
    tag: {
        type: String,
        default: 'div',
    },
    title: {
        type: String,
        default: '',
    },
    description: {
        type: String,
        default: '',
    },
    eyebrow: {
        type: String,
        default: '',
    },
    backTitle: {
        type: String,
        default: '',
    },
    backDescription: {
        type: String,
        default: '',
    },
    backEyebrow: {
        type: String,
        default: '',
    },
    disabled: {
        type: Boolean,
        default: false,
    },
    flipOnClick: {
        type: Boolean,
        default: true,
    },
    initialFlipped: {
        type: Boolean,
        default: false,
    },
    width: {
        type: String,
        default: '250px',
    },
    aspectRatio: {
        type: String,
        default: '3 / 4.15',
    },
    radius: {
        type: String,
        default: '24px',
    },
    padding: {
        type: String,
        default: '22px',
    },
    maxTilt: {
        type: Number,
        default: 11,
    },
    perspective: {
        type: Number,
        default: 1000,
    },
    scale: {
        type: Number,
        default: 1.018,
    },
    flipDuration: {
        type: Number,
        default: 650,
    },
    background: {
        type: String,
        default:
            'linear-gradient(145deg, rgba(17, 24, 39, 0.92), rgba(31, 41, 55, 0.82))',
    },
    backBackground: {
        type: String,
        default:
            'linear-gradient(145deg, rgba(17, 24, 39, 0.92), rgba(31, 41, 55, 0.82))',
    },
    borderColor: {
        type: String,
        default: 'rgba(255, 255, 255, 0.14)',
    },
    textColor: {
        type: String,
        default: '#f9fafb',
    },
    mutedTextColor: {
        type: String,
        default: 'rgba(249, 250, 251, 0.62)',
    },
    eyebrowColor: {
        type: String,
        default: 'rgba(249, 250, 251, 0.72)',
    },
    shadow: {
        type: String,
        default: '0 22px 60px rgba(0, 0, 0, 0.34)',
    },
    transitionDuration: {
        type: Number,
        default: 180,
    },
    cardClass: {
        type: [String, Array, Object],
        default: '',
    },
    contentClass: {
        type: [String, Array, Object],
        default: '',
    },
    backContentClass: {
        type: [String, Array, Object],
        default: '',
    },
})

const emit = defineEmits(['click', 'flip', 'update:modelValue'])

const cardRef = ref(null)
const internalFlipped = ref(props.initialFlipped)

const rotateX = ref(0)
const rotateY = ref(0)
const isHovering = ref(false)

const isControlled = computed(() => props.modelValue !== undefined)

const isFlipped = computed(() => {
    return isControlled.value ? props.modelValue : internalFlipped.value
})

const areaStyle = computed(() => ({
    '--card-width': props.width,
    '--card-perspective': `${props.perspective}px`,
}))

const cardStyle = computed(() => ({
    '--card-radius': props.radius,
    '--card-padding': props.padding,
    '--card-ratio': props.aspectRatio,
    '--card-bg': props.background,
    '--card-back-bg': props.backBackground,
    '--card-border': props.borderColor,
    '--card-color': props.textColor,
    '--card-muted-color': props.mutedTextColor,
    '--card-eyebrow-color': props.eyebrowColor,
    '--card-shadow': props.shadow,
    '--card-transition': `${props.transitionDuration}ms`,
    '--card-flip-duration': `${props.flipDuration}ms`,
    transform: `
        rotateX(${rotateX.value}deg)
        rotateY(${rotateY.value}deg)
        scale(${isHovering.value ? props.scale : 1})
    `,
}))

function handlePointerMove(event) {
    if (props.disabled || !cardRef.value) return

    const rect = cardRef.value.getBoundingClientRect()

    const x = (event.clientX - rect.left) / rect.width
    const y = (event.clientY - rect.top) / rect.height

    const offsetX = x - 0.5
    const offsetY = y - 0.5

    rotateX.value = offsetY * props.maxTilt
    rotateY.value = -offsetX * props.maxTilt

    isHovering.value = true
}

function resetTilt() {
    rotateX.value = 0
    rotateY.value = 0
    isHovering.value = false
}

function handleCardClick(event) {
    emit('click', event)

    if (props.disabled || !props.flipOnClick) return

    const nextValue = !isFlipped.value

    if (!isControlled.value) {
        internalFlipped.value = nextValue
    }

    emit('update:modelValue', nextValue)
    emit('flip', nextValue)
}
</script>

<style scoped>
.card-3d-area {
    width: var(--card-width);
}

.card-3d {
    transform: var(--card-transform);
    transition:
        transform var(--card-transition) ease,
        border-color var(--card-transition) ease,
        box-shadow var(--card-transition) ease;
    will-change: transform;
}

.card-3d__flipper {
    transition: transform var(--card-flip-duration) cubic-bezier(0.2, 0.8, 0.2, 1);
}

.card-3d__flipper.is-flipped {
    transform: rotateY(180deg);
}

.card-3d__face {
    padding: var(--card-padding);
    color: var(--card-color);
    border: 1px solid var(--card-border);
    border-radius: var(--card-radius);
    box-shadow: var(--card-shadow);
    backface-visibility: hidden;
    -webkit-backface-visibility: hidden;
    transform-style: preserve-3d;
}

.card-3d__face--front {
    background: var(--card-bg);
}

.card-3d__face--back {
    background: var(--card-back-bg);
    transform: rotateY(180deg);
}

.card-3d__surface {
    border-radius: calc(var(--card-radius) - 1px);
    background:
        linear-gradient(135deg,
            rgba(255, 255, 255, 0),
            transparent 36%,
            rgba(255, 255, 255, 0));
}

.card-3d__eyebrow {
    color: var(--card-eyebrow-color);
    border-color: rgba(255, 255, 255, 0.12);
    background: rgba(255, 255, 255, 0.06);
}

.card-3d__description {
    color: var(--card-muted-color);
}

@media (prefers-reduced-motion: reduce) {
    .card-3d {
        transform: none !important;
        transition: none;
    }

    .card-3d__flipper {
        transition: none;
    }
}
</style>