<template>
  <teleport to="body">
    <transition name="fade">
      <div
        v-if="open"
        class="fixed inset-0 z-40 flex items-stretch justify-end bg-slate-950/70 backdrop-blur"
        role="dialog"
        aria-modal="true"
      >
        <div class="flex h-full w-full max-w-xl flex-col overflow-y-auto border-l border-white/10 bg-slate-900/95 p-6 shadow-2xl">
          <header class="flex items-center justify-between border-b border-white/5 pb-4">
            <div>
              <p class="text-xs uppercase tracking-wide text-slate-400">
                {{ isEditing ? 'Edit event' : 'New event' }}
              </p>
              <h2 class="text-xl font-semibold text-white">{{ form.title || 'Untitled event' }}</h2>
            </div>
            <button
              type="button"
              class="rounded-full border border-white/10 p-2 text-slate-400 hover:text-white"
              @click="close"
            >
              <span class="sr-only">Close</span>
              <svg class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6m0 12L6 6" />
              </svg>
            </button>
          </header>

          <form class="mt-6 space-y-6" @submit.prevent="onSubmit">
            <div class="space-y-3">
              <label class="block text-sm font-medium text-slate-200">
                Title
                <input
                  v-model="form.title"
                  type="text"
                  class="mt-1 w-full rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2 text-sm text-white focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-400/40"
                  required
                />
              </label>
              <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <label class="flex items-center gap-2 text-sm text-slate-200">
                  <input v-model="form.allDay" type="checkbox" class="rounded border-white/10 bg-slate-900 text-indigo-500" />
                  All-day
                </label>
                <label class="block text-sm font-medium text-slate-200">
                  Priority
                  <select
                    v-model="form.priority"
                    class="mt-1 w-full rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2 text-sm text-white focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-400/40"
                  >
                    <option value="P1">P1</option>
                    <option value="P2">P2</option>
                    <option value="P3">P3</option>
                  </select>
                </label>
              </div>
              <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <label class="block text-sm font-medium text-slate-200">
                  Starts
                  <input
                    v-if="!form.allDay"
                    v-model="form.start"
                    type="datetime-local"
                    class="mt-1 w-full rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2 text-sm text-white focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-400/40"
                  />
                  <input
                    v-else
                    v-model="startDateOnly"
                    type="date"
                    class="mt-1 w-full rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2 text-sm text-white focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-400/40"
                  />
                </label>
                <label class="block text-sm font-medium text-slate-200">
                  Ends
                  <input
                    v-if="!form.allDay"
                    v-model="form.end"
                    type="datetime-local"
                    class="mt-1 w-full rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2 text-sm text-white focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-400/40"
                  />
                  <input
                    v-else
                    v-model="endDateOnly"
                    type="date"
                    class="mt-1 w-full rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2 text-sm text-white focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-400/40"
                  />
                </label>
              </div>
              <label class="block text-sm font-medium text-slate-200">
                Deadline
                <input
                  v-model="form.deadline"
                  type="datetime-local"
                  class="mt-1 w-full rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2 text-sm text-white focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-400/40"
                />
              </label>
              <p v-if="errors.time" class="text-sm text-rose-400">{{ errors.time }}</p>
            </div>

            <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <label class="block text-sm font-medium text-slate-200">
                Status
                <select
                  v-model="form.status"
                  class="mt-1 w-full rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2 text-sm text-white focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-400/40"
                >
                  <option value="proposed">Proposed</option>
                  <option value="scheduled">Scheduled</option>
                  <option value="in_progress">In progress</option>
                  <option value="done">Done</option>
                  <option value="blocked">Blocked</option>
                  <option value="canceled">Canceled</option>
                </select>
              </label>
              <label class="block text-sm font-medium text-slate-200">
                Project
                <input
                  v-model="form.project"
                  type="text"
                  placeholder="Project name"
                  class="mt-1 w-full rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2 text-sm text-white focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-400/40"
                />
              </label>
            </div>

            <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <label class="block text-sm font-medium text-slate-200">
                Owner
                <input
                  v-model="form.owner"
                  type="text"
                  placeholder="Primary owner"
                  class="mt-1 w-full rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2 text-sm text-white focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-400/40"
                />
              </label>
              <label class="block text-sm font-medium text-slate-200">
                Assignees
                <input
                  v-model="assigneesInput"
                  type="text"
                  placeholder="Comma separated"
                  class="mt-1 w-full rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2 text-sm text-white focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-400/40"
                />
              </label>
            </div>

            <div class="space-y-3">
              <label class="block text-sm font-medium text-slate-200">
                Description
                <textarea
                  v-model="form.description"
                  rows="3"
                  class="mt-1 w-full rounded-2xl border border-white/10 bg-slate-950/60 px-3 py-2 text-sm text-white focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-400/40"
                />
              </label>
              <label class="block text-sm font-medium text-slate-200">
                Instructions (for future AI)
                <textarea
                  v-model="form.instructions"
                  rows="2"
                  class="mt-1 w-full rounded-2xl border border-white/10 bg-slate-950/60 px-3 py-2 text-sm text-white focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-400/40"
                />
              </label>
            </div>

            <section class="space-y-3">
              <header class="flex items-center justify-between text-sm text-slate-300">
                <h3 class="font-semibold text-white">Reminders</h3>
                <div class="flex items-center gap-2 text-xs">
                  <button
                    v-for="preset in reminderPresets"
                    :key="preset.label"
                    type="button"
                    class="rounded-full border border-white/10 px-2 py-1 text-slate-300 hover:border-indigo-400/60 hover:text-indigo-200"
                    @click="addReminder(preset.offsetMinutes, preset.label)"
                  >
                    {{ preset.label }}
                  </button>
                </div>
              </header>
              <div class="flex flex-wrap gap-2">
                <span
                  v-for="reminder in form.reminders"
                  :key="reminder.id"
                  class="inline-flex items-center gap-2 rounded-full bg-indigo-500/20 px-3 py-1 text-xs text-indigo-100"
                >
                  {{ reminder.label }}
                  <button type="button" class="text-indigo-200 hover:text-white" @click="removeReminder(reminder.id)">
                    ×
                  </button>
                </span>
                <div class="flex items-center gap-2">
                  <input
                    v-model.number="customReminder"
                    type="number"
                    placeholder="Minutes"
                    class="w-24 rounded-lg border border-white/10 bg-slate-950/60 px-2 py-1 text-sm text-white focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-400/40"
                  />
                  <button
                    type="button"
                    class="rounded-full border border-white/10 px-3 py-1 text-xs text-slate-300 hover:border-indigo-400/60 hover:text-indigo-200"
                    @click="addCustomReminder"
                  >
                    Add
                  </button>
                </div>
              </div>
            </section>

            <section class="space-y-3">
              <label class="block text-sm font-medium text-slate-200">
                Dependencies
                <select
                  v-model="form.dependencies"
                  multiple
                  class="mt-1 w-full rounded-2xl border border-white/10 bg-slate-950/60 px-3 py-2 text-sm text-white focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-400/40"
                >
                  <option
                    v-for="option in dependencyOptions"
                    :key="option.id"
                    :value="option.id"
                  >
                    {{ option.title }}
                  </option>
                </select>
              </label>
            </section>

            <section class="space-y-3">
              <label class="block text-sm font-medium text-slate-200">
                Transcript refs
                <input
                  v-model="transcriptInput"
                  type="text"
                  placeholder="Comma separated IDs"
                  class="mt-1 w-full rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2 text-sm text-white focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-400/40"
                />
              </label>
              <label class="block text-sm font-medium text-slate-200">
                External links (comma separated URLs)
                <input
                  v-model="filesInput"
                  type="text"
                  placeholder="https://example.com"
                  class="mt-1 w-full rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2 text-sm text-white focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-400/40"
                />
              </label>
            </section>

            <footer class="flex flex-wrap items-center justify-between gap-3 border-t border-white/5 pt-4">
              <div class="flex items-center gap-3 text-xs text-slate-400">
                <span>Created {{ relativeCreated }}</span>
                <span>Updated {{ relativeUpdated }}</span>
              </div>
              <div class="flex items-center gap-2">
                <button
                  v-if="isEditing"
                  type="button"
                  class="rounded-full border border-rose-500/50 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-rose-300 hover:bg-rose-500/10"
                  @click="emit('delete', form.id as string)"
                >
                  Delete
                </button>
                <button
                  v-if="isEditing"
                  type="button"
                  class="rounded-full border border-white/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-slate-200 hover:border-indigo-400/60"
                  @click="emit('duplicate', form.id as string)"
                >
                  Duplicate
                </button>
                <button
                  type="submit"
                  class="rounded-full bg-indigo-500 px-4 py-2 text-sm font-semibold uppercase tracking-wide text-white shadow hover:bg-indigo-400"
                >
                  {{ isEditing ? 'Save' : 'Create' }}
                </button>
              </div>
            </footer>
          </form>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue';
import { addMinutes, format, parseISO } from 'date-fns';

import type { EventInput } from '@/stores/events';
import type { EventModel } from '@/types';
import { PRESET_REMINDERS, formatDateInput, formatDateOnlyInput } from '@/utils/date';
import { useSettingsStore } from '@/stores/settings';

const props = defineProps<{
  open: boolean;
  event: EventModel | null;
  day: string | null;
  startHint?: string | null;
  events: EventModel[];
}>();

const emit = defineEmits<{
  (event: 'close'): void;
  (event: 'save', value: EventInput): void;
  (event: 'delete', id: string): void;
  (event: 'duplicate', id: string): void;
}>();

const settings = useSettingsStore();

const form = reactive<EventInput>({
  id: undefined,
  title: '',
  start: '',
  end: '',
  allDay: false,
  status: 'proposed',
  priority: 'P2',
  deadline: undefined,
  reminders: [],
  owner: '',
  assignees: [],
  project: '',
  dependencies: [],
  description: '',
  instructions: '',
  transcriptRefs: [],
  aiNotes: undefined,
  links: undefined,
});

const errors = reactive<{ time?: string }>({});
const assigneesInput = ref('');
const transcriptInput = ref('');
const filesInput = ref('');
const customReminder = ref<number | null>(null);
const reminderPresets = PRESET_REMINDERS;
const createdAt = ref<string | null>(null);
const updatedAt = ref<string | null>(null);

const startDateOnly = computed({
  get: () => (form.start ? formatDateOnlyInput(form.start) : ''),
  set: (value: string) => {
    if (!value) return;
    form.start = `${value}T00:00`;
    form.end = `${value}T23:59`;
  },
});

const endDateOnly = computed({
  get: () => (form.end ? formatDateOnlyInput(form.end) : ''),
  set: (value: string) => {
    if (!value) return;
    form.end = `${value}T23:59`;
  },
});

const isEditing = computed(() => Boolean(form.id));

const relativeCreated = computed(() =>
  createdAt.value ? format(parseISO(createdAt.value), 'MMM d, yyyy HH:mm') : '—',
);
const relativeUpdated = computed(() =>
  updatedAt.value ? format(parseISO(updatedAt.value), 'MMM d, yyyy HH:mm') : '—',
);

const dependencyOptions = computed(() => props.events.filter((event) => event.id !== form.id));

watch(
  () => props.open,
  (open) => {
    if (open) {
      initializeForm();
    }
  },
);

watch(
  () => props.event,
  (next) => {
    if (props.open) {
      initializeForm(next ?? undefined);
    }
  },
);

function initializeForm(source?: EventModel) {
  errors.time = undefined;
  if (source) {
    Object.assign(form, {
      ...source,
      start: formatDateInput(source.start),
      end: formatDateInput(source.end),
      deadline: source.deadline ? formatDateInput(source.deadline) : undefined,
      reminders: source.reminders.map((reminder) => ({ ...reminder })),
      transcriptRefs: [...source.transcriptRefs],
      links: source.links ? { ...source.links, files: source.links.files ? [...source.links.files] : [] } : undefined,
    });
    assigneesInput.value = source.assignees.join(', ');
    transcriptInput.value = source.transcriptRefs.join(', ');
    filesInput.value = source.links?.files?.join(', ') ?? '';
    createdAt.value = source.createdAt;
    updatedAt.value = source.updatedAt;
  } else {
    const baseStart = props.startHint ?? createStartForDay();
    const start = formatDateInput(baseStart);
    const end = formatDateInput(addMinutes(parseISO(baseStart), settings.defaultSlotMinutes).toISOString());
    Object.assign(form, {
      id: undefined,
      title: '',
      start,
      end,
      allDay: false,
      status: 'proposed',
      priority: 'P2',
      deadline: undefined,
      reminders: [],
      owner: settings.deepWorkInMorning ? 'Avery' : '',
      assignees: [],
      project: '',
      dependencies: [],
      description: '',
      instructions: '',
      transcriptRefs: [],
      aiNotes: undefined,
      links: undefined,
    });
    assigneesInput.value = '';
    transcriptInput.value = '';
    filesInput.value = '';
    createdAt.value = null;
    updatedAt.value = null;
  }
}

function createStartForDay() {
  const targetDay = props.day ? parseISO(props.day) : new Date();
  const iso = new Date(targetDay.getTime());
  iso.setHours(Number(settings.workingHours.start.split(':')[0]));
  iso.setMinutes(Number(settings.workingHours.start.split(':')[1]));
  return iso.toISOString();
}

function syncDerivedFields() {
  form.assignees = assigneesInput.value
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean);
  form.transcriptRefs = transcriptInput.value
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean);
  if (!form.links) {
    form.links = {};
  }
  form.links.files = filesInput.value
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean);
}

function validate() {
  errors.time = undefined;
  if (!form.title) {
    return false;
  }
  if (!form.allDay && form.start && form.end) {
    const start = parseISO(form.start);
    const end = parseISO(form.end);
    if (end <= start) {
      errors.time = 'End time must be after start time.';
      return false;
    }
  }
  if (form.allDay && startDateOnly.value && endDateOnly.value && endDateOnly.value < startDateOnly.value) {
    errors.time = 'End date must be after start date.';
    return false;
  }
  syncDerivedFields();
  return true;
}

function onSubmit() {
  if (!validate()) return;
  const payload: EventInput = {
    ...form,
    start: toIso(form.start),
    end: toIso(form.end),
    deadline: form.deadline ? toIso(form.deadline) : undefined,
  };
  emit('save', payload);
}

function close() {
  emit('close');
}

function addReminder(offsetMinutes: number, label: string) {
  form.reminders.push({ id: generateId(), offsetMinutes, label });
}

function addCustomReminder() {
  if (customReminder.value == null) return;
  const minutes = Number(customReminder.value);
  if (Number.isNaN(minutes) || minutes === 0) return;
  const label = minutes > 0 ? `+${minutes}m` : `${minutes}m`;
  addReminder(minutes, label);
  customReminder.value = null;
}

function removeReminder(id: string) {
  form.reminders = form.reminders.filter((reminder) => reminder.id !== id);
}

function toIso(value: string | undefined) {
  if (!value) return new Date().toISOString();
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString();
}

function generateId() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `rem_${Math.random().toString(36).slice(2, 9)}`;
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
