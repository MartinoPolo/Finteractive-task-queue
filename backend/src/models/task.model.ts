export interface Task {
  id: string
  name: string
  priority: number // higher = more important
  progress: number // 0-100 as percents
  createdAt: Date
}

export interface CompletedTask extends Task {
  completedAt: Date
}

export interface CreateTaskInput {
  name: string
  priority: number
}
