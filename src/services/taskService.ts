import api from './api';
import { Task, TaskCreateData, TaskUpdateData } from '../types/task';

interface TaskFilterParams {
  status?: string;
  priority?: string;
  search?: string;
}

class TaskService {
  async getAllTasks() {
    const response = await api.get('/tasks');
    return response.data;
  }

  async getFilteredTasks(params: TaskFilterParams) {
    const response = await api.get('/tasks/filter', { params });
    return response.data;
  }

  async getTaskById(id: string) {
    const response = await api.get(`/tasks/${id}`);
    return response.data;
  }

  async createTask(taskData: TaskCreateData) {
    const response = await api.post('/tasks', taskData);
    return response.data;
  }

  async updateTask(id: string, taskData: TaskUpdateData) {
    const response = await api.put(`/tasks/${id}`, taskData);
    return response.data;
  }

  async deleteTask(id: string) {
    const response = await api.delete(`/tasks/${id}`);
    return response.data;
  }
}

export default new TaskService();