<template>
  <button
    type="button"
    class="group flex w-full flex-col gap-1 rounded-xl border px-3 py-2 text-left shadow transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
    :class="[
      isSelected
        ? 'border-indigo-300 bg-indigo-500/20 text-white ring-offset-slate-950'
        : 'border-white/10 bg-slate-900/80 text-slate-100 hover:border-indigo-400/60 hover:bg-slate-800/80',
    ]"
    @click.stop="emit('open', event)"
  >
    <div class="flex items-center justify-between text-xs uppercase tracking-wide">
      <span
        class="inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-semibold"
        :class="priorityClasses[event.priority]"
      >
        <span class="h-2 w-2 rounded-full" :class="priorityDot[event.priority]"></span>
        {{ event.priority }}
      </span>
      <span
        class="rounded-full px-2 py-0.5"
        :class="statusClasses[event.status] ?? statusClasses.default"
      >
        {{ statusLabel }}
      </span>
    </div>
    <div class="text-sm font-semibold leading-tight">
      {{ event.title }}
    </div>
    <p v-if="showTime" class="text-xs text-slate-300">
      {{ timeLabel }}
    </p>
    <p v-if="event.project" class="text-[11px] uppercase tracking-wide text-indigo-300/80">
      {{ event.project }}
    </p>
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue';

import type { EventModel } from '@/types';
import { formatTimeDisplay } from '@/utils/date';

const props = defineProps<{
  event: EventModel;
  isSelected?: boolean;
  showTime?: boolean;
}>();

const emit = defineEmits<{
  (event: 'open', value: EventModel): void;
}>();

const priorityClasses = {
  P1: 'bg-red-500/20 text-red-200 border border-red-500/40',
  P2: 'bg-amber-500/20 text-amber-200 border border-amber-500/40',
  P3: 'bg-emerald-500/20 text-emerald-200 border border-emerald-500/40',
} as const;

const priorityDot = {
  P1: 'bg-red-400',
  P2: 'bg-amber-400',
  P3: 'bg-emerald-400',
} as const;

const statusClasses: Record<string, string> = {
  proposed: 'bg-slate-700/60 text-slate-200',
  scheduled: 'bg-indigo-500/30 text-indigo-200',
  in_progress: 'bg-sky-500/30 text-sky-100',
  done: 'bg-emerald-500/30 text-emerald-100',
  blocked: 'bg-rose-500/30 text-rose-100',
  canceled: 'bg-slate-600/40 text-slate-300',
  default: 'bg-slate-700/40 text-slate-200',
};

const statusLabel = computed(() =>
  props.event.status.replace(/_/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase()),
);

const timeLabel = computed(() => {
  if (props.event.allDay) {
    return 'All day';
  }
  return `${formatTimeDisplay(props.event.start)} – ${formatTimeDisplay(props.event.end)}`;
});
const isSelected = computed(() => props.isSelected ?? false);
const showTime = computed(() => props.showTime ?? true);
</script>
