import apiClient from './api'
import type { BacklogItem, CreateBacklogItem, BacklogItemType, Priority, BacklogItemStatus } from '../types'

export const itemService = {
  getByProject: (projectId: string, type?: BacklogItemType, priority?: Priority) => {
    const params = new URLSearchParams()
    if (type) params.set('type', type)
    if (priority) params.set('priority', priority)
    const query = params.toString()
    return apiClient.get<BacklogItem[]>(`/projects/${projectId}/items${query ? '?' + query : ''}`).then(r => r.data)
  },
  getByNumber: (projectId: string, itemNumber: number) =>
    apiClient.get<BacklogItem>(`/projects/${projectId}/items/${itemNumber}`).then(r => r.data),
  create: (projectId: string, dto: CreateBacklogItem) =>
    apiClient.post<BacklogItem>(`/projects/${projectId}/items`, dto).then(r => r.data),
  update: (projectId: string, itemNumber: number, dto: Partial<BacklogItem>) =>
    apiClient.put<BacklogItem>(`/projects/${projectId}/items/${itemNumber}`, dto).then(r => r.data),
  updateStatus: (projectId: string, itemNumber: number, status: BacklogItemStatus) =>
    apiClient.put<BacklogItem>(`/projects/${projectId}/items/${itemNumber}/status`, { status }).then(r => r.data),
  archive: (projectId: string, itemNumber: number) =>
    apiClient.put(`/projects/${projectId}/items/${itemNumber}/archive`),
  getArchived: (projectId: string) =>
    apiClient.get<BacklogItem[]>(`/projects/${projectId}/items/archived`).then(r => r.data),
  unarchive: (projectId: string, itemNumber: number) =>
    apiClient.put<BacklogItem>(`/projects/${projectId}/items/${itemNumber}/unarchive`).then(r => r.data)
}
