<template>
  <div class="w-[380px]">
    <button
      type="button"
      class="mb-4 rounded-full border border-white/[0.10] bg-[#0B0D12] px-4 py-2 text-sm font-medium text-slate-100 shadow-[0_14px_34px_rgba(0,0,0,0.25)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#11141B] hover:shadow-[0_18px_44px_rgba(0,0,0,0.35)]"
      @click="startNotifications"
    >
      Ativar notificações
    </button>

    <NotificationList
      :notifications="notifications"
      @remove="removeNotification"
    />
  </div>
</template>

<script setup>
import { onBeforeUnmount, ref } from "vue";
import NotificationList from "./NotificationList.vue";

const notifications = ref([]);
const timers = [];

const mockNotifications = [
  {
    name: "Ana Clara",
    message: "Enviou uma nova atualização para você revisar.",
  },
  {
    name: "Lucas Mendes",
    message: "Comentou em uma atividade recente do painel.",
  },
  {
    name: "Sistema",
    message: "Uma nova informação acabou de ser processada.",
  },
  {
    name: "Dashboard",
    message: "Os indicadores foram atualizados automaticamente.",
  },
  {
    name: "Equipe",
    message: "Existe uma nova solicitação aguardando resposta.",
  },
  {
    name: "Operação",
    message: "Uma alteração importante foi registrada agora.",
  },
  {
    name: "Relatório",
    message: "O resumo mais recente já está disponível.",
  },
  {
    name: "Monitoramento",
    message: "Uma nova atividade foi detectada no ambiente.",
  },
  {
    name: "Segurança",
    message: "Um evento recente foi validado com sucesso.",
  },
  {
    name: "Atualização",
    message: "Novos dados chegaram e foram adicionados à lista.",
  },
];

onBeforeUnmount(() => {
  clearTimers();
});

function startNotifications() {
  clearTimers();

  notifications.value = [];

  mockNotifications.forEach((notification, index) => {
    const timer = setTimeout(() => {
      addNotification(notification);
    }, index * 850);

    timers.push(timer);
  });
}

function addNotification(notification) {
  const id =
    typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random()}`;

  notifications.value.unshift({
    id,
    ...notification,
    time: "agora",
  });

  notifications.value = notifications.value.slice(0, 10);
}

function removeNotification(id) {
  notifications.value = notifications.value.filter(
    (notification) => notification.id !== id,
  );
}

function clearTimers() {
  timers.forEach((timer) => clearTimeout(timer));
  timers.length = 0;
}
</script>