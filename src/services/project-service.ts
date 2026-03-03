import apiClient from './api'
import type { Project } from '../types'

export const projectService = {
  getAll: () => apiClient.get<Project[]>('/projects').then(r => r.data),
  getById: (id: string) => apiClient.get<Project>(`/projects/${id}`).then(r => r.data),
  create: (name: string) => apiClient.post<Project>('/projects', { name }).then(r => r.data),
  update: (id: string, name: string) => apiClient.put<Project>(`/projects/${id}`, { name }).then(r => r.data),
  archive: (id: string) => apiClient.put(`/projects/${id}/archive`)
}
