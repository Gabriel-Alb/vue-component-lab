<template>
    <component
        :is="tag"
        ref="areaRef"
        v-bind="$attrs"
        class="magnetic-card-area relative inline-block"
        :class="[areaClass, disabled ? 'pointer-events-none opacity-60' : 'cursor-pointer']"
        :style="areaStyle"
        :tabindex="disabled ? -1 : tabindex"
        :aria-disabled="disabled ? 'true' : undefined"
        @click="handleClick"
        @keydown.enter="handleClick"
        @keydown.space.prevent="handleClick"
        @pointerdown="handlePointerDown"
        @pointerup="stopClick"
        @pointercancel="stopClick"
        @pointerleave="stopClick"
    >
        <article
            ref="cardRef"
            class="magnetic-card relative h-full w-full overflow-hidden"
            :class="[cardClass, { 'is-clicking': state.clicking }]"
            :style="cardStyle"
        >
            <span
                v-if="showRipple && state.rippleVisible"
                :key="state.rippleKey"
                class="magnetic-card__ripple pointer-events-none absolute rounded-full"
                :style="rippleStyle"
            />

            <div
                class="magnetic-card__content relative z-10 h-full w-full"
                :class="contentClass"
                :style="contentStyle"
            >
                <div class="relative z-10 flex h-full w-full flex-col justify-between">
                    <slot>
                        <div>
                            <p
                                v-if="eyebrow"
                                :class="eyebrowClass"
                                :style="{ color: eyebrowColor || mutedTextColor }"
                            >
                                {{ eyebrow }}
                            </p>

                            <h3
                                v-if="title"
                                :class="titleClass"
                                :style="{ color: titleColor || textColor }"
                            >
                                {{ title }}
                            </h3>

                            <p
                                v-if="subtitle"
                                :class="subtitleClass"
                                :style="{ color: subtitleColor || mutedTextColor }"
                            >
                                {{ subtitle }}
                            </p>
                        </div>

                        <slot name="footer" />
                    </slot>
                </div>
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
    href: { type: String, default: "" },
    target: { type: String, default: "_blank" },
    disabled: { type: Boolean, default: false },
    tabindex: { type: Number, default: 0 },

    eyebrow: { type: String, default: "" },
    title: { type: String, default: "Magnetic Card" },
    subtitle: {
        type: String,
        default: "A modern card with smooth magnetic movement and proximity interaction.",
    },

    activationDistance: { type: Number, default: 200 },
    strength: { type: Number, default: 6 },
    contentStrength: { type: Number, default: 2 },
    hoverScale: { type: Number, default: 1.003 },
    clickScale: { type: Number, default: 0.975 },
    contentClickScale: { type: Number, default: 0.992 },

    radius: { type: String, default: "24px" },
    background: { type: String, default: "" },
    colorLight: { type: String, default: "#6438ff" },
    colorPrimary: { type: String, default: "#5227ff" },
    colorDark: { type: String, default: "#421bdc" },

    textColor: { type: String, default: "#ffffff" },
    mutedTextColor: { type: String, default: "rgba(255, 255, 255, 0.7)" },
    titleColor: { type: String, default: "" },
    subtitleColor: { type: String, default: "" },
    eyebrowColor: { type: String, default: "" },

    topGlowColor: { type: String, default: "rgba(255, 255, 255, 0.2)" },
    bottomGlowColor: { type: String, default: "rgba(43, 10, 143, 0.45)" },
    overlayStartColor: { type: String, default: "rgba(255, 255, 255, 0.15)" },
    overlayEndColor: { type: String, default: "rgba(0, 0, 0, 0.2)" },
    clickOverlayColor: { type: String, default: "rgba(0, 0, 0, 0.1)" },

    showGlows: { type: Boolean, default: true },
    showOverlay: { type: Boolean, default: true },
    showRipple: { type: Boolean, default: true },
    magnetic: { type: Boolean, default: true },

    idleShadow: { type: String, default: "" },
    activeShadow: { type: String, default: "" },
    rippleColor: { type: String, default: "rgba(255, 255, 255, 0.3)" },
    rippleSize: { type: String, default: "22px" },
    rippleScale: { type: Number, default: 26 },

    areaClass: { type: [String, Array, Object], default: "" },
    cardClass: { type: [String, Array, Object], default: "" },
    contentClass: { type: [String, Array, Object], default: "p-6" },
    eyebrowClass: {
        type: [String, Array, Object],
        default: "mb-3 text-sm font-semibold tracking-wide",
    },
    titleClass: {
        type: [String, Array, Object],
        default: "text-2xl font-semibold leading-tight",
    },
    subtitleClass: {
        type: [String, Array, Object],
        default: "mt-3 text-sm leading-relaxed",
    },
});

const emit = defineEmits(["click"]);

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

const areaStyle = computed(() => ({
    "--radius": props.radius,
    "--top-glow": props.topGlowColor,
    "--bottom-glow": props.bottomGlowColor,
    "--overlay-start": props.overlayStartColor,
    "--overlay-end": props.overlayEndColor,
    "--click-overlay": props.clickOverlayColor,
    "--glow-opacity": props.showGlows ? 1 : 0,
    "--overlay-opacity": props.showOverlay ? 1 : 0,
    borderRadius: props.radius,
}));

const cardStyle = computed(() => ({
    borderRadius: props.radius,
    color: props.textColor,
    background:
        props.background ||
        `linear-gradient(135deg, ${props.colorLight} 0%, ${props.colorPrimary} 48%, ${props.colorDark} 100%)`,
    boxShadow: state.active
        ? props.activeShadow || `0 18px 44px ${props.colorPrimary}42`
        : props.idleShadow || `0 14px 34px ${props.colorPrimary}30`,
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
        scale(${state.clicking ? props.contentClickScale : 1})
    `,
    transitionDuration: state.active ? "180ms" : "420ms",
}));

const rippleStyle = computed(() => ({
    left: `${state.rippleX}px`,
    top: `${state.rippleY}px`,
    width: props.rippleSize,
    height: props.rippleSize,
    background: props.rippleColor,
    "--ripple-scale": props.rippleScale,
}));

function handleMouseMove(event) {
    if (!props.magnetic || props.disabled) return;

    cancelAnimationFrame(frameId);

    frameId = requestAnimationFrame(() => {
        const areaElement = areaRef.value?.$el || areaRef.value;
        const rect = areaElement?.getBoundingClientRect?.();

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
    if (props.disabled) return;

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

function handleClick(event) {
    if (props.disabled) return;

    emit("click", event);

    if (!props.href) return;

    if (props.target === "_blank") {
        window.open(props.href, props.target, "noopener,noreferrer");
        return;
    }

    window.location.href = props.href;
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
    transform: translateZ(0);
}

.magnetic-card {
    will-change: transform;
}

.magnetic-card::before,
.magnetic-card::after {
    content: "";
    position: absolute;
    pointer-events: none;
    border-radius: 9999px;
    filter: blur(48px);
    opacity: var(--glow-opacity);
}

.magnetic-card::before {
    top: -64px;
    right: -64px;
    width: 192px;
    height: 192px;
    background: var(--top-glow);
}

.magnetic-card::after {
    bottom: -80px;
    left: -64px;
    width: 208px;
    height: 208px;
    background: var(--bottom-glow);
}

.magnetic-card__content {
    transition-property: transform;
    transition-timing-function: ease-out;
}

.magnetic-card__content::before,
.magnetic-card__content::after {
    content: "";
    position: absolute;
    inset: 0;
    pointer-events: none;
}

.magnetic-card__content::before {
    z-index: 0;
    opacity: var(--overlay-opacity);
    background: linear-gradient(135deg, var(--overlay-start), transparent, var(--overlay-end));
}

.magnetic-card__content::after {
    z-index: 20;
    opacity: 0;
    background: var(--click-overlay);
    transition: opacity 150ms ease-out;
}

.magnetic-card.is-clicking .magnetic-card__content::after {
    opacity: 1;
}

.magnetic-card__ripple {
    z-index: 30;
    transform: translate(-50%, -50%) scale(0);
    animation: magnetic-card-ripple 520ms ease-out forwards;
}

@keyframes magnetic-card-ripple {
    from {
        opacity: 0.45;
        transform: translate(-50%, -50%) scale(0);
    }

    to {
        opacity: 0;
        transform: translate(-50%, -50%) scale(var(--ripple-scale));
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