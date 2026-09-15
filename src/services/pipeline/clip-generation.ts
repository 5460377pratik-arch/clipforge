import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import os from "os";
import path from "path";
import ffmpeg from "fluent-ffmpeg";
import ffmpegInstaller from "@ffmpeg-installer/ffmpeg";
import { v4 as uuidv4 } from "uuid";

import type { HighlightCandidate } from "./highlights";

export interface ClipGenerationService {
  generateClip(projectId: string, userId: string, localVideoPath: string, highlight: HighlightCandidate): Promise<string>;
}

export class FFmpegClipGenerationService implements ClipGenerationService {
  private supabase;

  constructor() {
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    ffmpeg.setFfmpegPath(ffmpegInstaller.path);
  }

  async generateClip(projectId: string, userId: string, localVideoPath: string, highlight: HighlightCandidate): Promise<string> {
    const clipStart = performance.now();
    console.log(`[PERF] FFmpeg clip start [${highlight.startMs}ms - ${highlight.endMs}ms]`);
    
    let aspectRatio = "9:16";
    if (projectId) {
      const { data: project } = await this.supabase.from("projects").select("config").eq("id", projectId).single();
      if (project?.config?.aspectRatio) {
        aspectRatio = project.config.aspectRatio;
      }
    }

    const tempDir = os.tmpdir();
    const outLocalPath = path.join(tempDir, `${uuidv4()}_clip.mp4`);

    try {
      // Process with FFmpeg using fast input seeking
      await new Promise<void>((resolve, reject) => {
        const startSec = highlight.startMs / 1000;
        const durationSec = (highlight.endMs - highlight.startMs) / 1000;
        
        let cropFilter = "";
        if (aspectRatio === "9:16") {
          cropFilter = "crop=ih*(9/16):ih";
        } else if (aspectRatio === "1:1") {
          cropFilter = "crop=ih:ih";
        } else {
          cropFilter = "crop=iw:ih";
        }

        ffmpeg(localVideoPath)
          .inputOptions([`-ss ${startSec}`]) // Fast demuxer seek before decoding
          .setDuration(durationSec)
          .videoFilters([cropFilter])
          .outputOptions([
            '-preset fast',
            '-crf 23',
            '-c:v libx264',
            '-c:a aac',
            '-b:a 128k',
            '-movflags +faststart'
          ])
          .output(outLocalPath)
          .on("end", () => resolve())
          .on("error", (err) => reject(new Error(`FFmpeg error: ${err.message}`)))
          .run();
      });

      const clipElapsed = (performance.now() - clipStart).toFixed(1);

      if (!fs.existsSync(outLocalPath)) {
        throw new Error("FFmpeg failed to create the clip file");
      }
      
      const stat = fs.statSync(outLocalPath);
      if (stat.size === 0) {
        throw new Error("Generated clip file is 0 bytes");
      }
      
      const sizeMb = (stat.size / 1024 / 1024).toFixed(2);
      console.log(`[PERF] FFmpeg clip end: ${clipElapsed}ms, clip file size: ${sizeMb} MB`);

      // Upload clip to Supabase
      const clipStoragePath = `${userId}/${projectId}/clip_${uuidv4()}.mp4`;
      const fileBuffer = fs.readFileSync(outLocalPath);
      let uploadError = null;
      
      console.log(`[PERF] clip upload start: ${clipStoragePath}`);
      const uploadStart = performance.now();

      for (let attempt = 1; attempt <= 3; attempt++) {
        const result = await this.supabase.storage
          .from("videos")
          .upload(clipStoragePath, fileBuffer, {
            contentType: "video/mp4",
            upsert: true
          });
          
        if (!result.error) {
          uploadError = null;
          break; // Success!
        }
        
        uploadError = result.error;
        console.error(`[ClipGeneration] Upload attempt ${attempt} failed:`, uploadError.message);
        
        // Bail on permanent errors
        const permanent = /exceeded|not found|forbidden|unauthorized|invalid/i.test(uploadError.message);
        if (permanent) break;

        if (attempt < 3) {
          await new Promise(res => setTimeout(res, attempt * 1000));
        }
      }

      if (uploadError) {
        throw new Error(`Failed to upload clip after 3 attempts: ${uploadError.message}`);
      }

      const uploadElapsed = (performance.now() - uploadStart).toFixed(1);
      console.log(`[PERF] clip upload end: ${uploadElapsed}ms`);

      return clipStoragePath;
    } finally {
      if (fs.existsSync(outLocalPath)) fs.unlinkSync(outLocalPath);
    }
  }
}