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
  offsetMinutes: number;
  label: string;
}

export interface EventModel {
  id: string;
  title: string;
  start: string;
  end: string;
  allDay: boolean;
  status: EventStatus;
  priority: Priority;
  deadline?: string | null;
  reminders: Reminder[];
  owner: string;
  assignees: string[];
  project?: string | null;
  dependencies: string[];
  description: string;
  instructions: string;
  transcriptRefs: string[];
  aiNotes?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SettingsModel {
  timezone: string;
  workdayStart: string;
  workdayEnd: string;
  defaultSlotMin: number;
  maxHoursPerDay: number;
  deepWorkAM: boolean;
}

export interface ActionPlanDiff {
  added: EventModel[];
  moved: { id: string; from: string; to: string }[];
  deleted: string[];
  notes?: string;
}
