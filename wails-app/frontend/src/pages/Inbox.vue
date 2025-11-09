<template>
  <div class="flex h-full flex-col gap-6 overflow-y-auto">
    <section class="grid gap-6 lg:grid-cols-[3fr_2fr]">
      <ApprovalQueue
        :events="pendingEvents"
        @accept="onAccept"
        @reject="onReject"
        @edit="onEdit"
      />
      <ActionPlanDiff :diff="diff" :events="events" />
    </section>

    <EventDrawer
      :open="drawerOpen"
      :event="activeEvent"
      :day="activeEventDay"
      :start-hint="activeEvent?.start ?? null"
      :events="events"
      @close="closeDrawer"
      @save="onSave"
      @delete="onDelete"
      @duplicate="onDuplicate"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive } from 'vue';
import { addDays, formatISO, parseISO } from 'date-fns';

import ActionPlanDiff from '@/components/approval/ActionPlanDiff.vue';
import ApprovalQueue from '@/components/approval/ApprovalQueue.vue';
import EventDrawer from '@/components/events/EventDrawer.vue';
import { useEventsStore, type EventInput } from '@/stores/events';
import type { ActionPlanDiff as Diff, EventModel } from '@/types';

const eventsStore = useEventsStore();

const state = reactive({
  drawerOpen: false,
  activeId: null as string | null
});

const events = computed(() => eventsStore.events);

const pendingEvents = computed(() => events.value.filter((event) => event.status === 'proposed'));

const activeEvent = computed<EventModel | null>(() => {
  if (!state.activeId) return null;
  return events.value.find((event) => event.id === state.activeId) ?? null;
});

const activeEventDay = computed(() => (activeEvent.value ? formatISO(parseISO(activeEvent.value.start)) : null));

const diff = computed<Diff>(() => {
  const added = pendingEvents.value.slice(0, 2);
  const movedSource = events.value.find((event) => event.status === 'scheduled');
  const moved: Diff['moved'] = movedSource
    ? [
        {
          id: movedSource.id,
          from: movedSource.start,
          to: formatISO(addDays(parseISO(movedSource.start), 1))
        }
      ]
    : [];
  const deleted = events.value.filter((event) => event.status === 'canceled').slice(0, 1).map((event) => event.id);
  return {
    added,
    moved,
    deleted,
    notes: 'AI draft: Shift the weekly sync to accommodate prototype focus time. Confirm follow-up reminders before publishing.'
  };
});

onMounted(async () => {
  if (!events.value.length) {
    await eventsStore.load();
  }
});

async function onAccept(id: string) {
  await eventsStore.setStatus(id, 'scheduled');
}

async function onReject(id: string) {
  await eventsStore.setStatus(id, 'canceled');
}

function onEdit(event: EventModel) {
  state.activeId = event.id;
  state.drawerOpen = true;
}

function closeDrawer() {
  state.drawerOpen = false;
  state.activeId = null;
}

async function onSave(input: EventInput) {
  await eventsStore.save(input);
  closeDrawer();
}

async function onDelete(id: string) {
  await eventsStore.remove(id);
  closeDrawer();
}

async function onDuplicate(id: string) {
  await eventsStore.duplicate(id);
}
</script>
