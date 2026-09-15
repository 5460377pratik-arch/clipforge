import { createClient as createBrowserClient, isSupabaseConfigured } from '../lib/supabase/client';
import type { ApiResponse } from '../lib/types';
import { MAX_FILE_SIZE_MB, SUPPORTED_VIDEO_TYPES } from '../lib/constants';

export interface StorageService {
  uploadVideo(file: File, projectId: string, onProgress?: (pct: number) => void): Promise<ApiResponse<{ path: string; url: string }>>;
}

class SupabaseStorageService implements StorageService {
  private get NOT_CONFIGURED() {
    return { success: false as const, error: { code: 'STORAGE_NOT_CONFIGURED', message: 'Supabase is not configured.' } };
  }

  async uploadVideo(file: File, projectId: string, onProgress?: (pct: number) => void): Promise<ApiResponse<{ path: string; url: string }>> {
    if (!isSupabaseConfigured()) return this.NOT_CONFIGURED;

    // Validate size and type
    const sizeMb = file.size / (1024 * 1024);
    if (sizeMb > MAX_FILE_SIZE_MB.free) { // Using free limit for now
      return { success: false, error: { code: 'FILE_TOO_LARGE', message: `File exceeds the ${MAX_FILE_SIZE_MB.free}MB limit.` } };
    }
    
    if (!SUPPORTED_VIDEO_TYPES.includes(file.type as any /* eslint-disable-line @typescript-eslint/no-explicit-any */) && !file.name.match(/\.(mp4|mov|webm|avi)$/i)) {
      return { success: false, error: { code: 'UNSUPPORTED_TYPE', message: 'Only MP4, MOV, and WebM videos are supported.' } };
    }

    const supabase = createBrowserClient();
    
    // Get user to build path
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return { success: false, error: { code: 'UNAUTHORIZED', message: 'You must be logged in to upload.' } };
    }

    const ext = file.name.split('.').pop() || 'mp4';
    const filename = `${crypto.randomUUID()}.${ext}`;
    const filePath = `${user.id}/${projectId}/${filename}`;

    // Note: Supabase JS client doesn't support native upload progress natively via standard `upload` yet,
    // without XMLHttpRequest. For now, we simulate the progress event if requested, or just await.
    // In a real prod environment we'd use TUS protocol or XMLHttpRequest for true progress.
    if (onProgress) {
      const { data, error } = await supabase.storage
        .from('videos')
        .upload(filePath, file, { cacheControl: '3600', upsert: false });
        
      if (error) {
        return { success: false, error: { code: 'UPLOAD_FAILED', message: error.message } };
      }
      
      onProgress(100);
      return { success: true, data: { path: data.path, url: data.path } };
    } else {
      const { data, error } = await supabase.storage
        .from('videos')
        .upload(filePath, file, { cacheControl: '3600', upsert: false });

      if (error) {
        return { success: false, error: { code: 'UPLOAD_FAILED', message: error.message } };
      }

      return { success: true, data: { path: data.path, url: data.path } };
    }
  }
}

export const storageService: StorageService = new SupabaseStorageService();