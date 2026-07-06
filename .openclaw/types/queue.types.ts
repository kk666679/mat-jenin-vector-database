export interface QueueStats {
  active: number;
  waiting: number;
  completed: number;
  failed: number;
  delayed: number;
  paused: number;
  total: number;
}

export interface QueueConfig {
  concurrency: number;
  maxAttempts: number;
  removeOnComplete: number;
  removeOnFail: number;
  stalledInterval: number;
  maxStalledCount: number;
}

export interface JobData<T = any> {
  id: string;
  type: string;
  data: T;
  priority: number;
  attempts: number;
  createdAt: Date;
  processedAt?: Date;
  completedAt?: Date;
  failedAt?: Date;
}

export interface QueueEvent {
  type: 'waiting' | 'active' | 'completed' | 'failed' | 'stalled' | 'progress' | 'removed';
  jobId: string;
  data?: any;
  timestamp: Date;
}
