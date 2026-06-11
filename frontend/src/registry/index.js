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
    slug: "joãobobo",
    label: "João bobo",
    category: "components",
    component: defineAsyncComponent(
      () =>
        import("../components/ui/AnimatedWobble/AnimatedWobbleDemo.vue/index.js"),
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
    slug: "MagneticDot",
    label: "Magnetic Dot",
    category: "components",
    component: defineAsyncComponent(
      () => import("../components/ui/MagneticDot/MagneticDotDemo.vue"),
    ),
  },
  {
    slug: "MagneticButton",
    label: "Magnetic Button",
    category: "components",
    component: defineAsyncComponent(
      () => import("../components/ui/MagneticButton/MagneticButtonDemo.vue"),
    ),
  },
  {
    slug: "MagneticCard",
    label: "Magnetic Card",
    category: "components",
    component: defineAsyncComponent(
      () => import("../components/ui/MagneticCard/MagneticCardDemo.vue"),
    ),
  },
  {
    slug: "Card3d",
    label: "3D card",
    category: "components",
    component: defineAsyncComponent(
      () => import("../components/ui/Card3d/Card3dDemo.vue"),
    ),
  },
  {
    slug: "SkillButtons",
    label: "Skill Buttons",
    category: "components",
    component: defineAsyncComponent(
      () => import("../components/ui/TagButtons/TagButtonsDemo.vue/index.js"),
    ),
  },
  {
    slug: "GradientCarousel",
    label: "Gradient Carousel ",
    category: "components",
    component: defineAsyncComponent(
      () => import("../components/ui/GradientCarousel/GradientCarouselDemo.vue"),
    ),
  },
  {
    slug: "clickspark",
    label: "Click Spark",
    category: "pointer",
    component: defineAsyncComponent(
      () => import("../components/ui/ClickSpark/ClickSparkDemo.vue"),
    ),
  },
  {
    slug: "ShaderPanel",
    label: "Shader Panel",
    category: "Backgrounds",
    component: defineAsyncComponent(
      () => import("../components/ui/ShaderPanel/ShaderPanelDemo.vue"),
    ),
  },
];
