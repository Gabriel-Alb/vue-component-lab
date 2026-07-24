import { defineAsyncComponent } from "vue";

export const registry = [
  {
    slug: "circular-text",
    label: "Circular Text",
    category: "Text",
    component: defineAsyncComponent(
      () =>
        import("../components/ui/AnimatedText/CircularText/CircularTextDemo.vue"),
    ),
  },
  {
    slug: "typewriter",
    label: "Typewriter",
    category: "Text",
    component: defineAsyncComponent(
      () =>
        import("../components/ui/AnimatedText/TypewriterText/TypewriterTextDemo.vue"),
    ),
  },
  {
    slug: "animated-neon",
    label: "Animated Neon",
    category: "Text",
    component: defineAsyncComponent(
      () =>
        import("../components/ui/AnimatedText/AnimatedNeonTitle/AnimatedNeonTitleDemo.vue"),
    ),
  },
  {
    slug: "wave-title",
    label: "Wave Title",
    category: "Text",
    component: defineAsyncComponent(
      () => import("../components/ui/AnimatedText/WaveTitle/WaveTitleDemo.vue"),
    ),
  },
  {
    slug: "outline-pulse",
    label: "Outline Pulse",
    category: "Text",
    component: defineAsyncComponent(
      () => import("../components/ui/AnimatedText/OutlinePulseTitle/OutlinePulseTitleDemo.vue")
    ),
  },
    {
    slug: "aurora-title ",
    label: "Animated Aurora Title ",
    category: "Text",
    component: defineAsyncComponent(
      () => import("../components/ui/AnimatedText/AnimatedAuroraTitle/AnimatedAuroraTitleDemo.vue")
    ),
  },
  {
    slug: "joao-bobo",
    label: "João bobo",
    category: "components",
    component: defineAsyncComponent(
      () => import("../components/ui/AnimatedWobble/AnimatedWobbleDemo.vue"),
    ),
  },
  {
    slug: "animated-folder",
    label: "Animated Folder",
    category: "components",
    component: defineAsyncComponent(
      () => import("../components/ui/AnimatedFolder/AnimatedFolderDemo.vue"),
    ),
  },
  {
    slug: "preview-folder",
    label: "Preview Folder",
    category: "components",
    component: defineAsyncComponent(
      () => import("../components/ui/PreviewFolder/PreviewFolderDemo.vue"),
    ),
  },
  {
    slug: "magnetic-dot",
    label: "Magnetic Dot",
    category: "components",
    component: defineAsyncComponent(
      () => import("../components/ui/MagneticDot/MagneticDotDemo.vue"),
    ),
  },
  {
    slug: "magnetic-button",
    label: "Magnetic Button",
    category: "components",
    component: defineAsyncComponent(
      () => import("../components/ui/MagneticButton/MagneticButtonDemo.vue"),
    ),
  },
  {
    slug: "magnetic-card",
    label: "Magnetic Card",
    category: "components",
    component: defineAsyncComponent(
      () => import("../components/ui/MagneticCard/MagneticCardDemo.vue"),
    ),
  },
  {
    slug: "card-3d",
    label: "3D Card",
    category: "components",
    component: defineAsyncComponent(
      () => import("../components/ui/Card3d/Card3dDemo.vue"),
    ),
  },
  {
    slug: "skill-buttons",
    label: "Skill Buttons",
    category: "components",
    component: defineAsyncComponent(
      () => import("../components/ui/TagButtons/TagButtonsDemo.vue"),
    ),
  },
  {
    slug: "gradient-carousel",
    label: "Gradient Carousel",
    category: "components",
    component: defineAsyncComponent(
      () =>
        import("../components/ui/GradientCarousel/GradientCarouselDemo.vue"),
    ),
  },
  {
    slug: "elastic-buttonRuler",
    label: "Elastic Button Ruler",
    category: "components",
    component: defineAsyncComponent(
      () =>
        import("../components/ui/ElasticButtonRuler/ElasticButtonRulerDemo.vue"),
    ),
  },
  {
    slug: "notification-list",
    label: "Notification List",
    category: "components",
    component: defineAsyncComponent(
      () =>
        import("../components/ui/NotificationList/NotificationListDemo.vue"),
    ),
  },
  {
    slug: "floating-orbit-cards ",
    label: "Floating Orbit Cards ",
    category: "components",
    component: defineAsyncComponent(
      () =>
        import("../components/ui/FloatingOrbitCards/FloatingOrbitCardsDemo.vue"),
    ),
  },
  {
    slug: "click-spark",
    label: "Click Spark",
    category: "pointer",
    component: defineAsyncComponent(
      () => import("../components/ui/ClickSpark/ClickSparkDemo.vue"),
    ),
  },
  {
    slug: "reveal-timeline",
    label: "Reveal Timeline",
    category: "pointer",
    component: defineAsyncComponent(
      () => import("../components/ui/RevealTimeline/RevealTimelineDemo.vue"),
    ),
  },
  {
    slug: "shader-panel",
    label: "Shader Panel",
    category: "Backgrounds",
    component: defineAsyncComponent(
      () => import("../components/ui/ShaderPanel/ShaderPanelDemo.vue"),
    ),
  },
];
