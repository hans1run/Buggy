import apiClient from './api'
import type { Attachment } from '../types'

export const attachmentService = {
  getByItem: (itemId: string) =>
    apiClient.get<Attachment[]>(`/items/${itemId}/attachments`).then(r => r.data),
  upload: (itemId: string, file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    return apiClient.post<Attachment>(`/items/${itemId}/attachments`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }).then(r => r.data)
  },
  delete: (itemId: string, attachmentId: string) =>
    apiClient.delete(`/items/${itemId}/attachments/${attachmentId}`),
  getUrl: (attachmentId: string) =>
    apiClient.get<{ url: string }>(`/attachments/${attachmentId}/url`).then(r => r.data.url)
}
