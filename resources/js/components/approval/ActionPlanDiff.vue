<template>
  <section class="rounded-3xl border border-white/5 bg-slate-900/60 p-5 text-sm shadow-lg shadow-black/30">
    <header class="mb-4 flex items-center justify-between">
      <h3 class="text-base font-semibold text-white">Action plan diff</h3>
      <span class="text-xs uppercase tracking-wide text-slate-400">Preview</span>
    </header>
    <div class="space-y-3">
      <div v-if="diff.added.length" class="space-y-2">
        <h4 class="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-emerald-300">
          <svg class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M5 12h14m-7-7v14" />
          </svg>
          Added
        </h4>
        <ul class="space-y-1 text-slate-200">
          <li v-for="event in diff.added" :key="event.id" class="rounded-xl bg-emerald-500/10 px-3 py-2">
            <div class="flex items-center justify-between">
              <span class="font-medium">{{ event.title }}</span>
              <span class="text-xs text-emerald-200">{{ formatRange(event.start, event.end) }}</span>
            </div>
            <p class="text-xs text-slate-300">{{ event.project || 'Unassigned project' }}</p>
          </li>
        </ul>
      </div>
      <div v-if="diff.moved.length" class="space-y-2">
        <h4 class="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-amber-300">
          <svg class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="m9 5 7 7-7 7" />
          </svg>
          Moved
        </h4>
        <ul class="space-y-1 text-slate-200">
          <li v-for="entry in diff.moved" :key="entry.id" class="rounded-xl bg-amber-500/10 px-3 py-2">
            <div class="flex items-center justify-between">
              <span class="font-medium">{{ lookupTitle(entry.id) }}</span>
              <span class="text-xs text-amber-200">{{ formatMove(entry.from, entry.to) }}</span>
            </div>
          </li>
        </ul>
      </div>
      <div v-if="diff.deleted.length" class="space-y-2">
        <h4 class="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-rose-300">
          <svg class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="m6 6 12 12M6 18 18 6" />
          </svg>
          Removed
        </h4>
        <ul class="space-y-1 text-slate-200">
          <li v-for="id in diff.deleted" :key="id" class="rounded-xl bg-rose-500/10 px-3 py-2">
            <span>{{ lookupTitle(id) }}</span>
          </li>
        </ul>
      </div>
      <p v-if="diff.notes" class="rounded-2xl bg-slate-800/60 px-3 py-2 text-xs text-slate-300">
        {{ diff.notes }}
      </p>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { format } from 'date-fns';

import type { ActionPlanDiff, EventModel } from '@/types';

const props = defineProps<{
  diff: ActionPlanDiff;
  events: EventModel[];
}>();

const eventsIndex = computed(() => new Map(props.events.map((event) => [event.id, event])));

function lookupTitle(id: string) {
  return eventsIndex.value.get(id)?.title ?? 'Unknown event';
}

function formatRange(start: string, end: string) {
  return `${format(new Date(start), 'MMM d, h:mma')} → ${format(new Date(end), 'h:mma')}`;
}

function formatMove(from: string, to: string) {
  return `${format(new Date(from), 'MMM d')} → ${format(new Date(to), 'MMM d')}`;
}
</script>
