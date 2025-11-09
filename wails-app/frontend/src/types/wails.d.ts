declare module '@wailsjs/go/backend/App' {
  import type { EventModel, SettingsModel } from '@/types';
  import type { Reminder } from '@/types';

  export interface EventPayload extends Omit<EventModel, 'createdAt' | 'updatedAt'> {}

  export function GetEvents(): Promise<EventModel[]>;
  export function SaveEvent(event: EventPayload): Promise<EventModel>;
  export function DeleteEvent(id: string): Promise<void>;
  export function GetSettings(): Promise<SettingsModel>;
  export function SaveSettings(settings: SettingsModel): Promise<SettingsModel>;
}
