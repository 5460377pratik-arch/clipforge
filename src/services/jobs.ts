import type { ProcessingJob, ApiResponse } from '../lib/types';

// =============================================================================
// JOBS SERVICE INTERFACE
// =============================================================================
// TODO: Replace stubs with real API calls.
//   GET /api/jobs/:id -> getJob (used for polling)
// =============================================================================

export interface JobService {
  getJob(jobId: string): Promise<ApiResponse<ProcessingJob>>;
}

class JobServiceStub implements JobService {
  getJob(_jobId: string): Promise<ApiResponse<ProcessingJob>> {
    return Promise.resolve({
      success: false as const,
      error: { code: 'NOT_IMPLEMENTED', message: 'Backend not connected. See src/services/jobs.ts.' },
    });
  }
}

export const jobService: JobService = new JobServiceStub();