<template>
  <div class="flex h-screen flex-col bg-slate-950 text-slate-100">
    <header class="border-b border-white/5 bg-slate-900/80 px-6 py-4 backdrop-blur">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-semibold">Takeoff</h1>
          <p class="text-sm text-slate-400">Plan, review, and adjust your mission schedule.</p>
        </div>
        <nav class="flex items-center gap-2 text-sm">
          <RouterLink
            v-for="item in navItems"
            :key="item.to"
            :to="item.to"
            class="rounded-full px-4 py-2 font-medium transition"
            :class="[
              route.path === item.to
                ? 'bg-indigo-500 text-white shadow'
                : 'text-slate-300 hover:bg-white/5 hover:text-white'
            ]"
          >
            {{ item.label }}
          </RouterLink>
        </nav>
      </div>
    </header>
    <main class="flex-1 overflow-hidden px-6 py-6">
      <RouterView />
    </main>
  </div>
</template>

<script setup lang="ts">
import { RouterLink, RouterView, useRoute } from 'vue-router';

const route = useRoute();

const navItems = [
  { label: 'Calendar', to: '/' },
  { label: 'Inbox', to: '/inbox' },
  { label: 'Settings', to: '/settings' }
];
</script>
