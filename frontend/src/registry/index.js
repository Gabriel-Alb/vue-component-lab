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
    slug: "interactive wave text",
    label: "Interactive Wave Text",
    category: "Text",
    component: defineAsyncComponent(
      () =>
        import("../components/ui/animated-text/InteractiveWaveText/InteractiveWaveTextDemo.vue"),
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
];
