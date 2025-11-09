import { addMinutes, differenceInMinutes, formatISO, parseISO, set, startOfDay } from 'date-fns';
import { defineStore } from 'pinia';

import { DeleteEvent, GetEvents, SaveEvent, type EventPayload } from '@wailsjs/go/backend/App';

import type { EventModel, EventStatus } from '@/types';
import { useSettingsStore } from './settings';

export type EventInput = Omit<EventModel, 'createdAt' | 'updatedAt'> & { id?: string };

interface EventsState {
  events: EventModel[];
  loading: boolean;
  error: string | null;
}

function normalizeEvent(event: EventModel): EventModel {
  const deadline = event.deadline ?? undefined;
  const project = event.project ?? undefined;
  return {
    ...event,
    deadline: deadline ?? undefined,
    project: project ?? undefined,
    reminders: event.reminders ?? [],
    assignees: event.assignees ?? [],
    dependencies: event.dependencies ?? [],
    transcriptRefs: event.transcriptRefs ?? []
  };
}

function toPayload(input: EventInput): EventPayload {
  const payload: EventPayload = {
    ...input,
    id: input.id ?? '',
    start: ensureIso(input.start),
    end: ensureIso(input.end),
    deadline: input.deadline ? ensureIso(input.deadline) : undefined,
    reminders: input.reminders?.map((reminder) => ({ ...reminder })) ?? [],
    project: input.project && input.project.trim() ? input.project : null,
    aiNotes: input.aiNotes ?? null
  } as EventPayload;
  return payload;
}

function ensureIso(value: string): string {
  try {
    return parseISO(value).toISOString();
  } catch (error) {
    const fallback = new Date(value);
    return Number.isNaN(fallback.getTime()) ? new Date().toISOString() : fallback.toISOString();
  }
}

export const useEventsStore = defineStore('events', {
  state: (): EventsState => ({
    events: [],
    loading: false,
    error: null
  }),
  getters: {
    byId: (state) => (id: string) => state.events.find((event) => event.id === id) ?? null,
    eventsByDay: (state) => (dayIso: string) => {
      const day = startOfDay(parseISO(dayIso));
      return state.events.filter((event) => {
        const start = parseISO(event.start);
        return start.getFullYear() === day.getFullYear() && start.getMonth() === day.getMonth() && start.getDate() === day.getDate();
      });
    },
    eventsByStatus: (state) => (status: EventStatus) => state.events.filter((event) => event.status === status)
  },
  actions: {
    async load() {
      this.loading = true;
      this.error = null;
      try {
        const list = await GetEvents();
        this.events = list.map((event) => normalizeEvent(event)).sort((a, b) => parseISO(a.start).getTime() - parseISO(b.start).getTime());
      } catch (error) {
        console.error(error);
        this.error = error instanceof Error ? error.message : 'Failed to load events';
      } finally {
        this.loading = false;
      }
    },
    async save(input: EventInput) {
      try {
        const result = await SaveEvent(toPayload(input));
        this.upsert(normalizeEvent(result));
      } catch (error) {
        console.error(error);
        throw error;
      }
    },
    async remove(id: string) {
      await DeleteEvent(id);
      this.events = this.events.filter((event) => event.id !== id);
    },
    async duplicate(id: string) {
      const original = this.byId(id);
      if (!original) return;
      const settings = useSettingsStore();
      const duration = differenceInMinutes(parseISO(original.end), parseISO(original.start));
      const start = addMinutes(parseISO(original.end), settings.defaultSlotMin);
      const copy: EventInput = {
        ...original,
        id: undefined,
        title: `${original.title} (Copy)`,
        start: formatISO(start),
        end: formatISO(addMinutes(start, duration)),
        status: 'proposed'
      };
      await this.save(copy);
    },
    async setStatus(id: string, status: EventStatus) {
      const event = this.byId(id);
      if (!event) return;
      await this.save({ ...event, status });
    },
    async moveToDay(id: string, dayIso: string) {
      const event = this.byId(id);
      if (!event) return;
      const day = parseISO(dayIso);
      const startDate = parseISO(event.start);
      const endDate = parseISO(event.end);
      const duration = differenceInMinutes(endDate, startDate);
      const updatedStart = set(day, {
        hours: startDate.getHours(),
        minutes: startDate.getMinutes(),
        seconds: 0,
        milliseconds: 0
      });
      await this.save({
        ...event,
        start: formatISO(updatedStart),
        end: formatISO(addMinutes(updatedStart, duration))
      });
    },
    upsert(event: EventModel) {
      const index = this.events.findIndex((item) => item.id === event.id);
      if (index >= 0) {
        this.events.splice(index, 1, event);
      } else {
        this.events.push(event);
      }
      this.events.sort((a, b) => parseISO(a.start).getTime() - parseISO(b.start).getTime());
    }
  }
});
