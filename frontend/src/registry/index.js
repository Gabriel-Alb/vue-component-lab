import { defineAsyncComponent } from "vue";

export const registry = [
  {
    slug: "circular-text",
    label: "Circular Text",
    category: "Text",
    component: defineAsyncComponent(
      () =>
        import("../components/ui/animated-text/CircularText/CircularTextDemo.vue"),
    ),
  },
  {
    slug: "typewriter",
    label: "Typewriter",
    category: "Text",
    component: defineAsyncComponent(
      () =>
        import("../components/ui/animated-text/TypewriterText/TypewriterTextDemo.vue"),
    ),
  },
  {
    slug: "joãobobo",
    label: "João bobo",
    category: "components",
    component: defineAsyncComponent(
      () =>
        import("../components/ui/AnimatedJoaoBobo/AnimatedJoaoBoboDemo.vue"),
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
    slug: "clickspark",
    label: "Click Spark",
    category: "pointer",
    component: defineAsyncComponent(
      () => import("../components/ui/ClickSpark/ClickSparkDemo.vue"),
    ),
  },
];
