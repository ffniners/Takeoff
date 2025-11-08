<template>
  <Head title="Approval queue" />
  <section class="flex flex-col gap-6">
    <ApprovalQueue
      :events="proposedEvents"
      @accept="(id) => eventsStore.setStatus(id, 'scheduled')"
      @reject="(id) => eventsStore.setStatus(id, 'canceled')"
      @edit="onEdit"
    />

    <ActionPlanDiff :diff="mockDiff" :events="eventsStore.events" />
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { Head } from '@inertiajs/vue3';

import ApprovalQueue from '@/components/approval/ApprovalQueue.vue';
import ActionPlanDiff from '@/components/approval/ActionPlanDiff.vue';
import AppShell from '@/components/common/AppShell.vue';
import { useEventsStore } from '@/stores/events';
import type { ActionPlanDiff as ActionPlanDiffType, EventModel } from '@/types';

defineOptions({ layout: AppShell });

const eventsStore = useEventsStore();

const proposedEvents = computed(() => eventsStore.byStatus('proposed'));

const mockDiff = computed<ActionPlanDiffType>(() => {
  const [first, second] = proposedEvents.value;
  const additions: EventModel[] = first
    ? [first]
    : [];
  return {
    added: additions,
    moved: second
      ? [
          {
            id: second.id,
            from: second.start,
            to: second.end,
          },
        ]
      : [],
    deleted: [],
    notes: 'Preview only — actual AI diff coming soon.',
  };
});

function onEdit(event: EventModel) {
  eventsStore.setStatus(event.id, 'in_progress');
}
</script>
