import youtubedl from "youtube-dl-exec";
import fs from "fs";
import path from "path";
import os from "os";
import { v4 as uuidv4 } from "uuid";
import { createClient } from "@supabase/supabase-js";
import ffmpegInstaller from "@ffmpeg-installer/ffmpeg";

export interface YouTubeDownloadResult {
  localFilePath: string;
  fileSizeMb: number;
}

export class YouTubeIngestionService {
  private supabase;

  constructor() {
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
  }

  /**
   * Downloads a YouTube video directly to local temporary storage for processing.
   * Does NOT upload to Supabase storage to eliminate the 50MB bucket limit bottleneck.
   * The caller is responsible for deleting localFilePath in a finally block when finished.
   */
  public async download(url: string, projectId: string): Promise<YouTubeDownloadResult> {
    const tempDir = os.tmpdir();
    const fileName = `${uuidv4()}.mp4`;
    const tempFilePath = path.join(tempDir, fileName);
    let actualFilePath = tempFilePath;

    console.log(`[PERF] YouTube download start: ${url}`);
    const ytStartTime = performance.now();
    
    try {
      console.log(`[YouTubeIngestion] Spawning yt-dlp...`);
      
      const subprocess = youtubedl.exec(url, {
        output: tempFilePath,
        format: "bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best",
        ffmpegLocation: ffmpegInstaller.path,
        noCheckCertificates: true,
        noWarnings: true,
        preferFreeFormats: true,
        addHeader: [
          "referer:youtube.com",
          "user-agent:Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Safari/537.36"
        ]
      });

      // Capture stdout and stderr
      subprocess.stdout?.on("data", (chunk) => console.log(`[yt-dlp stdout]: ${chunk.toString().trim()}`));
      subprocess.stderr?.on("data", (chunk) => console.error(`[yt-dlp stderr]: ${chunk.toString().trim()}`));

      // 5-minute timeout for download
      const timeoutMs = 5 * 60 * 1000;
      let isTimedOut = false;
      const timeoutId = setTimeout(() => {
        isTimedOut = true;
        console.error(`[YouTubeIngestion] TIMEOUT EXCEEDED! Killing yt-dlp process after ${timeoutMs}ms.`);
        subprocess.kill("SIGKILL");
      }, timeoutMs);

      try {
        await subprocess;
      } catch (err: any /* eslint-disable-line @typescript-eslint/no-explicit-any */) {
        if (isTimedOut) {
          throw new Error("Download timed out after 5 minutes.");
        }
        throw new Error(`yt-dlp execution failed: ${err.message}`);
      } finally {
        clearTimeout(timeoutId);
      }

      const ytElapsed = (performance.now() - ytStartTime).toFixed(1);
      console.log(`[PERF] YouTube download end: ${ytElapsed}ms`);

      if (!fs.existsSync(actualFilePath)) {
        // yt-dlp might have appended a different extension (e.g. .mkv when merging)
        const files = fs.readdirSync(tempDir);
        const match = files.find(f => f.startsWith(fileName.replace('.mp4', '')));
        if (match) {
          actualFilePath = path.join(tempDir, match);
          console.log(`[YouTubeIngestion] Found file at alternative path: ${actualFilePath}`);
        } else {
          throw new Error("Download completed but file not found on disk.");
        }
      }

      const stat = fs.statSync(actualFilePath);
      if (stat.size === 0) {
        throw new Error("Download completed but the file size is 0 bytes.");
      }

      const fileSizeMb = Number((stat.size / 1024 / 1024).toFixed(2));
      console.log(`[PERF] local source ready + file size: ${fileSizeMb} MB`);

      // Update video_sources metadata in database
      const { error: updateError } = await this.supabase
        .from("video_sources")
        .update({ 
          status: "ready",
          filename: path.basename(actualFilePath),
          mime_type: "video/mp4",
          file_size_mb: fileSizeMb
        })
        .eq("project_id", projectId)
        .eq("type", "youtube");

      if (updateError) {
        console.warn(`[YouTubeIngestion] Warning updating video_sources: ${updateError.message}`);
      }

      return {
        localFilePath: actualFilePath,
        fileSizeMb
      };
    } catch (err) {
      // If error occurs before returning to caller, cleanup the temp file
      if (fs.existsSync(actualFilePath)) {
        try {
          fs.unlinkSync(actualFilePath);
        } catch {
          // ignore cleanup error
        }
      }
      throw err;
    }
  }
}