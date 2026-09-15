import { GoogleGenAI, Type } from '@google/genai';
import type { TranscriptionResult } from './transcription';

export interface HighlightCandidate {
  startMs: number;
  endMs: number;
  score: number;
  reason: string;
  title: string;
}

export interface HighlightDetectionProvider {
  detectHighlights(transcript: TranscriptionResult, targetCount: number): Promise<HighlightCandidate[]>;
}

function isTransientError(err: any /* eslint-disable-line @typescript-eslint/no-explicit-any */): boolean {
  const status = err?.status || err?.statusCode || err?.code;
  if ([429, 500, 502, 503, 504].includes(status)) return true;
  const msg = (err?.message || '').toLowerCase();
  return /503|429|500|502|504|unavailable|high demand|resource_exhausted|quota|overloaded|deadline_exceeded|rate limit|fetch failed|econnreset|etimedout/i.test(msg);
}

export class GeminiHighlightDetectionProvider implements HighlightDetectionProvider {
  private ai: GoogleGenAI | null = null;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
      this.ai = new GoogleGenAI({ apiKey });
    }
  }

  async detectHighlights(transcript: TranscriptionResult, targetCount: number): Promise<HighlightCandidate[]> {
    if (!this.ai) {
      throw new Error('AI HIGHLIGHT DETECTION NOT CONFIGURED: GEMINI_API_KEY missing');
    }

    if (!transcript || !transcript.segments || transcript.segments.length === 0) {
      console.warn('[Highlights] Empty transcript provided. Returning 0 highlights.');
      return [];
    }

    const systemPrompt = `You are an expert AI video editor. You will receive a video transcript containing text and millisecond timestamps. Your job is to extract the ${targetCount} most engaging, viral-worthy highlight clips from the transcript. 
A good highlight is a complete thought, engaging, and suitable for short-form social media (TikTok/Reels/Shorts). 
The output MUST be structured JSON following the exact schema provided. Start and end times must be in milliseconds and should correspond exactly to the provided timestamps.`;

    const transcriptWithTimes = transcript.segments.map(s => `[${s.startMs}ms - ${s.endMs}ms] ${s.text}`).join('\n');
    const userPrompt = `Target clip count: ${targetCount}\n\nTranscript with timestamps:\n${transcriptWithTimes}\n\nExtract the top highlights using EXACTLY the timestamps provided.`;

    const maxAttempts = 3;
    let lastError: any = null; // eslint-disable-line @typescript-eslint/no-explicit-any

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        console.log(`[Gemini] Attempt ${attempt}/${maxAttempts} — generating highlights...`);
        const response = await this.ai.models.generateContent({
          model: 'gemini-3.6-flash',
          contents: userPrompt,
          config: {
            systemInstruction: systemPrompt,
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                highlights: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      startMs: { type: Type.INTEGER },
                      endMs: { type: Type.INTEGER },
                      score: { type: Type.INTEGER, description: 'Score out of 100 representing virality/engagement potential' },
                      reason: { type: Type.STRING, description: 'Brief explanation of why this clip is engaging' },
                      title: { type: Type.STRING, description: 'Catchy title for the clip' }
                    },
                    required: ['startMs', 'endMs', 'score', 'reason', 'title']
                  }
                }
              },
              required: ['highlights']
            }
          }
        });

        const responseText = response.text;
        if (!responseText) {
          throw new Error('Gemini returned an empty response');
        }

        let parsed: { highlights: HighlightCandidate[] };
        try {
          parsed = JSON.parse(responseText);
        } catch (parseErr: any /* eslint-disable-line @typescript-eslint/no-explicit-any */) {
          throw new Error(`Failed to parse Gemini response as JSON: ${parseErr.message}`);
        }

        if (!parsed.highlights || !Array.isArray(parsed.highlights)) {
          throw new Error('Gemini response did not contain the expected "highlights" array');
        }

        const validHighlights = parsed.highlights.filter(h => {
          return typeof h.startMs === 'number' &&
                 typeof h.endMs === 'number' &&
                 h.endMs > h.startMs &&
                 h.startMs >= 0;
        });

        console.log(`[Gemini] Successfully detected ${validHighlights.length} highlights.`);
        return validHighlights;

      } catch (err: any /* eslint-disable-line @typescript-eslint/no-explicit-any */) {
        lastError = err;
        console.error(`[Gemini] Attempt ${attempt}/${maxAttempts} failed: ${err.message}`);

        const transient = isTransientError(err);
        if (!transient) {
          console.error(`[Gemini] Permanent error detected — not retrying: ${err.message}`);
          break;
        }

        if (attempt < maxAttempts) {
          const delayMs = Math.pow(2, attempt - 1) * 1000; // 1000ms, 2000ms, 4000ms
          console.log(`[Gemini] Transient error (${err.message}). Retrying in ${delayMs}ms...`);
          await new Promise(res => setTimeout(res, delayMs));
        }
      }
    }

    throw new Error(`Gemini Highlight Detection Failed: ${lastError?.message || 'Unknown error'}`);
  }
}

export const DefaultHighlightDetectionProvider = GeminiHighlightDetectionProvider;