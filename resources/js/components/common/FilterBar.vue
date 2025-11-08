<template>
  <section
    class="flex flex-wrap items-center gap-3 rounded-2xl border border-white/5 bg-white/5/10 px-4 py-3 text-sm shadow-lg shadow-black/20"
    role="search"
    aria-label="Event filters"
  >
    <div class="relative flex-1 min-w-[16rem]">
      <span class="pointer-events-none absolute inset-y-0 left-3 flex items-center text-slate-400">
        <svg class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-4.35-4.35m1.35-4.65a6 6 0 1 1-12 0 6 6 0 0 1 12 0Z" />
        </svg>
      </span>
      <input
        ref="searchRef"
        :value="search"
        @input="onSearch"
        type="search"
        name="search"
        placeholder="Search by title, owner, or assignee (/ to focus)"
        class="w-full rounded-xl border border-white/5 bg-slate-900/80 py-2 pl-9 pr-3 text-sm text-white placeholder:text-slate-500 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-400/40"
      />
    </div>
    <div class="flex items-center gap-3">
      <label class="flex items-center gap-2 text-slate-300">
        <span>Status</span>
        <select
          :value="status"
          @change="(event) => emit('update:status', (event.target as HTMLSelectElement).value as FilterStatus)"
          class="rounded-xl border border-white/5 bg-slate-900/80 px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-400/40"
        >
          <option value="all">All</option>
          <option v-for="option in statuses" :key="option" :value="option">
            {{ formatStatus(option) }}
          </option>
        </select>
      </label>
      <label class="flex items-center gap-2 text-slate-300">
        <span>Priority</span>
        <select
          :value="priority"
          @change="(event) => emit('update:priority', (event.target as HTMLSelectElement).value as FilterPriority)"
          class="rounded-xl border border-white/5 bg-slate-900/80 px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-400/40"
        >
          <option value="all">All</option>
          <option v-for="option in priorities" :key="option" :value="option">
            {{ option }}
          </option>
        </select>
      </label>
      <label class="flex items-center gap-2 text-slate-300">
        <span>Project</span>
        <select
          :value="project"
          @change="(event) => emit('update:project', (event.target as HTMLSelectElement).value)"
          class="min-w-[8rem] rounded-xl border border-white/5 bg-slate-900/80 px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-400/40"
        >
          <option value="all">All</option>
          <option v-for="option in projects" :key="option" :value="option">
            {{ option }}
          </option>
        </select>
      </label>
    </div>
    <button
      type="button"
      class="ml-auto inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-1.5 text-xs uppercase tracking-wide text-slate-300 transition hover:bg-white/10"
      @click="clearFilters"
    >
      <span>Reset</span>
    </button>
  </section>
</template>

<script setup lang="ts">
import { ref, toRefs } from 'vue';

import type { EventStatus, Priority } from '@/types';

type FilterStatus = EventStatus | 'all';
type FilterPriority = Priority | 'all';

const props = defineProps<{
  search: string;
  status: FilterStatus;
  priority: FilterPriority;
  project: string | 'all';
  projects: string[];
}>();

const emit = defineEmits<{
  (event: 'update:search', value: string): void;
  (event: 'update:status', value: FilterStatus): void;
  (event: 'update:priority', value: FilterPriority): void;
  (event: 'update:project', value: string | 'all'): void;
}>();

const searchRef = ref<HTMLInputElement | null>(null);

const statuses: EventStatus[] = ['proposed', 'scheduled', 'in_progress', 'done', 'blocked', 'canceled'];
const priorities: Priority[] = ['P1', 'P2', 'P3'];

function onSearch(event: Event) {
  emit('update:search', (event.target as HTMLInputElement).value);
}

function clearFilters() {
  emit('update:search', '');
  emit('update:status', 'all');
  emit('update:priority', 'all');
  emit('update:project', 'all');
  searchRef.value?.focus();
}

function formatStatus(value: EventStatus) {
  return value.replace(/_/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
}

defineExpose({
  focusSearch: () => searchRef.value?.focus(),
});

const { search, status, priority, project, projects } = toRefs(props);
</script>
