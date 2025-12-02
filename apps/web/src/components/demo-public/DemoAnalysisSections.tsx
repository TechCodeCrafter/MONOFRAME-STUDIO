'use client';

import { Scissors, Activity, TrendingUp, Target } from 'lucide-react';

export function DemoAnalysisSections() {
  // Fake data for demo
  const cutMarkers = [
    { time: '0:12', type: 'Scene Change', confidence: 94 },
    { time: '0:28', type: 'Emotion Peak', confidence: 89 },
    { time: '0:45', type: 'Action Moment', confidence: 96 },
    { time: '1:03', type: 'Scene Change', confidence: 91 },
    { time: '1:24', type: 'Emotion Peak', confidence: 87 },
  ];

  const heatmapData = [
    { label: 'Opening', value: 45, color: 'from-blue-500/20' },
    { label: 'Build-up', value: 72, color: 'from-yellow-500/20' },
    { label: 'Climax', value: 95, color: 'from-red-500/20' },
    { label: 'Resolution', value: 68, color: 'from-green-500/20' },
    { label: 'Ending', value: 42, color: 'from-purple-500/20' },
  ];

  const sceneEnergy = [
    { scene: 1, energy: 65, duration: '24s' },
    { scene: 2, energy: 82, duration: '18s' },
    { scene: 3, energy: 94, duration: '32s' },
    { scene: 4, energy: 71, duration: '26s' },
    { scene: 5, energy: 88, duration: '20s' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-20">
      {/* Section Divider */}
      <div className="w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent mb-20" />

      {/* Section Title */}
      <div className="text-center mb-16">
        <h2 className="text-4xl md:text-5xl font-bold mb-4">AI Analysis Breakdown</h2>
        <p className="text-xl text-white/70 font-inter">
          See how MonoFrame analyzes your footage in real-time
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        {/* Cut Markers */}
        <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
              <Scissors className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-semibold">Cut Markers</h3>
              <p className="text-sm text-white/60 font-inter">Detected optimal cut points</p>
            </div>
          </div>

          <div className="space-y-3">
            {cutMarkers.map((marker, i) => (
              <div 
                key={i} 
                className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-all"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl font-mono text-white/80">{marker.time}</span>
                  <span className="text-sm text-white/60 font-inter">{marker.type}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-16 h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-green-400 rounded-full"
                      style={{ width: `${marker.confidence}%` }}
                    />
                  </div>
                  <span className="text-xs text-green-400 font-semibold">{marker.confidence}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Attention Heatmap */}
        <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-semibold">Attention Heatmap</h3>
              <p className="text-sm text-white/60 font-inter">Viewer engagement prediction</p>
            </div>
          </div>

          <div className="space-y-4">
            {heatmapData.map((item, i) => (
              <div key={i}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-white/80 font-inter">{item.label}</span>
                  <span className="text-sm text-white/60 font-mono">{item.value}%</span>
                </div>
                <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                  <div 
                    className={`h-full bg-gradient-to-r ${item.color} to-white/50 rounded-full transition-all duration-1000`}
                    style={{ width: `${item.value}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Scene Energy Bars */}
      <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-semibold">Scene Energy Analysis</h3>
            <p className="text-sm text-white/60 font-inter">Motion and intensity per scene</p>
          </div>
        </div>

        <div className="flex items-end gap-4 h-48">
          {sceneEnergy.map((scene, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-2">
              <div className="relative w-full flex-1 flex items-end">
                <div 
                  className="w-full bg-gradient-to-t from-white/80 to-white/30 rounded-t-lg transition-all duration-1000 hover:from-white hover:to-white/60 cursor-pointer group"
                  style={{ height: `${scene.energy}%` }}
                >
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/80 px-2 py-1 rounded text-xs whitespace-nowrap">
                    {scene.energy}% • {scene.duration}
                  </div>
                </div>
              </div>
              <span className="text-xs text-white/60 font-mono">Scene {scene.scene}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Motion Tracking Overlay Info */}
      <div className="mt-8 bg-gradient-to-r from-white/5 via-white/10 to-white/5 backdrop-blur-lg border border-white/10 rounded-lg p-6">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
            <Target className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2">Motion Tracking</h3>
            <p className="text-white/70 font-inter text-sm mb-3">
              MonoFrame automatically tracks key subjects across frames to maintain focus and composition in the final edit.
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 bg-white/10 rounded-full text-xs font-semibold">3 Faces Detected</span>
              <span className="px-3 py-1 bg-white/10 rounded-full text-xs font-semibold">2 Objects Tracked</span>
              <span className="px-3 py-1 bg-white/10 rounded-full text-xs font-semibold">Auto-Reframe</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

