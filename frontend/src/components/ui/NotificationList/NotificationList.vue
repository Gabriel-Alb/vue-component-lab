<template>
  <!-- LISTA REUTILIZÁVEL DE NOTIFICAÇÕES -->
  <TransitionGroup
    name="notification-list"
    tag="div"
    class="notification-list flex max-h-[460px] w-full flex-col gap-3 overflow-y-auto pr-1"
  >
    <button
      v-for="notification in notifications"
      :key="notification.id"
      type="button"
      :class="[
        'notification-item w-full rounded-[20px] border border-white/[0.08] bg-[#0B0D12]/95 p-3.5 text-left',
        'shadow-[0_18px_44px_rgba(0,0,0,0.28)] backdrop-blur-xl',
        'transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]',
        'hover:-translate-y-0.5 hover:border-white/[0.14] hover:bg-[#11141B]',
        closingIds.includes(notification.id)
          ? 'scale-[1.035] translate-x-5 opacity-0 blur-[2px]'
          : 'scale-100 translate-x-0 opacity-100 blur-0',
      ]"
      @click="removeNotification(notification.id)"
    >
      <div class="flex items-center gap-3.5">
        <!-- CÍRCULO SIMULANDO IMAGEM -->
        <div
          class="h-12 w-12 shrink-0 rounded-full border border-white/[0.10] bg-[linear-gradient(135deg,#2B3140,#111827)] shadow-inner shadow-white/[0.06]"
        />

        <!-- TEXTO DA NOTIFICAÇÃO -->
        <div class="min-w-0 flex-1">
          <div class="flex items-center justify-between gap-3">
            <strong class="truncate text-sm font-semibold text-slate-100">
              {{ notification.name }}
            </strong>

            <span class="shrink-0 text-[11px] font-medium text-slate-500">
              {{ notification.time || "agora" }}
            </span>
          </div>

          <p class="mt-1 line-clamp-2 text-sm leading-snug text-slate-400">
            {{ notification.message }}
          </p>
        </div>
      </div>
    </button>
  </TransitionGroup>
</template>

<script setup>
import { ref } from "vue";

defineProps({
  notifications: {
    type: Array,
    required: true,
  },
});

const emit = defineEmits(["remove"]);

const closingIds = ref([]);

function removeNotification(id) {
  if (closingIds.value.includes(id)) return;

  closingIds.value.push(id);

  setTimeout(() => {
    emit("remove", id);

    closingIds.value = closingIds.value.filter((itemId) => itemId !== id);
  }, 420);
}
</script>

<style scoped>
.notification-list-enter-active,
.notification-list-leave-active,
.notification-list-move {
  transition:
    opacity 520ms cubic-bezier(0.22, 1, 0.36, 1),
    transform 520ms cubic-bezier(0.22, 1, 0.36, 1),
    filter 520ms cubic-bezier(0.22, 1, 0.36, 1);
}

.notification-list-enter-from {
  opacity: 0;
  transform: translateY(-26px) scale(0.95);
  filter: blur(8px);
}

.notification-list-enter-to {
  opacity: 1;
  transform: translateY(0) scale(1);
  filter: blur(0);
}

.notification-list-leave-from {
  opacity: 1;
  transform: translateX(0) scale(1);
  filter: blur(0);
}

.notification-list-leave-to {
  opacity: 0;
  transform: translateX(28px) scale(1.04);
  filter: blur(6px);
}

.notification-list-leave-active {
  position: absolute;
  width: 100%;
}

.notification-item {
  will-change: transform, opacity, filter;
}

.notification-list {
  scrollbar-width: thin;
  scrollbar-color: rgba(100, 116, 139, 0.45) transparent;
}

.notification-list::-webkit-scrollbar {
  width: 6px;
}

.notification-list::-webkit-scrollbar-track {
  background: transparent;
}

.notification-list::-webkit-scrollbar-thumb {
  border-radius: 999px;
  background: rgba(100, 116, 139, 0.45);
}

.notification-list::-webkit-scrollbar-thumb:hover {
  background: rgba(148, 163, 184, 0.65);
}
</style>