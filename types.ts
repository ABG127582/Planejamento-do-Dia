
export type EventCategory = 'work' | 'personal' | 'health' | 'other';

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  startTime: string; // ISO string or "HH:mm" for the current day view logic
  endTime: string;   // ISO string or "HH:mm"
  isAllDay: boolean;
  isCompleted: boolean;
  category: EventCategory;
  date: string; // YYYY-MM-DD
}

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}
