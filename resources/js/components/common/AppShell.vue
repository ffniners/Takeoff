<template>
  <div class="min-h-screen bg-slate-950 text-slate-100">
    <header class="sticky top-0 z-30 border-b border-white/5 bg-slate-950/80 backdrop-blur">
      <div class="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-4">
        <div class="flex items-center gap-3">
          <span class="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-500/20 text-lg font-semibold text-indigo-300">
            2W
          </span>
          <div>
            <h1 class="text-lg font-semibold">Takeoff Scheduler</h1>
            <p class="text-sm text-slate-400">Two-week action planning</p>
          </div>
        </div>
        <nav class="flex items-center gap-2 text-sm font-medium">
          <Link
            v-for="item in navigation"
            :key="item.href"
            :href="item.href"
            class="rounded-full px-4 py-2 transition hover:bg-white/5"
            :class="[
              page === item.href
                ? 'bg-indigo-500/20 text-indigo-200'
                : 'text-slate-300 hover:text-white',
            ]"
          >
            {{ item.label }}
          </Link>
        </nav>
      </div>
    </header>
    <main class="mx-auto flex max-w-7xl flex-1 flex-col gap-6 px-6 py-6">
      <slot />
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { Link, usePage } from '@inertiajs/vue3';

const navigation = [
  { href: '/', label: 'Calendar' },
  { href: '/inbox', label: 'Approval Queue' },
  { href: '/settings', label: 'Settings' },
];

const inertiaPage = usePage();
const page = computed(() => inertiaPage.url);
</script>
