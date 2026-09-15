import type { Project, VideoSource, GenerationConfig, ApiResponse, PaginatedResult } from '../lib/types';
import { DEFAULT_CONFIG } from '../lib/types';

export interface CreateProjectInput {
  title?: string;
  source: VideoSource;
  config?: Partial<GenerationConfig>;
}

export interface ProjectService {
  listProjects(opts?: { page?: number; pageSize?: number }): Promise<ApiResponse<PaginatedResult<Project>>>;
  getProject(id: string): Promise<ApiResponse<Project>>;
  createProject(input: CreateProjectInput): Promise<ApiResponse<Project>>;
  confirmUpload(projectId: string, storagePath: string): Promise<ApiResponse<{ status: string }>>;
}

class ApiProjectService implements ProjectService {
  async confirmUpload(projectId: string, storagePath: string): Promise<ApiResponse<{ status: string }>> {
    try {
      const res = await fetch('/api/projects/' + projectId + '/confirm-upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ storagePath }),
      });
      return await res.json();
    } catch (e) {
      return { success: false, error: { code: 'NETWORK_ERROR', message: 'Failed to connect to API' } };
    }
  }
  async listProjects(opts?: { page?: number; pageSize?: number }): Promise<ApiResponse<PaginatedResult<Project>>> {
    try {
      const res = await fetch('/api/projects');
      return await res.json();
    } catch (e) {
      return { success: false, error: { code: 'NETWORK_ERROR', message: 'Failed to connect to API' } };
    }
  }

  async getProject(id: string): Promise<ApiResponse<Project>> {
    try {
      const res = await fetch(`/api/projects/${id}`);
      return await res.json();
    } catch (e) {
      return { success: false, error: { code: 'NETWORK_ERROR', message: 'Failed to connect to API' } };
    }
  }

  async createProject(input: CreateProjectInput): Promise<ApiResponse<Project>> {
    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });
      return await res.json();
    } catch (e) {
      return { success: false, error: { code: 'NETWORK_ERROR', message: 'Failed to connect to API' } };
    }
  }
}

export const projectService: ProjectService = new ApiProjectService();
export { DEFAULT_CONFIG };