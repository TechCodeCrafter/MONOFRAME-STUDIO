// Project Store - localStorage-based project management

export interface Clip {
  id: number;
  title: string;
  timestamp: string;
  score: number;
  duration: number;
  videoUrl: string;
  startTime: number;
  endTime: number;
  thumbnailUrl?: string;
  analysis: {
    emotionalScore: number;
    sceneTension: number;
    audioEnergy: number;
    motionScore: number;
    shotStability: number;
    cinematicRhythm: number;
    pacing: string;
    lighting: string;
    colorGrade: string;
  };
}

export interface Project {
  id: string;
  title: string;
  description?: string;
  status: 'uploaded' | 'processing' | 'processed';
  createdAt: string;
  updatedAt: string;
  thumbnailUrl?: string;
  videoUrl?: string;
  clips?: Clip[];
  summary?: {
    totalClips: number;
    avgScore: number;
    totalDuration: number;
  };
}

const STORAGE_KEY = 'monoframe_projects';

// Get all projects
export function getProjects(): Project[] {
  if (typeof window === 'undefined') return [];

  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error reading projects:', error);
    return [];
  }
}

// Get project by ID
export function getProjectById(id: string): Project | null {
  const projects = getProjects();
  return projects.find((p) => p.id === id) || null;
}

// Create new project
export function createProject(data: {
  title: string;
  description?: string;
  videoUrl?: string;
}): Project {
  const projects = getProjects();

  const newProject: Project = {
    id: `project_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    title: data.title,
    description: data.description,
    status: 'uploaded',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    videoUrl: data.videoUrl,
  };

  projects.unshift(newProject);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));

  return newProject;
}

// Update project
export function updateProject(id: string, updates: Partial<Project>): Project | null {
  const projects = getProjects();
  const index = projects.findIndex((p) => p.id === id);

  if (index === -1) return null;

  projects[index] = {
    ...projects[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
  return projects[index];
}

// Delete project
export function deleteProject(id: string): boolean {
  const projects = getProjects();
  const filtered = projects.filter((p) => p.id !== id);

  if (filtered.length === projects.length) return false;

  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  return true;
}

// Generate mock clips for processed projects
export function generateMockClips(videoUrl?: string): Clip[] {
  return [
    {
      id: 1,
      title: 'Emotional Peak #1',
      timestamp: '00:34 - 00:52',
      score: 94,
      duration: 18,
      videoUrl:
        videoUrl || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      startTime: 34,
      endTime: 52,
      analysis: {
        emotionalScore: 94,
        sceneTension: 87,
        audioEnergy: 92,
        motionScore: 88,
        shotStability: 91,
        cinematicRhythm: 89,
        pacing: 'Dynamic',
        lighting: 'Dramatic',
        colorGrade: 'Vibrant',
      },
    },
    {
      id: 2,
      title: 'Highlight Moment #2',
      timestamp: '01:12 - 01:28',
      score: 89,
      duration: 16,
      videoUrl:
        videoUrl || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
      startTime: 72,
      endTime: 88,
      analysis: {
        emotionalScore: 89,
        sceneTension: 91,
        audioEnergy: 85,
        motionScore: 82,
        shotStability: 94,
        cinematicRhythm: 87,
        pacing: 'Intense',
        lighting: 'Moody',
        colorGrade: 'Desaturated',
      },
    },
    {
      id: 3,
      title: 'Peak Scene #3',
      timestamp: '02:45 - 03:03',
      score: 91,
      duration: 18,
      videoUrl:
        videoUrl || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      startTime: 165,
      endTime: 183,
      analysis: {
        emotionalScore: 91,
        sceneTension: 78,
        audioEnergy: 88,
        motionScore: 95,
        shotStability: 86,
        cinematicRhythm: 92,
        pacing: 'Fast',
        lighting: 'Balanced',
        colorGrade: 'Cinematic',
      },
    },
  ];
}

// Simulate processing (call this after creating project)
export function simulateProcessing(
  projectId: string,
  onComplete?: (project: Project) => void
): void {
  // Update to processing
  updateProject(projectId, { status: 'processing' });

  // After 3 seconds, mark as processed and add clips
  setTimeout(() => {
    // Get the project to access its video URL
    const project = getProjectById(projectId);
    const projectVideoUrl = project?.videoUrl;

    // Generate clips using the project's video URL
    const clips = generateMockClips(projectVideoUrl);
    const summary = {
      totalClips: clips.length,
      avgScore: Math.round(clips.reduce((sum, c) => sum + c.score, 0) / clips.length),
      totalDuration: clips.reduce((sum, c) => sum + c.duration, 0),
    };

    const updatedProject = updateProject(projectId, {
      status: 'processed',
      clips,
      summary,
    });

    if (onComplete && updatedProject) {
      onComplete(updatedProject);
    }
  }, 3000);
}

// Create or get demo project for live editor demo
export function createOrGetDemoProject(): Project {
  const DEMO_PROJECT_ID = 'demo_project';

  // Check if demo project already exists
  const existingProject = getProjectById(DEMO_PROJECT_ID);
  if (existingProject) {
    return existingProject;
  }

  // Create demo clips with realistic analysis data
  const demoClips: Clip[] = [
    {
      id: 1,
      title: 'Emotional Peak #1',
      timestamp: '00:05 - 00:18',
      score: 92,
      duration: 13,
      videoUrl: '/demo.mp4',
      startTime: 5,
      endTime: 18,
      analysis: {
        emotionalScore: 92,
        sceneTension: 85,
        audioEnergy: 88,
        motionScore: 90,
        shotStability: 87,
        cinematicRhythm: 91,
        pacing: 'Dynamic',
        lighting: 'Cinematic',
        colorGrade: 'Warm',
      },
    },
    {
      id: 2,
      title: 'Motion Build #2',
      timestamp: '00:22 - 00:35',
      score: 88,
      duration: 13,
      videoUrl: '/demo.mp4',
      startTime: 22,
      endTime: 35,
      analysis: {
        emotionalScore: 81,
        sceneTension: 90,
        audioEnergy: 86,
        motionScore: 94,
        shotStability: 82,
        cinematicRhythm: 89,
        pacing: 'Intense',
        lighting: 'Dramatic',
        colorGrade: 'Cool',
      },
    },
    {
      id: 3,
      title: 'Final Hit #3',
      timestamp: '00:40 - 00:52',
      score: 95,
      duration: 12,
      videoUrl: '/demo.mp4',
      startTime: 40,
      endTime: 52,
      analysis: {
        emotionalScore: 95,
        sceneTension: 88,
        audioEnergy: 93,
        motionScore: 87,
        shotStability: 91,
        cinematicRhythm: 94,
        pacing: 'Explosive',
        lighting: 'High Contrast',
        colorGrade: 'Vibrant',
      },
    },
  ];

  // Calculate summary
  const summary = {
    totalClips: demoClips.length,
    avgScore: Math.round(demoClips.reduce((sum, c) => sum + c.score, 0) / demoClips.length),
    totalDuration: demoClips.reduce((sum, c) => sum + c.duration, 0),
  };

  // Create the demo project
  const demoProject: Project = {
    id: DEMO_PROJECT_ID,
    title: 'Demo Reel – City Night',
    description: "Interactive demo showcasing MonoFrame's intelligent editing capabilities",
    status: 'processed',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    videoUrl: '/demo.mp4',
    clips: demoClips,
    summary,
  };

  // Save to localStorage
  const projects = getProjects();
  projects.unshift(demoProject);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));

  return demoProject;
}
