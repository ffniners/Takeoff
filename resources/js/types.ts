export type EventStatus =
  | 'proposed'
  | 'scheduled'
  | 'in_progress'
  | 'done'
  | 'blocked'
  | 'canceled';

export type Priority = 'P1' | 'P2' | 'P3';

export interface Reminder {
  id: string;
  offsetMinutes: number; // negative means before start; for deadlines use deadlineOffsets
  label: string; // e.g., "-24h"
}

export interface EventLinkRefs {
  crm?: string;
  files?: string[];
}

export interface EventModel {
  id: string;
  title: string;
  start: string; // ISO
  end: string; // ISO
  allDay: boolean;
  status: EventStatus;
  priority: Priority;
  deadline?: string; // ISO
  reminders: Reminder[];
  owner: string;
  assignees: string[];
  project?: string;
  dependencies: string[];
  description: string;
  instructions: string;
  transcriptRefs: string[];
  aiNotes?: string;
  links?: EventLinkRefs;
  createdAt: string;
  updatedAt: string;
}

export interface ActionPlanDiff {
  added: EventModel[];
  moved: { id: string; from: string; to: string }[];
  deleted: string[];
  notes?: string;
}
