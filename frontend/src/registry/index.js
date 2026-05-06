import { defineAsyncComponent } from "vue";

export const registry = [
  {
    slug: "code-block",
    label: "lalalala",
    category: "ADMIN",
    component: defineAsyncComponent(
      () => import("../components/ui/CodeBlock.vue"),
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
