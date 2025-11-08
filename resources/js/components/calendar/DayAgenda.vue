<template>
  <aside class="flex h-full flex-col gap-4 rounded-3xl border border-white/5 bg-slate-900/60 p-5 shadow-xl shadow-black/20">
    <header class="flex items-center justify-between">
      <div>
        <p class="text-xs uppercase tracking-wide text-slate-400">Agenda</p>
        <h2 class="text-lg font-semibold text-white">{{ dayLabel }}</h2>
      </div>
      <button
        type="button"
        class="inline-flex items-center gap-2 rounded-full bg-indigo-500 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-white shadow hover:bg-indigo-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300"
        @click="emit('create', day)"
      >
        <svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 5v14m7-7H5" />
        </svg>
        <span>Quick add</span>
      </button>
    </header>

    <div v-if="events.length === 0" class="flex flex-1 items-center justify-center">
      <EmptyState>
        <template #title>No events</template>
        <template #description>
          Plan focus time or drop tasks here. Press <kbd class="rounded bg-slate-700 px-1">N</kbd> to add fast.
        </template>
      </EmptyState>
    </div>

    <ul v-else class="flex flex-1 flex-col gap-3 overflow-y-auto pr-1">
      <li
        v-for="event in sortedEvents"
        :key="event.id"
        class="rounded-2xl border border-white/5 bg-slate-900/80 p-4 transition hover:border-indigo-400/50"
      >
        <div class="flex items-center justify-between text-xs uppercase tracking-wide text-slate-400">
          <span>{{ formatTime(event) }}</span>
          <span>{{ event.status.replace(/_/g, ' ') }}</span>
        </div>
        <p class="mt-1 text-base font-semibold text-white">{{ event.title }}</p>
        <p v-if="event.project" class="text-xs text-indigo-300">{{ event.project }}</p>
        <p v-if="event.description" class="mt-2 line-clamp-2 text-sm text-slate-300">{{ event.description }}</p>
        <div class="mt-3 flex flex-wrap gap-2 text-xs text-slate-400">
          <span class="inline-flex items-center gap-1 rounded-full bg-slate-800/70 px-2 py-1">
            <span class="h-2 w-2 rounded-full" :class="priorityDot[event.priority]"></span>
            {{ event.priority }}
          </span>
          <span v-if="event.owner" class="inline-flex items-center gap-1 rounded-full bg-slate-800/70 px-2 py-1">
            <svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 12a3 3 0 1 0-3-3 3 3 0 0 0 3 3Zm0 0c-3.314 0-6 2.239-6 5v1h12v-1c0-2.761-2.686-5-6-5Z" />
            </svg>
            {{ event.owner }}
          </span>
          <span v-if="event.assignees.length" class="inline-flex items-center gap-1 rounded-full bg-slate-800/70 px-2 py-1">
            {{ event.assignees.join(', ') }}
          </span>
        </div>
        <button
          type="button"
          class="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-indigo-300 hover:text-indigo-200"
          @click="emit('open', event)"
        >
          Open
          <svg class="h-3 w-3" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 5h10m0 0v10m0-10L5 19" />
          </svg>
        </button>
      </li>
    </ul>
  </aside>
</template>

<script setup lang="ts">
import { computed, toRefs } from 'vue';
import { format, parseISO } from 'date-fns';

import type { EventModel } from '@/types';
import EmptyState from '@/components/common/EmptyState.vue';

const props = defineProps<{
  day: string;
  events: EventModel[];
}>();

const emit = defineEmits<{
  (event: 'open', value: EventModel): void;
  (event: 'create', day: string): void;
}>();

const priorityDot = {
  P1: 'bg-red-400',
  P2: 'bg-amber-400',
  P3: 'bg-emerald-400',
} as const;

const sortedEvents = computed(() =>
  [...props.events].sort((a, b) => parseISO(a.start).getTime() - parseISO(b.start).getTime()),
);

const dayLabel = computed(() => format(parseISO(props.day), 'EEEE, MMM d'));

function formatTime(event: EventModel) {
  if (event.allDay) {
    return 'All day';
  }
  return `${format(parseISO(event.start), 'h:mm a')} – ${format(parseISO(event.end), 'h:mm a')}`;
}

const { day, events } = toRefs(props);
</script>
