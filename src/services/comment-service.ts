import apiClient from './api'
import type { Comment } from '../types'

export const commentService = {
  getByItem: (itemId: string) =>
    apiClient.get<Comment[]>(`/items/${itemId}/comments`).then(r => r.data),
  create: (itemId: string, text: string) =>
    apiClient.post<Comment>(`/items/${itemId}/comments`, { text }).then(r => r.data)
}
