<template>
  <section class="flex flex-col gap-4">
    <header class="flex items-center justify-between">
      <div>
        <h2 class="text-lg font-semibold text-white">{{ headerLabel }}</h2>
        <p class="text-sm text-slate-400">{{ subtitle }}</p>
      </div>
      <div class="flex items-center gap-2">
        <button
          type="button"
          class="rounded-full border border-white/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-slate-200 transition hover:bg-white/10"
          @click="emit('jump:today')"
        >
          Today
        </button>
      </div>
    </header>

    <div class="overflow-x-auto">
      <div
        class="grid gap-4"
        :style="{
          gridTemplateColumns: `repeat(${days.length}, minmax(12rem, 1fr))`
        }"
      >
        <div
          v-for="day in days"
          :key="day.iso"
          class="relative flex flex-col gap-3 rounded-3xl border border-white/5 bg-slate-900/60 p-4 transition"
          :class="[
            day.isSelected ? 'ring-2 ring-indigo-400 ring-offset-2 ring-offset-slate-950' : 'hover:border-indigo-400/40',
            day.isToday ? 'border-indigo-400/50 bg-indigo-500/10' : ''
          ]"
          @click="emit('select:day', day.iso)"
        >
          <div class="flex items-center justify-between">
            <div>
              <p class="text-xs uppercase tracking-wide text-slate-400">{{ day.weekday }}</p>
              <p class="text-lg font-semibold text-white">{{ day.dateLabel }}</p>
            </div>
            <span v-if="day.isToday" class="rounded-full bg-indigo-500/20 px-2 py-1 text-xs font-semibold text-indigo-200">
              Today
            </span>
          </div>

          <div class="space-y-2">
            <p class="text-xs uppercase tracking-wide text-slate-500">All-day</p>
            <div class="flex flex-wrap gap-2" @click.stop="emit('open:create', { day: day.iso, allDay: true })">
              <template v-if="day.allDayEvents.length">
                <EventChip
                  v-for="event in day.allDayEvents"
                  :key="event.id"
                  :event="event"
                  :show-time="false"
                  @open="emit('open:event', $event)"
                />
              </template>
              <button
                v-else
                type="button"
                class="rounded-lg border border-dashed border-white/20 px-3 py-2 text-xs text-slate-400 hover:border-indigo-400/60 hover:text-indigo-200"
              >
                Add all-day
              </button>
            </div>
          </div>

          <div class="relative flex-1" @click.stop="onTimeGridClick(day, $event)">
            <div class="pointer-events-none absolute inset-0">
              <div
                v-for="slot in timeSlots"
                :key="slot.key"
                class="absolute left-0 right-0 border-t border-white/5 text-[10px] text-slate-500"
                :style="{ top: `${slot.position}%` }"
              >
                <span v-if="day.index === 0" class="absolute -translate-y-1/2 rounded bg-slate-900/80 px-1">
                  {{ slot.label }}
                </span>
              </div>
            </div>
            <div class="relative h-[40rem]">
              <div v-for="item in day.timedEvents" :key="item.event.id" class="absolute px-1" :style="eventStyle(item)">
                <EventChip :event="item.event" @open="emit('open:event', $event)" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { addMinutes, differenceInMinutes, format, isSameDay, parseISO, startOfDay, startOfToday } from 'date-fns';

import EventChip from '@/components/events/EventChip.vue';
import type { EventModel } from '@/types';
import {
  getEventPosition,
  getTwoWeekRange,
  getWorkingMinutes,
  getWorkingWindow,
  isEventOnDay
} from '@/utils/date';

interface CalendarDay {
  index: number;
  date: Date;
  iso: string;
  dateLabel: string;
  weekday: string;
  isToday: boolean;
  isSelected: boolean;
  allDayEvents: EventModel[];
  timedEvents: PositionedEvent[];
}

interface PositionedEvent {
  event: EventModel;
  top: number;
  height: number;
  column: number;
  columns: number;
}

const props = defineProps<{
  startDate: string;
  selectedDate: string;
  events: EventModel[];
  workingHours: { start: string; end: string };
}>();

const emit = defineEmits<{
  (event: 'select:day', value: string): void;
  (event: 'open:event', value: EventModel): void;
  (event: 'open:create', value: { day: string; start?: string; allDay?: boolean }): void;
  (event: 'jump:today'): void;
}>();

const today = startOfToday();

const rangeStart = computed(() => startOfDay(parseISO(props.startDate)));
const selectedDate = computed(() => startOfDay(parseISO(props.selectedDate)));

const days = computed<CalendarDay[]>(() => {
  const start = rangeStart.value;
  const selected = selectedDate.value;
  return getTwoWeekRange(start).map((date, index) => {
    const iso = date.toISOString();
    const dayEvents = props.events.filter((event) => isEventOnDay(event, date));
    const allDayEvents = dayEvents.filter((event) => event.allDay);
    const timedEvents = layoutTimedEvents(dayEvents.filter((event) => !event.allDay), date);

    return {
      index,
      date,
      iso,
      dateLabel: format(date, 'MMM d'),
      weekday: format(date, 'EEE'),
      isToday: isSameDay(date, today),
      isSelected: isSameDay(date, selected),
      allDayEvents,
      timedEvents
    };
  });
});

const subtitle = computed(() => {
  const first = days.value[0];
  const last = days.value[days.value.length - 1];
  if (!first || !last) return '';
  return `${format(first.date, 'MMM d')} – ${format(last.date, 'MMM d')}`;
});

const headerLabel = computed(() => `Two-week horizon (${days.value.length} days)`);

const timeSlots = computed(() => {
  const workingMinutes = getWorkingMinutes(rangeStart.value, props.workingHours);
  const slotCount = Math.max(4, Math.floor(workingMinutes / 60));
  return Array.from({ length: slotCount + 1 }, (_, index) => {
    const minutes = (workingMinutes / slotCount) * index;
    const labelTime = addMinutes(getWorkingWindow(rangeStart.value, props.workingHours).start, minutes);
    return {
      key: index,
      position: (minutes / workingMinutes) * 100,
      label: format(labelTime, 'h a')
    };
  });
});

function layoutTimedEvents(events: EventModel[], day: Date): PositionedEvent[] {
  const sorted = [...events].sort((a, b) => parseISO(a.start).getTime() - parseISO(b.start).getTime());
  const columns: EventModel[][] = [];
  const positioned: PositionedEvent[] = [];

  sorted.forEach((event) => {
    let columnIndex = columns.findIndex((column) => !column.some((existing) => overlaps(existing, event)));
    if (columnIndex === -1) {
      columnIndex = columns.length;
      columns.push([]);
    }
    columns[columnIndex].push(event);
    const meta = getEventPosition(event, day, props.workingHours);
    positioned.push({
      event,
      top: meta.top,
      height: meta.height,
      column: columnIndex,
      columns: columns.length
    });
  });

  return positioned;
}

function overlaps(a: EventModel, b: EventModel) {
  const startA = parseISO(a.start).getTime();
  const endA = parseISO(a.end).getTime();
  const startB = parseISO(b.start).getTime();
  const endB = parseISO(b.end).getTime();
  return startA < endB && startB < endA;
}

function eventStyle(item: PositionedEvent) {
  const width = 100 / item.columns;
  return {
    top: `${item.top}%`,
    height: `${item.height}%`,
    width: `${width}%`,
    left: `${item.column * width}%`
  };
}

function onTimeGridClick(day: CalendarDay, event: MouseEvent) {
  const container = event.currentTarget as HTMLElement;
  const rect = container.getBoundingClientRect();
  const offsetY = event.clientY - rect.top;
  const fraction = offsetY / rect.height;
  const { start, end } = getWorkingWindow(day.date, props.workingHours);
  const totalMinutes = differenceInMinutes(end, start);
  const minutes = Math.round(totalMinutes * fraction);
  const startTime = addMinutes(start, minutes).toISOString();
  emit('open:create', { day: day.iso, start: startTime });
}
</script>
