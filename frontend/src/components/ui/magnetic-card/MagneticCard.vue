<template>
    <component
        :is="tag"
        ref="areaRef"
        v-bind="$attrs"
        class="magnetic-card-area relative inline-block"
        :style="{ '--radius': radius }"
        @click="$emit('click', $event)"
        @pointerdown="handlePointerDown"
        @pointerup="stopClick"
        @pointercancel="stopClick"
        @pointerleave="stopClick"
    >
        <article
            ref="cardRef"
            class="magnetic-card relative h-full w-full overflow-hidden text-white"
            :class="[cardClass, { 'is-clicking': state.clicking }]"
            :style="cardStyle"
        >
            <span
                v-if="state.rippleVisible"
                :key="state.rippleKey"
                class="magnetic-card__ripple pointer-events-none absolute rounded-full bg-white/30"
                :style="{ left: `${state.rippleX}px`, top: `${state.rippleY}px` }"
            />

            <div
                class="relative z-10 flex h-full w-full flex-col justify-between"
                :class="contentClass"
                :style="contentStyle"
            >
                <div>
                    <p
                        v-if="eyebrow"
                        class="mb-3 text-sm font-semibold tracking-wide text-white/70"
                    >
                        {{ eyebrow }}
                    </p>

                    <h3 class="text-2xl font-semibold leading-tight text-white">
                        {{ title }}
                    </h3>

                    <p
                        v-if="subtitle"
                        class="mt-3 text-sm leading-relaxed text-white/70"
                    >
                        {{ subtitle }}
                    </p>
                </div>

                <slot name="footer" />
            </div>
        </article>
    </component>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, reactive, ref } from "vue";

defineOptions({
    inheritAttrs: false,
});

const props = defineProps({
    tag: { type: String, default: "div" },
    title: { type: String, default: "Card Magnético" },
    subtitle: {
        type: String,
        default:
            "Um card moderno com movimento magnético suave, brilho roxo e interação por aproximação.",
    },
    eyebrow: { type: String, default: "" },

    activationDistance: { type: Number, default: 200 },
    strength: { type: Number, default: 6 },
    contentStrength: { type: Number, default: 2 },
    hoverScale: { type: Number, default: 1.003 },
    clickScale: { type: Number, default: 0.975 },

    radius: { type: String, default: "24px" },
    colorLight: { type: String, default: "#6438ff" },
    colorPrimary: { type: String, default: "#5227ff" },
    colorDark: { type: String, default: "#421bdc" },

    cardClass: { type: [String, Array, Object], default: "" },
    contentClass: { type: [String, Array, Object], default: "p-6" },
});

defineEmits(["click"]);

const areaRef = ref(null);
const cardRef = ref(null);

const state = reactive({
    x: 0,
    y: 0,
    contentX: 0,
    contentY: 0,
    active: false,
    clicking: false,
    rippleX: 0,
    rippleY: 0,
    rippleVisible: false,
    rippleKey: 0,
});

let frameId = null;
let clickTimeout = null;
let rippleTimeout = null;

const cardStyle = computed(() => ({
    "--light": props.colorLight,
    "--primary": props.colorPrimary,
    "--dark": props.colorDark,
    borderRadius: props.radius,
    boxShadow: state.active
        ? `0 18px 44px ${props.colorPrimary}42`
        : `0 14px 34px ${props.colorPrimary}30`,
    transform: `
        translate3d(${state.x}px, ${state.y}px, 0)
        scale(${state.clicking ? props.clickScale : state.active ? props.hoverScale : 1})
    `,
    transition: state.active
        ? "transform 180ms ease-out, box-shadow 220ms ease-out"
        : "transform 420ms cubic-bezier(0.22, 1, 0.36, 1), box-shadow 320ms ease-out",
}));

const contentStyle = computed(() => ({
    transform: `
        translate3d(${state.contentX}px, ${state.contentY}px, 0)
        scale(${state.clicking ? 0.992 : 1})
    `,
    transitionDuration: state.active ? "180ms" : "420ms",
}));

function handleMouseMove(event) {
    cancelAnimationFrame(frameId);

    frameId = requestAnimationFrame(() => {
        const rect = areaRef.value?.getBoundingClientRect();

        if (!rect) return;

        const inside =
            event.clientX >= rect.left &&
            event.clientX <= rect.right &&
            event.clientY >= rect.top &&
            event.clientY <= rect.bottom;

        const closestX = clamp(event.clientX, rect.left, rect.right);
        const closestY = clamp(event.clientY, rect.top, rect.bottom);
        const distance = Math.hypot(event.clientX - closestX, event.clientY - closestY);

        if (!inside && distance > props.activationDistance) {
            resetPosition();
            return;
        }

        const normalizedX = clamp(
            (event.clientX - (rect.left + rect.width / 2)) / (rect.width / 2),
            -1,
            1
        );

        const normalizedY = clamp(
            (event.clientY - (rect.top + rect.height / 2)) / (rect.height / 2),
            -1,
            1
        );

        const safeX = Math.abs(normalizedX) < 0.08 ? 0 : normalizedX;
        const safeY = Math.abs(normalizedY) < 0.08 ? 0 : normalizedY;

        const force = inside
            ? Math.min(Math.hypot(safeX, safeY), 1) * 0.35
            : (1 - distance / props.activationDistance) * 0.45;

        state.active = true;
        state.x = safeX * props.strength * force;
        state.y = safeY * props.strength * force;
        state.contentX = safeX * props.contentStrength * force;
        state.contentY = safeY * props.contentStrength * force;
    });
}

function handlePointerDown(event) {
    const rect = cardRef.value?.getBoundingClientRect();

    if (!rect) return;

    state.rippleX = event.clientX - rect.left;
    state.rippleY = event.clientY - rect.top;
    state.clicking = true;
    state.rippleVisible = false;
    state.rippleKey += 1;

    nextTick(() => {
        state.rippleVisible = true;
    });

    clearTimeout(rippleTimeout);

    rippleTimeout = setTimeout(() => {
        state.rippleVisible = false;
    }, 520);
}

function stopClick() {
    clearTimeout(clickTimeout);

    clickTimeout = setTimeout(() => {
        state.clicking = false;
    }, 120);
}

function resetPosition() {
    state.active = false;
    state.x = 0;
    state.y = 0;
    state.contentX = 0;
    state.contentY = 0;
}

function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}

onMounted(() => {
    window.addEventListener("mousemove", handleMouseMove, {
        passive: true,
    });
});

onBeforeUnmount(() => {
    window.removeEventListener("mousemove", handleMouseMove);
    cancelAnimationFrame(frameId);
    clearTimeout(clickTimeout);
    clearTimeout(rippleTimeout);
});
</script>

<style scoped>
.magnetic-card-area {
    border-radius: var(--radius);
    transform: translateZ(0);
}

.magnetic-card {
    background: linear-gradient(135deg, var(--light) 0%, var(--primary) 48%, var(--dark) 100%);
    will-change: transform;
}

.magnetic-card::before,
.magnetic-card::after {
    content: "";
    position: absolute;
    pointer-events: none;
    border-radius: 9999px;
    filter: blur(48px);
}

.magnetic-card::before {
    top: -64px;
    right: -64px;
    width: 192px;
    height: 192px;
    background: rgb(255 255 255 / 20%);
}

.magnetic-card::after {
    bottom: -80px;
    left: -64px;
    width: 208px;
    height: 208px;
    background: rgb(43 10 143 / 45%);
}

.magnetic-card.is-clicking .magnetic-card__content {
    opacity: 0.95;
}

.magnetic-card::selection {
    background: transparent;
}

.magnetic-card__ripple {
    z-index: 5;
    width: 22px;
    height: 22px;
    transform: translate(-50%, -50%) scale(0);
    animation: magnetic-card-ripple 520ms ease-out forwards;
}

.magnetic-card::marker {
    display: none;
}

.magnetic-card > div::before {
    content: "";
    position: absolute;
    inset: 0;
    pointer-events: none;
    background: linear-gradient(135deg, rgb(255 255 255 / 15%), transparent, rgb(0 0 0 / 20%));
}

@keyframes magnetic-card-ripple {
    from {
        opacity: 0.45;
        transform: translate(-50%, -50%) scale(0);
    }

    to {
        opacity: 0;
        transform: translate(-50%, -50%) scale(26);
    }
}

@media (prefers-reduced-motion: reduce) {
    .magnetic-card,
    .magnetic-card * {
        transition: none !important;
        transform: none !important;
    }
}
</style>