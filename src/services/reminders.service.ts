import { apiRequest } from './api';

export type ReminderPriority = 'Alta' | 'Media' | 'Baja';

export interface Reminder {
  id: number;
  title: string;
  description: string;
  dueAt: string | null;
  priority: ReminderPriority;
  completed: boolean;
  createdAt: string;
}

export interface CreateReminderInput {
  title: string;
  description?: string;
  dueAt?: string | null;
  priority?: ReminderPriority;
}

export type UpdateReminderInput = Partial<CreateReminderInput> & {
  completed?: boolean;
};

export const remindersService = {
  list(token: string) {
    return apiRequest<{ reminders: Reminder[] }>('/reminders', {}, token);
  },

  create(token: string, input: CreateReminderInput) {
    return apiRequest<{ reminder: Reminder }>('/reminders', {
      method: 'POST',
      body: JSON.stringify(input),
    }, token);
  },

  update(token: string, id: number, input: UpdateReminderInput) {
    return apiRequest<{ reminder: Reminder }>(`/reminders/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(input),
    }, token);
  },

  remove(token: string, id: number) {
    return apiRequest<void>(`/reminders/${id}`, { method: 'DELETE' }, token);
  },
};
