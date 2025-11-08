import { addDays, addMinutes, compareAsc, formatISO, isSameDay, parseISO, set, startOfDay, startOfToday } from 'date-fns';
import { defineStore } from 'pinia';

import type { ActionPlanDiff, EventModel, EventStatus, Priority, Reminder } from '@/types';

const STORAGE_KEY = 'takeoff.events.v1';
const STORAGE_VERSION = 1;

export type EventInput = Omit<EventModel, 'id' | 'createdAt' | 'updatedAt'> & {
  id?: string;
};

interface PersistedEvents {
  version: number;
  events: EventModel[];
}

interface EventsState {
  events: EventModel[];
  selectedEventId: string | null;
}

const seedOwners = ['Avery', 'Jordan', 'Maya', 'Dev'];
const seedProjects = ['Orion', 'Liftoff', 'Habitat'];

function clone<T>(value: T): T {
  if (typeof structuredClone === 'function') {
    return structuredClone(value);
  }
  return JSON.parse(JSON.stringify(value));
}

function generateId() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `evt_${Math.random().toString(36).slice(2, 10)}`;
}

function nowIso() {
  return new Date().toISOString();
}

function sortEvents(events: EventModel[]) {
  return [...events].sort((a, b) => compareAsc(parseISO(a.start), parseISO(b.start)));
}

function loadEvents(): EventModel[] {
  if (typeof window === 'undefined') {
    return createSeedEvents();
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return createSeedEvents();
    }

    const parsed = JSON.parse(raw) as PersistedEvents;
    if (parsed.version !== STORAGE_VERSION || !Array.isArray(parsed.events)) {
      return createSeedEvents();
    }

    return sortEvents(parsed.events);
  } catch (error) {
    console.warn('Failed to parse events from localStorage', error);
    return createSeedEvents();
  }
}

function createSeedEvents(): EventModel[] {
  const today = startOfToday();
  const seeds: EventModel[] = [];

  const createEvent = (overrides: Partial<EventModel>): EventModel => {
    const base: EventModel = {
      id: generateId(),
      title: 'Untitled',
      start: formatISO(today),
      end: formatISO(addMinutes(today, 60)),
      allDay: false,
      status: 'proposed',
      priority: 'P2',
      reminders: [],
      owner: seedOwners[0],
      assignees: [],
      project: seedProjects[0],
      dependencies: [],
      description: '',
      instructions: '',
      transcriptRefs: [],
      createdAt: nowIso(),
      updatedAt: nowIso(),
    };
    return { ...base, ...overrides };
  };

  const dayOne = addDays(today, 1);
  const dayThree = addDays(today, 3);
  const daySeven = addDays(today, 7);

  seeds.push(
    createEvent({
      title: 'Weekly Launch Sync',
      id: 'evt-launch-sync',
      start: formatISO(set(dayOne, { hours: 9, minutes: 0 })),
      end: formatISO(set(dayOne, { hours: 10, minutes: 0 })),
      status: 'scheduled',
      priority: 'P1',
      owner: 'Avery',
      assignees: ['Avery', 'Jordan', 'Maya'],
      project: 'Liftoff',
      reminders: [
        { id: generateId(), offsetMinutes: -120, label: '-2h' },
        { id: generateId(), offsetMinutes: -15, label: '-15m' },
      ],
      description: 'Critical go/no-go review for this sprint.',
      instructions: 'Prep launch readiness checklist. AI: summarise blockers.',
      deadline: formatISO(set(dayOne, { hours: 17, minutes: 0 })),
      dependencies: [],
      transcriptRefs: ['launch-sync-2024-01'],
      createdAt: nowIso(),
      updatedAt: nowIso(),
    }),
  );

  seeds.push(
    createEvent({
      title: 'Prototype Deep Work',
      id: 'evt-prototype-focus',
      start: formatISO(set(dayThree, { hours: 8, minutes: 30 })),
      end: formatISO(set(dayThree, { hours: 11, minutes: 30 })),
      status: 'in_progress',
      priority: 'P2',
      owner: 'Maya',
      assignees: ['Maya'],
      project: 'Orion',
      reminders: [{ id: generateId(), offsetMinutes: -60, label: '-1h' }],
      description: 'Heads-down block to integrate telemetry feed.',
      instructions: 'Future AI: flag risks if data drift >2%.',
      dependencies: ['evt-launch-sync'],
      transcriptRefs: [],
      createdAt: nowIso(),
      updatedAt: nowIso(),
    }),
  );

  seeds.push(
    createEvent({
      title: 'Stakeholder Demo',
      id: 'evt-demo',
      start: formatISO(set(daySeven, { hours: 13, minutes: 0 })),
      end: formatISO(set(daySeven, { hours: 14, minutes: 0 })),
      status: 'proposed',
      priority: 'P1',
      owner: 'Jordan',
      assignees: ['Jordan', 'Dev'],
      project: 'Habitat',
      reminders: [
        { id: generateId(), offsetMinutes: -24 * 60, label: '-24h' },
        { id: generateId(), offsetMinutes: -30, label: '-30m' },
      ],
      description: 'Demo of habitat planning dashboard.',
      instructions: 'Draft follow-up email template. Future AI can summarize Q&A.',
      deadline: formatISO(set(daySeven, { hours: 18, minutes: 0 })),
      dependencies: ['evt-launch-sync'],
      transcriptRefs: ['stakeholder-notes'],
      createdAt: nowIso(),
      updatedAt: nowIso(),
    }),
  );

  seeds.push(
    createEvent({
      title: 'Team Offsite',
      id: 'evt-offsite',
      start: formatISO(addDays(startOfDay(today), 5)),
      end: formatISO(addDays(startOfDay(today), 6)),
      allDay: true,
      status: 'scheduled',
      priority: 'P3',
      owner: 'People Ops',
      assignees: ['Team'],
      project: 'Team Health',
      reminders: [{ id: generateId(), offsetMinutes: -24 * 60, label: '-24h' }],
      description: 'Offsite planning day.',
      instructions: 'AI: gather fun retro prompts later.',
      dependencies: [],
      transcriptRefs: [],
      createdAt: nowIso(),
      updatedAt: nowIso(),
    }),
  );

  return sortEvents(seeds);
}

function persist(events: EventModel[]) {
  if (typeof window === 'undefined') {
    return;
  }
  const payload: PersistedEvents = { version: STORAGE_VERSION, events };
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
}

export const useEventsStore = defineStore('events', {
  state: (): EventsState => ({
    events: loadEvents(),
    selectedEventId: null,
  }),
  getters: {
    byId: (state) => (id: string) => state.events.find((event) => event.id === id) || null,
    byDay: (state) => (isoDay: string) => {
      const day = startOfDay(parseISO(isoDay));
      return sortEvents(
        state.events.filter((event) =>
          isSameDay(parseISO(event.start), day) || isSameDay(parseISO(event.end), day),
        ),
      );
    },
    byStatus: (state) => (status: EventStatus) =>
      state.events.filter((event) => event.status === status),
    byProject: (state) => (project: string) =>
      state.events.filter((event) => event.project === project),
    projects: (state) => Array.from(new Set(state.events.map((event) => event.project).filter(Boolean))) as string[],
    conflicts: (state) => {
      const conflicts: Record<string, string[]> = {};
      const sameDay = [...state.events].filter((event) => !event.allDay);
      for (let i = 0; i < sameDay.length; i += 1) {
        for (let j = i + 1; j < sameDay.length; j += 1) {
          const a = sameDay[i];
          const b = sameDay[j];
          if (isSameDay(parseISO(a.start), parseISO(b.start))) {
            const overlaps = parseISO(a.start) < parseISO(b.end) && parseISO(b.start) < parseISO(a.end);
            if (overlaps) {
              conflicts[a.id] = [...(conflicts[a.id] || []), b.id];
              conflicts[b.id] = [...(conflicts[b.id] || []), a.id];
            }
          }
        }
      }
      return conflicts;
    },
  },
  actions: {
    persist() {
      persist(this.events);
    },
    setSelectedEvent(id: string | null) {
      this.selectedEventId = id;
    },
    seedIfEmpty() {
      if (this.events.length === 0) {
        this.events = createSeedEvents();
        this.persist();
      }
    },
    create(payload: EventInput) {
      const timestamp = nowIso();
      const event: EventModel = {
        ...payload,
        id: payload.id ?? generateId(),
        createdAt: timestamp,
        updatedAt: timestamp,
      };
      this.events = sortEvents([...this.events, event]);
      this.persist();
      this.selectedEventId = event.id;
    },
    update(id: string, payload: Partial<EventInput>) {
      this.events = sortEvents(
        this.events.map((event) =>
          event.id === id
            ? {
                ...event,
                ...payload,
                updatedAt: nowIso(),
              }
            : event,
        ),
      );
      this.persist();
    },
    remove(id: string) {
      this.events = this.events.filter((event) => event.id !== id);
      this.persist();
      if (this.selectedEventId === id) {
        this.selectedEventId = null;
      }
    },
    duplicate(id: string) {
      const original = this.byId(id);
      if (!original) {
        return;
      }
      const start = parseISO(original.start);
      const duplicateStart = addDays(start, 1);
      const durationMinutes = Math.max(
        30,
        Math.round((parseISO(original.end).getTime() - start.getTime()) / 60000),
      );
      const duplicateEnd = addMinutes(duplicateStart, durationMinutes);

      this.create({
        ...clone(original),
        id: undefined,
        start: formatISO(duplicateStart),
        end: formatISO(duplicateEnd),
        status: 'proposed',
      });
    },
    setStatus(id: string, status: EventStatus) {
      this.update(id, { status });
    },
    setPriority(id: string, priority: Priority) {
      this.update(id, { priority });
    },
    moveToDay(id: string, dayIso: string) {
      const event = this.byId(id);
      if (!event) {
        return;
      }
      const start = parseISO(event.start);
      const end = parseISO(event.end);
      const targetDay = startOfDay(parseISO(dayIso));
      const newStart = set(targetDay, { hours: start.getHours(), minutes: start.getMinutes() });
      const newEnd = set(targetDay, { hours: end.getHours(), minutes: end.getMinutes() });

      this.update(id, {
        start: formatISO(newStart),
        end: formatISO(newEnd),
      });
    },
    addReminder(id: string, reminder: Reminder) {
      this.events = this.events.map((event) =>
        event.id === id
          ? {
              ...event,
              reminders: [...event.reminders, { ...reminder, id: reminder.id || generateId() }],
              updatedAt: nowIso(),
            }
          : event,
      );
      this.persist();
    },
    removeReminder(id: string, reminderId: string) {
      this.events = this.events.map((event) =>
        event.id === id
          ? {
              ...event,
              reminders: event.reminders.filter((reminder) => reminder.id !== reminderId),
              updatedAt: nowIso(),
            }
          : event,
      );
      this.persist();
    },
    applyProposedPlan(diff: ActionPlanDiff) {
      console.info('applyProposedPlan stub invoked', diff);
      // TODO: integrate AI-assisted planning flow
    },
  },
});
