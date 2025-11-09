<template>
  <div class="flex h-full flex-col gap-6 overflow-hidden">
    <div class="grid flex-1 grid-cols-1 gap-6 xl:grid-cols-[2fr_1fr]">
      <TwoWeekCalendar
        :start-date="rangeStart"
        :selected-date="selectedDay"
        :events="events"
        :working-hours="workingHours"
        @select:day="onSelectDay"
        @open:event="onOpenEvent"
        @open:create="onOpenCreate"
        @jump:today="jumpToToday"
      />
      <DayAgenda :day="selectedDay" :events="agendaEvents" @open="onOpenEvent" @create="onOpenCreateFromDay" />
    </div>

    <EventDrawer
      :open="drawerOpen"
      :event="activeEvent"
      :day="drawerDay"
      :start-hint="drawerStartHint"
      :events="events"
      @close="closeDrawer"
      @save="onSaveEvent"
      @delete="onDeleteEvent"
      @duplicate="onDuplicateEvent"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onBeforeUnmount, reactive } from 'vue';
import { addDays, formatISO, isSameDay, parseISO, startOfDay, startOfToday } from 'date-fns';

import DayAgenda from '@/components/calendar/DayAgenda.vue';
import TwoWeekCalendar from '@/components/calendar/TwoWeekCalendar.vue';
import EventDrawer from '@/components/events/EventDrawer.vue';
import { useEventsStore, type EventInput } from '@/stores/events';
import { useSettingsStore } from '@/stores/settings';
import type { EventModel } from '@/types';
import { getTwoWeekRange, isEventOnDay } from '@/utils/date';

const eventsStore = useEventsStore();
const settingsStore = useSettingsStore();

const state = reactive({
  rangeStart: formatISO(startOfToday()),
  selectedDay: formatISO(startOfToday()),
  drawerOpen: false,
  activeEventId: null as string | null,
  drawerDay: null as string | null,
  startHint: null as string | null
});

const events = computed(() => eventsStore.events);

const workingHours = computed(() => ({
  start: settingsStore.workdayStart,
  end: settingsStore.workdayEnd
}));

const selectedDay = computed(() => state.selectedDay);
const rangeStart = computed(() => state.rangeStart);

const agendaEvents = computed(() => {
  const day = parseISO(state.selectedDay);
  return events.value
    .filter((event) => isEventOnDay(event, day))
    .sort((a, b) => parseISO(a.start).getTime() - parseISO(b.start).getTime());
});

const activeEvent = computed<EventModel | null>(() => {
  if (!state.activeEventId) return null;
  return events.value.find((event) => event.id === state.activeEventId) ?? null;
});

const drawerOpen = computed(() => state.drawerOpen);
const drawerDay = computed(() => state.drawerDay ?? state.selectedDay);
const drawerStartHint = computed(() => state.startHint);

onMounted(async () => {
  await Promise.all([settingsStore.load(), eventsStore.load()]);
  ensureSelectedWithinRange();
  window.addEventListener('keydown', onKeyDown);
});

onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeyDown);
});

function ensureSelectedWithinRange() {
  const start = startOfDay(parseISO(state.rangeStart));
  const days = getTwoWeekRange(start);
  const selected = parseISO(state.selectedDay);
  const inRange = days.some((day) => isSameDay(day, selected));
  if (!inRange) {
    state.selectedDay = formatISO(start, { representation: 'complete' });
  }
}

function onSelectDay(iso: string) {
  state.selectedDay = iso;
  const start = startOfDay(parseISO(state.rangeStart));
  const end = addDays(start, 13);
  const target = parseISO(iso);
  if (target < start || target > end) {
    state.rangeStart = formatISO(startOfDay(target));
  }
}

function onOpenEvent(event: EventModel) {
  state.activeEventId = event.id;
  state.drawerOpen = true;
  state.drawerDay = formatISO(startOfDay(parseISO(event.start)));
  state.startHint = event.start;
}

function onOpenCreate(context: { day: string; start?: string | undefined }) {
  state.activeEventId = null;
  state.drawerOpen = true;
  state.drawerDay = context.day;
  state.startHint = context.start ?? null;
}

function onOpenCreateFromDay(day: string) {
  onOpenCreate({ day });
}

function closeDrawer() {
  state.drawerOpen = false;
  state.activeEventId = null;
  state.startHint = null;
}

async function onSaveEvent(input: EventInput) {
  await eventsStore.save(input);
  closeDrawer();
}

async function onDeleteEvent(id: string) {
  await eventsStore.remove(id);
  closeDrawer();
}

async function onDuplicateEvent(id: string) {
  await eventsStore.duplicate(id);
}

function jumpToToday() {
  const today = formatISO(startOfToday());
  state.rangeStart = today;
  state.selectedDay = today;
}

function onKeyDown(event: KeyboardEvent) {
  if (event.defaultPrevented) return;
  const tag = (event.target as HTMLElement)?.tagName?.toLowerCase();
  if (tag === 'input' || tag === 'textarea' || (event.target as HTMLElement)?.isContentEditable) {
    return;
  }
  if (event.key === 'n' || event.key === 'N') {
    event.preventDefault();
    onOpenCreate({ day: state.selectedDay });
  }
  if (event.key === 't' || event.key === 'T') {
    event.preventDefault();
    jumpToToday();
  }
}
</script>
