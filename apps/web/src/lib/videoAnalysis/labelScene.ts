/**
 * AI-powered scene labeling using OpenAI Vision API
 */

export interface SceneLabel {
  title: string; // 2-5 words
  description: string; // 1 sentence
  emotion: string; // 1-2 words
  subject: string; // person/object/environment
}

/**
 * Extract middle frame from video segment
 */
async function extractMiddleFrame(
  videoUrl: string,
  startTime: number,
  endTime: number
): Promise<string> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.src = videoUrl;
    video.crossOrigin = 'anonymous';
    
    const middleTime = (startTime + endTime) / 2;
    
    video.onloadedmetadata = () => {
      video.currentTime = middleTime;
    };
    
    video.onseeked = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = 512; // Higher res for AI analysis
        canvas.height = Math.round((video.videoHeight / video.videoWidth) * 512);
        
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }
        
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const base64 = canvas.toDataURL('image/png').split(',')[1]; // Remove data:image/png;base64,
        resolve(base64);
      } catch (error) {
        reject(error);
      }
    };
    
    video.onerror = () => reject(new Error('Failed to load video'));
  });
}

/**
 * Call OpenAI Vision API to label scene
 */
async function callOpenAIVision(base64Image: string): Promise<SceneLabel> {
  const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY;
  
  if (!apiKey) {
    // Fallback for demo without API key
    return generateFallbackLabel();
  }
  
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `Analyze this video frame and provide:
1. A scene title (2-5 words, cinematic style)
2. A short description (1 sentence describing what's happening)
3. The dominant emotion (1-2 words: happy, tense, calm, energetic, dramatic, peaceful, etc.)
4. The main subject (person, object, landscape, indoor, outdoor, etc.)

Format your response as JSON:
{
  "title": "...",
  "description": "...",
  "emotion": "...",
  "subject": "..."
}`,
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:image/png;base64,${base64Image}`,
                },
              },
            ],
          },
        ],
        max_tokens: 300,
        temperature: 0.7,
      }),
    });
    
    if (!response.ok) {
      console.error('OpenAI API error:', response.statusText);
      return generateFallbackLabel();
    }
    
    const data = await response.json();
    const content = data.choices[0]?.message?.content;
    
    if (!content) {
      return generateFallbackLabel();
    }
    
    // Parse JSON response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        title: parsed.title || 'Untitled Scene',
        description: parsed.description || 'A video scene.',
        emotion: parsed.emotion || 'neutral',
        subject: parsed.subject || 'unknown',
      };
    }
    
    return generateFallbackLabel();
  } catch (error) {
    console.error('Failed to call OpenAI Vision API:', error);
    return generateFallbackLabel();
  }
}

/**
 * Generate fallback label when API unavailable
 */
function generateFallbackLabel(): SceneLabel {
  const titles = [
    'Opening Moment',
    'Character Focus',
    'Action Sequence',
    'Dialogue Scene',
    'Establishing Shot',
    'Emotional Beat',
    'Transition',
    'Key Moment',
    'Closing Scene',
  ];
  
  const descriptions = [
    'A carefully composed scene capturing the moment.',
    'Visual storytelling unfolds naturally.',
    'The narrative progresses with intention.',
    'Details emerge through cinematic framing.',
    'Characters and environment interact dynamically.',
    'The scene establishes mood and context.',
    'Motion and emotion combine seamlessly.',
    'A pivotal moment in the sequence.',
  ];
  
  const emotions = [
    'calm', 'energetic', 'tense', 'peaceful',
    'dramatic', 'intimate', 'dynamic', 'contemplative',
  ];
  
  const subjects = [
    'person', 'landscape', 'indoor', 'outdoor',
    'object', 'group', 'environment', 'close-up',
  ];
  
  return {
    title: titles[Math.floor(Math.random() * titles.length)],
    description: descriptions[Math.floor(Math.random() * descriptions.length)],
    emotion: emotions[Math.floor(Math.random() * emotions.length)],
    subject: subjects[Math.floor(Math.random() * subjects.length)],
  };
}

/**
 * Label a video segment using AI vision
 * @param videoUrl - URL of the video (blob URL)
 * @param startTime - Segment start time in seconds
 * @param endTime - Segment end time in seconds
 * @returns Scene label with title, description, emotion, and subject
 */
export async function labelScene(
  videoUrl: string,
  startTime: number,
  endTime: number
): Promise<SceneLabel> {
  try {
    // Extract middle frame
    const base64Image = await extractMiddleFrame(videoUrl, startTime, endTime);
    
    // Call OpenAI Vision API
    const label = await callOpenAIVision(base64Image);
    
    return label;
  } catch (error) {
    console.error('Scene labeling failed:', error);
    return generateFallbackLabel();
  }
}

