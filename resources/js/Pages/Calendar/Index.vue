<template>
  <section class="flex flex-col gap-6">
    <FilterBar
      ref="filterBarRef"
      :search="filters.search"
      :status="filters.status"
      :priority="filters.priority"
      :project="filters.project"
      :projects="projects"
      @update:search="(value) => (filters.search = value)"
      @update:status="(value) => (filters.status = value)"
      @update:priority="(value) => (filters.priority = value)"
      @update:project="(value) => (filters.project = value)"
    />

    <div class="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
      <TwoWeekCalendar
        :start-date="rangeStart"
        :selected-date="selectedDate"
        :events="calendarEvents"
        :working-hours="settings.workingHours"
        @select:day="onSelectDay"
        @open:create="onCreateEvent"
        @open:event="onOpenEvent"
        @jump:today="goToToday"
      />

      <DayAgenda
        :day="selectedDate"
        :events="agendaEvents"
        @create="(day) => onCreateEvent({ day })"
        @open="onOpenEvent"
      />
    </div>
  </section>

  <EventDrawer
    :open="drawerOpen"
    :event="editingEvent"
    :day="selectedDate"
    :start-hint="startHint"
    :events="eventsStore.events"
    @close="closeDrawer"
    @save="handleSave"
    @delete="handleDelete"
    @duplicate="handleDuplicate"
  />
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue';
import { addDays, isAfter, isBefore, isWithinInterval, parseISO, startOfDay, startOfToday } from 'date-fns';
import { useHead } from '@inertiajs/vue3';

import AppShell from '@/components/common/AppShell.vue';
import FilterBar from '@/components/common/FilterBar.vue';
import DayAgenda from '@/components/calendar/DayAgenda.vue';
import TwoWeekCalendar from '@/components/calendar/TwoWeekCalendar.vue';
import EventDrawer from '@/components/events/EventDrawer.vue';
import { useEventsStore } from '@/stores/events';
import { useSettingsStore } from '@/stores/settings';
import type { EventInput } from '@/stores/events';
import type { EventModel, EventStatus, Priority } from '@/types';
import { eventOverlapsRange } from '@/utils/date';

defineOptions({ layout: AppShell });

useHead({ title: 'Calendar' });

const eventsStore = useEventsStore();
const settings = useSettingsStore();

const filters = reactive({
  search: '',
  status: 'all' as EventStatus | 'all',
  priority: 'all' as Priority | 'all',
  project: 'all' as string | 'all',
});

const today = startOfToday();
const rangeStartRef = ref(startOfDay(today).toISOString());
const selectedDateRef = ref(startOfDay(today).toISOString());
const drawerOpen = ref(false);
const editingEvent = ref<EventModel | null>(null);
const startHint = ref<string | null>(null);

const filterBarRef = ref<InstanceType<typeof FilterBar> | null>(null);

onMounted(() => {
  eventsStore.seedIfEmpty();
  window.addEventListener('keydown', handleKeyboard);
});

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeyboard);
});

const rangeStart = computed(() => rangeStartRef.value);
const selectedDate = computed(() => selectedDateRef.value);

const rangeEnd = computed(() => addDays(parseISO(rangeStart.value), 13));

const allEvents = computed(() => eventsStore.events);

const calendarEvents = computed(() => {
  const start = parseISO(rangeStart.value);
  const end = rangeEnd.value;
  return allEvents.value
    .filter(applyFilters)
    .filter((event) => eventOverlapsRange(event, start, end));
});

const agendaEvents = computed(() =>
  eventsStore
    .byDay(selectedDate.value)
    .filter(applyFilters),
);

const projects = computed(() => eventsStore.projects);

function applyFilters(event: EventModel) {
  if (filters.status !== 'all' && event.status !== filters.status) {
    return false;
  }
  if (filters.priority !== 'all' && event.priority !== filters.priority) {
    return false;
  }
  if (filters.project !== 'all' && event.project !== filters.project) {
    return false;
  }
  if (!filters.search) {
    return true;
  }
  const query = filters.search.toLowerCase();
  return [event.title, event.owner, event.project ?? '', ...event.assignees]
    .map((value) => value?.toLowerCase() ?? '')
    .some((value) => value.includes(query));
}

function onSelectDay(day: string) {
  setSelectedDay(day);
}

function onCreateEvent(payload: { day: string; start?: string; allDay?: boolean }) {
  const baseStart = payload.start ?? payload.day;
  startHint.value = baseStart;
  editingEvent.value = null;
  setSelectedDay(payload.day);
  drawerOpen.value = true;
}

function onOpenEvent(event: EventModel) {
  editingEvent.value = event;
  startHint.value = event.start;
  setSelectedDay(event.start);
  drawerOpen.value = true;
}

function goToToday() {
  setSelectedDay(startOfDay(today).toISOString());
}

function handleSave(payload: EventInput) {
  if (editingEvent.value) {
    eventsStore.update(editingEvent.value.id, payload);
  } else {
    eventsStore.create(payload);
  }
  drawerOpen.value = false;
  editingEvent.value = null;
}

function handleDelete(id: string) {
  eventsStore.remove(id);
  drawerOpen.value = false;
  if (editingEvent.value?.id === id) {
    editingEvent.value = null;
  }
}

function handleDuplicate(id: string) {
  eventsStore.duplicate(id);
  drawerOpen.value = false;
}

function closeDrawer() {
  drawerOpen.value = false;
  editingEvent.value = null;
}

function handleKeyboard(event: KeyboardEvent) {
  const target = event.target as HTMLElement | null;
  const tagName = target?.tagName?.toLowerCase();
  const isInput = tagName === 'input' || tagName === 'textarea';
  if (event.key === '/' && !isInput) {
    event.preventDefault();
    filterBarRef.value?.focusSearch?.();
  }
  if (event.key === 'n' && !isInput) {
    event.preventDefault();
    onCreateEvent({ day: selectedDate.value });
  }
  if (event.key.toLowerCase() === 't' && !isInput) {
    event.preventDefault();
    goToToday();
  }
  if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
    event.preventDefault();
    const delta = event.key === 'ArrowLeft' ? -1 : 1;
    moveSelectedDay(delta);
  }
}

function moveSelectedDay(delta: number) {
  const current = parseISO(selectedDate.value);
  const next = addDays(current, delta);
  const start = parseISO(rangeStart.value);
  const end = rangeEnd.value;
  if (isBefore(next, start) || isAfter(next, end)) {
    return;
  }
  selectedDateRef.value = next.toISOString();
}

const selectedDateInterval = computed(() => ({
  start: parseISO(rangeStart.value),
  end: rangeEnd.value,
}));

watch(
  () => selectedDate.value,
  (value) => {
    const date = parseISO(value);
    if (!isWithinInterval(date, selectedDateInterval.value)) {
      selectedDateRef.value = rangeStart.value;
    }
  },
);

function setSelectedDay(iso: string) {
  const date = parseISO(iso);
  selectedDateRef.value = startOfDay(date).toISOString();
}
</script>
