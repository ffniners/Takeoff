<template>
  <div class="flex flex-col items-center justify-center gap-3 rounded-3xl border border-dashed border-white/10 bg-white/5/5 px-8 py-16 text-center text-slate-400">
    <slot name="icon">
      <svg class="h-10 w-10 text-slate-500" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z" />
        <path stroke-linecap="round" stroke-linejoin="round" d="M8 13h4m-4 4h8" />
      </svg>
    </slot>
    <div class="space-y-2">
      <h3 class="text-lg font-semibold text-white">
        <slot name="title">Nothing to show yet</slot>
      </h3>
      <p class="max-w-sm text-sm text-slate-400">
        <slot name="description">Adjust your filters or add a new event to get started.</slot>
      </p>
    </div>
    <slot name="action" />
  </div>
</template>
