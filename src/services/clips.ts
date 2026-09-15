import type { Clip, ExportJob, ExportPlatform, ApiResponse, PaginatedResult } from '../lib/types';

// =============================================================================
// CLIPS SERVICE INTERFACE
// =============================================================================
// TODO: Replace stubs with real API calls.
//   GET  /api/projects/:id/clips       -> listClips
//   GET  /api/clips/:id               -> getClip
//   POST /api/clips/:id/export         -> exportClip
// =============================================================================

export interface ClipService {
  listClips(projectId: string): Promise<ApiResponse<PaginatedResult<Clip>>>;
  getClip(clipId: string): Promise<ApiResponse<Clip>>;
  exportClip(clipId: string, platform: ExportPlatform): Promise<ApiResponse<ExportJob>>;
  getExportStatus(exportJobId: string): Promise<ApiResponse<ExportJob>>;
}

class ClipServiceStub implements ClipService {
  private stub<T>(): Promise<ApiResponse<T>> {
    return Promise.resolve({
      success: false as const,
      error: { code: 'NOT_IMPLEMENTED', message: 'Backend not connected. See src/services/clips.ts.' },
    });
  }
  listClips(_projectId: string) { return this.stub<PaginatedResult<Clip>>(); }
  getClip(_clipId: string) { return this.stub<Clip>(); }
  exportClip(_clipId: string, _platform: ExportPlatform) { return this.stub<ExportJob>(); }
  getExportStatus(_exportJobId: string) { return this.stub<ExportJob>(); }
}

export const clipService: ClipService = new ClipServiceStub();