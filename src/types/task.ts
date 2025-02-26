export interface Task {
  id: number;
  title: string;
  description: string;
  status: 'TODO' | 'IN_PROGRESS' | 'DONE';
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  dueDate: string;
}

export type TaskStatus = Task['status'];
export type TaskPriority = Task['priority'];

export type NewTask = Omit<Task, 'id'>;

export interface User {
  id: number;
  email: string;
  name: string;
  title?: string;
  bio?: string;
  avatar?: string;
  phone?: string;
  location?: string;
  joinedDate: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}