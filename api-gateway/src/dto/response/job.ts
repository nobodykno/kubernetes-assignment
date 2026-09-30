

export type IJobStatus = 'queued' | 'processing' | 'completed' | 'failed';

export interface IJob {
  id: string;
  type: string;
  status: IJobStatus;
  createdAt: number;
  startedAt?: number;
  completedAt?: number;
  durationMs?: number;
  result?: string;
  error?: string;
}


export interface IPostJobResponse{
    jobId: string | number;
    status: string;
    type: string;
}