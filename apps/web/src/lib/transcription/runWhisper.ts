/**
 * OpenAI Whisper API integration for video transcription
 */

export interface WordTimestamp {
  word: string;
  start: number; // seconds
  end: number; // seconds
  confidence?: number;
}

export interface TranscriptSegment {
  id: number;
  text: string;
  start: number;
  end: number;
  words?: WordTimestamp[];
}

export interface WhisperResponse {
  text: string; // Full transcript
  segments: TranscriptSegment[];
  language: string;
  duration: number;
}

/**
 * Transcribe audio using OpenAI Whisper API
 * 
 * @param audioBlob - Audio/video file blob
 * @param options - Transcription options
 * @returns Transcript with word-level timestamps
 */
export async function transcribeWithWhisper(
  audioBlob: Blob,
  options: {
    language?: string;
    prompt?: string;
    temperature?: number;
    responseFormat?: 'json' | 'text' | 'srt' | 'vtt' | 'verbose_json';
    timestampGranularities?: ('word' | 'segment')[];
  } = {}
): Promise<WhisperResponse> {
  const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY;
  
  if (!apiKey) {
    console.warn('OpenAI API key not found. Using fallback transcription.');
    return generateFallbackTranscript(audioBlob);
  }

  try {
    const formData = new FormData();
    formData.append('file', audioBlob, 'audio.mp4');
    formData.append('model', 'whisper-1');
    formData.append('response_format', 'verbose_json');
    formData.append('timestamp_granularities[]', 'word');
    formData.append('timestamp_granularities[]', 'segment');
    
    if (options.language) {
      formData.append('language', options.language);
    }
    
    if (options.prompt) {
      formData.append('prompt', options.prompt);
    }

    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(`Whisper API error: ${error.error || response.statusText}`);
    }

    const data = await response.json();
    
    // Parse Whisper response
    return {
      text: data.text || '',
      segments: data.segments || [],
      language: data.language || 'en',
      duration: data.duration || 0,
    };
  } catch (error) {
    console.error('Whisper transcription failed:', error);
    // Fallback to mock transcript
    return generateFallbackTranscript(audioBlob);
  }
}

/**
 * Generate fallback transcript for development/testing
 * This is used when Whisper API is unavailable
 */
function generateFallbackTranscript(_audioBlob: Blob): WhisperResponse {
  // Generate fake transcript for development
  const fakeSentences = [
    "Welcome to this video demonstration.",
    "Today we're going to show you something amazing.",
    "This is the main point of our presentation.",
    "As you can see, the results are quite impressive.",
    "We believe this will make a significant impact.",
    "Thank you for watching, and please subscribe.",
  ];

  const segments: TranscriptSegment[] = [];
  let currentTime = 0;
  let segmentId = 0;

  for (const sentence of fakeSentences) {
    const words = sentence.split(' ');
    const wordTimestamps: WordTimestamp[] = [];
    
    for (const word of words) {
      const duration = 0.3 + Math.random() * 0.3; // 0.3-0.6s per word
      wordTimestamps.push({
        word: word,
        start: currentTime,
        end: currentTime + duration,
        confidence: 0.95 + Math.random() * 0.05,
      });
      currentTime += duration;
    }

    segments.push({
      id: segmentId++,
      text: sentence,
      start: wordTimestamps[0].start,
      end: wordTimestamps[wordTimestamps.length - 1].end,
      words: wordTimestamps,
    });

    currentTime += 0.5; // Pause between sentences
  }

  return {
    text: fakeSentences.join(' '),
    segments,
    language: 'en',
    duration: currentTime,
  };
}

/**
 * Extract word-level timestamps from Whisper response
 */
export function extractWordTimestamps(response: WhisperResponse): WordTimestamp[] {
  const allWords: WordTimestamp[] = [];
  
  for (const segment of response.segments) {
    if (segment.words && segment.words.length > 0) {
      allWords.push(...segment.words);
    } else {
      // If no word-level timestamps, split by spaces and estimate
      const words = segment.text.trim().split(/\s+/);
      const segmentDuration = segment.end - segment.start;
      const timePerWord = segmentDuration / words.length;
      
      words.forEach((word, i) => {
        allWords.push({
          word,
          start: segment.start + (i * timePerWord),
          end: segment.start + ((i + 1) * timePerWord),
        });
      });
    }
  }
  
  return allWords;
}

/**
 * Get transcript text for a specific time range
 */
export function getTranscriptForTimeRange(
  response: WhisperResponse,
  startTime: number,
  endTime: number
): string {
  const relevantWords = extractWordTimestamps(response).filter(
    w => w.start >= startTime && w.end <= endTime
  );
  
  return relevantWords.map(w => w.word).join(' ');
}

