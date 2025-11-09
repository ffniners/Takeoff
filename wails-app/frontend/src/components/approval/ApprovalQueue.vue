<template>
  <section class="space-y-4">
    <header class="flex items-center justify-between">
      <div>
        <h2 class="text-xl font-semibold text-white">Approval queue</h2>
        <p class="text-sm text-slate-400">Review proposed sessions before they land on the schedule.</p>
      </div>
      <span class="rounded-full bg-slate-800/60 px-3 py-1 text-xs uppercase tracking-wide text-slate-300">
        {{ events.length }} pending
      </span>
    </header>
    <div v-if="events.length === 0">
      <EmptyState>
        <template #title>Queue is clear</template>
        <template #description>New proposed work will appear here once submitted for approval.</template>
      </EmptyState>
    </div>
    <ul v-else class="space-y-3">
      <li
        v-for="event in events"
        :key="event.id"
        class="rounded-3xl border border-white/5 bg-slate-900/60 p-5 shadow-lg shadow-black/20"
      >
        <div class="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 class="text-lg font-semibold text-white">{{ event.title }}</h3>
            <p class="text-sm text-slate-300">{{ formatRange(event.start, event.end) }}</p>
            <p v-if="event.project" class="text-xs uppercase tracking-wide text-indigo-300">{{ event.project }}</p>
          </div>
          <div class="flex items-center gap-2 text-xs uppercase tracking-wide">
            <span class="rounded-full bg-slate-800/70 px-3 py-1 text-slate-200">{{ event.priority }}</span>
            <span class="rounded-full bg-slate-800/70 px-3 py-1 text-slate-200">{{ event.owner }}</span>
          </div>
        </div>
        <p v-if="event.description" class="mt-3 text-sm text-slate-300">{{ event.description }}</p>
        <div class="mt-4 flex flex-wrap items-center gap-2 text-xs text-slate-400">
          <span v-if="event.reminders.length" class="rounded-full bg-slate-800/70 px-3 py-1">
            {{ event.reminders.length }} reminders
          </span>
          <span v-if="event.assignees.length" class="rounded-full bg-slate-800/70 px-3 py-1">
            {{ event.assignees.join(', ') }}
          </span>
        </div>
        <div class="mt-4 flex flex-wrap items-center gap-2">
          <button
            type="button"
            class="rounded-full border border-emerald-500/60 px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-emerald-200 hover:bg-emerald-500/10"
            @click="emit('accept', event.id)"
          >
            Accept
          </button>
          <button
            type="button"
            class="rounded-full border border-amber-500/60 px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-amber-200 hover:bg-amber-500/10"
            @click="emit('edit', event)"
          >
            Edit
          </button>
          <button
            type="button"
            class="rounded-full border border-rose-500/60 px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-rose-200 hover:bg-rose-500/10"
            @click="emit('reject', event.id)"
          >
            Reject
          </button>
        </div>
      </li>
    </ul>
  </section>
</template>

<script setup lang="ts">
import { format } from 'date-fns';

import EmptyState from '@/components/common/EmptyState.vue';
import type { EventModel } from '@/types';

defineProps<{ events: EventModel[] }>();

const emit = defineEmits<{
  (event: 'accept', id: string): void;
  (event: 'reject', id: string): void;
  (event: 'edit', value: EventModel): void;
}>();

function formatRange(start: string, end: string) {
  return `${format(new Date(start), 'EEE, MMM d h:mma')} → ${format(new Date(end), 'h:mma')}`;
}
</script>
