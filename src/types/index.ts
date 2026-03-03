export enum BacklogItemType {
  Bug = 'Bug',
  Feature = 'Feature',
  Task = 'Task'
}

export enum Priority {
  None = 'None',
  Low = 'Low',
  Medium = 'Medium',
  High = 'High',
  Critical = 'Critical'
}

export enum BacklogItemStatus {
  Backlog = 'Backlog',
  ToDo = 'ToDo',
  InProgress = 'InProgress',
  InReview = 'InReview',
  Done = 'Done'
}

export interface Project {
  id: string
  name: string
  itemCounter: number
  createdDate: string
  isArchived: boolean
}

export interface BacklogItem {
  id: string
  projectId: string
  itemNumber: number
  type: BacklogItemType
  title: string
  description: string | null
  priority: Priority
  status: BacklogItemStatus
  assignedTo: string | null
  createdBy: string
  createdDate: string
  updatedDate: string | null
  isArchived: boolean
  tags: string[]
  commentCount: number
  attachmentCount: number
}

export interface Comment {
  id: string
  backlogItemId: string
  text: string
  createdBy: string
  createdDate: string
}

export interface Attachment {
  id: string
  backlogItemId: string
  fileName: string
  contentType: string
  fileSize: number
  createdDate: string
}

export interface CreateBacklogItem {
  type: BacklogItemType
  title: string
  description?: string
  priority: Priority
  status: BacklogItemStatus
  assignedTo?: string
  tags?: string[]
}
