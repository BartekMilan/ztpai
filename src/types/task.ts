export interface Task {
  _id: string;  // MongoDB używa _id zamiast id
  title: string;
  description?: string;
  status: 'todo' | 'in-progress' | 'completed';  // Dostosowane do wartości w modelu
  priority: 'low' | 'medium' | 'high';  // Dostosowane do wartości w modelu
  dueDate?: string;
  userId: string;  // Referencja do użytkownika
  createdAt: string;
  updatedAt: string;
}

export interface NewTask {
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: string;
}

export interface TaskCreateData {
  title: string;
  description?: string;
  status?: Task['status'];
  priority?: Task['priority'];
  dueDate?: string;
}

export interface TaskUpdateData extends Partial<TaskCreateData> {}

export type TaskStatus = Task['status'];
export type TaskPriority = Task['priority'];

export interface User {
  _id: string;  // MongoDB używa _id zamiast id
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  name?: string; // dodajemy dla kompatybilności wstecznej
  avatar?: string;
  phone?: string;
  location?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface AuthResponse {
  success: boolean;
  token: string;
  user: User;
}