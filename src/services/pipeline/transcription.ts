import fs from 'fs';
import { pipeline } from '@xenova/transformers';
import ffmpeg from 'fluent-ffmpeg';
import ffmpegInstaller from '@ffmpeg-installer/ffmpeg';

export interface TranscriptionSegment {
  startMs: number;
  endMs: number;
  text: string;
}

export interface TranscriptionResult {
  text: string;
  segments: TranscriptionSegment[];
  language: string;
}

export interface TranscriptionProvider {
  transcribe(localVideoPath: string): Promise<TranscriptionResult>;
  preloadModel?(): Promise<void>;
}

export class LocalWhisperTranscriptionProvider implements TranscriptionProvider {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private transcriberInstance: any = null;

  async getTranscriber() {
    if (!this.transcriberInstance) {
      console.log(`[PERF] Whisper model initialization start`);
      const t0 = performance.now();
      this.transcriberInstance = await pipeline('automatic-speech-recognition', 'Xenova/whisper-tiny.en');
      const elapsed = (performance.now() - t0).toFixed(1);
      console.log(`[PERF] Whisper model initialization end: ${elapsed}ms`);
    } else {
      console.log(`[PERF] Whisper model reusing cached instance (0ms)`);
    }
    return this.transcriberInstance;
  }

  async preloadModel(): Promise<void> {
    await this.getTranscriber();
  }

  private async extractAudio(videoPath: string): Promise<string> {
    return new Promise((resolve, reject) => {
      // Robust replacement of whatever extension is on the videoPath
      const audioPath = videoPath.replace(/\.[^/.]+$/, "") + ".pcm";
      
      ffmpeg.setFfmpegPath(ffmpegInstaller.path);
      if (process.env.FFMPEG_PATH) {
        ffmpeg.setFfmpegPath(process.env.FFMPEG_PATH);
      }

      console.log(`[PERF] audio extraction start`);
      const startT = performance.now();

      ffmpeg(videoPath)
        .noVideo()
        .audioFrequency(16000)
        .audioChannels(1)
        .format('f32le') // Raw PCM 32-bit float little-endian
        .on('error', (err) => {
          if (err.message.includes('Cannot find ffmpeg') || err.message.includes('spawn ffmpeg ENOENT')) {
            reject(new Error('LOCAL TRANSCRIPTION BLOCKED: FFmpeg is not installed on this system. FFmpeg is required to extract audio for local transcription.'));
          } else {
            reject(new Error(`Failed to extract audio: ${err.message}`));
          }
        })
        .on('end', () => {
          const elapsed = (performance.now() - startT).toFixed(1);
          let sizeMb = '0';
          try {
            const stat = fs.statSync(audioPath);
            sizeMb = (stat.size / 1024 / 1024).toFixed(2);
          } catch {
            // ignore
          }
          console.log(`[PERF] audio extraction end: ${elapsed}ms, audio file size: ${sizeMb} MB`);
          resolve(audioPath);
        })
        .save(audioPath);
    });
  }

  async transcribe(localVideoPath: string): Promise<TranscriptionResult> {
    console.log(`[Transcription] Starting local transcription for ${localVideoPath}`);
    let audioPath = '';

    try {
      audioPath = await this.extractAudio(localVideoPath);
      const transcriber = await this.getTranscriber();
      
      console.log(`[Transcription] Reading audio samples into memory...`);
      const buffer = fs.readFileSync(audioPath);
      // Fast ArrayBuffer conversion without a loop
      const audioData = new Float32Array(buffer.buffer, buffer.byteOffset, buffer.length / 4);
      console.log(`[Transcription] Loaded ${audioData.length} audio samples (${(audioData.length / 16000).toFixed(2)} seconds)`);
      
      console.log(`[PERF] Whisper inference start`);
      const infStart = performance.now();
      const output = await transcriber(audioData, {
        chunk_length_s: 30,
        stride_length_s: 5,
        return_timestamps: true,
      }) as any /* eslint-disable-line @typescript-eslint/no-explicit-any */;
      const infElapsed = (performance.now() - infStart).toFixed(1);
      console.log(`[PERF] Whisper inference end: ${infElapsed}ms`);

      const segments: TranscriptionSegment[] = [];
      let fullText = '';

      // Transformers.js returns chunks as array of { timestamp: [start, end], text: string }
      if (output.chunks && Array.isArray(output.chunks)) {
        for (const chunk of output.chunks) {
          if (!chunk.timestamp || chunk.timestamp.length < 2) continue;
          const [startSec, endSec] = chunk.timestamp;
          if (startSec === null || endSec === null) continue;
          
          segments.push({
            startMs: Math.round(startSec * 1000),
            endMs: Math.round(endSec * 1000),
            text: chunk.text.trim()
          });
          fullText += chunk.text + ' ';
        }
      } else {
        // Fallback if no chunks but text exists
        fullText = output.text;
      }

      if (segments.length === 0 && fullText.trim().length > 0) {
        // graceful fallback if timestamps failed but text succeeded
        segments.push({
          startMs: 0,
          endMs: 10000,
          text: fullText.trim()
        });
      }

      console.log(`[Transcription] Transcription completed. Found ${segments.length} segments.`);
      return {
        text: fullText.trim(),
        segments,
        language: 'en'
      };

    } catch (err: any /* eslint-disable-line @typescript-eslint/no-explicit-any */) {
      console.error('[Transcription Error]', err.message);
      throw err;
    } finally {
      // Clean up temp PCM securely
      if (audioPath && fs.existsSync(audioPath)) fs.unlinkSync(audioPath);
    }
  }
}

export const DefaultTranscriptionProvider = LocalWhisperTranscriptionProvider;