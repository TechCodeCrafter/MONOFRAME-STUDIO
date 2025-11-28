'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';

export default function LiveDemoPage() {
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [activeTab, setActiveTab] = useState<'clips' | 'media' | 'notes'>('clips');
    const [selectedClip, setSelectedClip] = useState(0);
    const videoRef = useRef<HTMLVideoElement>(null);

    const duration = 120; // 2 minutes fake duration

    // Fake clip data
    const fakeClips = [
        {
            id: 1,
            title: 'Opening Scene',
            duration: '0:12',
            score: 94,
            thumbnail: '/api/placeholder/200/112',
            color: 'from-blue-500/20 to-purple-500/20',
        },
        {
            id: 2,
            title: 'Emotional Peak',
            duration: '0:18',
            score: 92,
            thumbnail: '/api/placeholder/200/112',
            color: 'from-pink-500/20 to-red-500/20',
        },
        {
            id: 3,
            title: 'Action Sequence',
            duration: '0:08',
            score: 88,
            thumbnail: '/api/placeholder/200/112',
            color: 'from-orange-500/20 to-yellow-500/20',
        },
    ];

    // Fake timeline clips
    const timelineClips = [
        { start: 0, end: 30, label: 'Opening', color: 'bg-blue-500/40' },
        { start: 35, end: 70, label: 'Main', color: 'bg-purple-500/40' },
        { start: 75, end: 100, label: 'Climax', color: 'bg-pink-500/40' },
        { start: 105, end: 120, label: 'Outro', color: 'bg-orange-500/40' },
    ];

    // Fake play/pause
    const togglePlayPause = () => {
        setIsPlaying(!isPlaying);
    };

    // Fake timeline scrub
    const handleTimelineClick = (e: React.MouseEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const percentage = x / rect.width;
        setCurrentTime(percentage * duration);
    };

    // Simulate playback
    useEffect(() => {
        if (!isPlaying) return;

        const interval = setInterval(() => {
            setCurrentTime((prev) => {
                if (prev >= duration) {
                    setIsPlaying(false);
                    return 0;
                }
                return prev + 0.1;
            });
        }, 100);

        return () => clearInterval(interval);
    }, [isPlaying]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="h-screen bg-[#080808] text-white flex flex-col overflow-hidden">
            {/* TOP BAR */}
            <header className="h-14 bg-[#080808] border-b border-white/5 flex items-center justify-between px-6 flex-shrink-0">
                <div className="flex items-center space-x-3">
                    <svg
                        className="w-7 h-7 stroke-white"
                        viewBox="0 0 64 64"
                        fill="none"
                        strokeWidth="1.5"
                    >
                        <rect x="8" y="8" width="48" height="48" />
                        <line x1="32" y1="8" x2="32" y2="56" />
                        <line x1="8" y1="32" x2="56" y2="32" />
                    </svg>
                    <div>
                        <h1 className="font-montserrat font-bold text-sm">MONOFRAME</h1>
                        <p className="text-[10px] text-white/40 uppercase tracking-wider">Live Demo</p>
                    </div>
                </div>

                <div className="flex items-center space-x-2">
                    <button className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded text-sm font-medium transition-colors border border-white/10">
                        AI Tools
                    </button>
                    <button className="px-4 py-2 bg-white text-black hover:bg-white/90 rounded text-sm font-semibold transition-colors">
                        Export
                    </button>
                    <Link
                        href="/"
                        className="px-4 py-2 text-white/60 hover:text-white text-sm font-medium transition-colors"
                    >
                        Back to Site
                    </Link>
                </div>
            </header>

            {/* MAIN LAYOUT */}
            <div className="flex-1 flex overflow-hidden">
                {/* LEFT PANEL */}
                <aside className="w-[280px] bg-[#0a0a0a] border-r border-white/5 flex flex-col">
                    {/* Tabs */}
                    <div className="flex border-b border-white/5">
                        {(['clips', 'media', 'notes'] as const).map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`flex-1 py-3 text-xs font-medium uppercase tracking-wider transition-colors ${activeTab === tab
                                        ? 'text-white border-b-2 border-white'
                                        : 'text-white/40 hover:text-white/60'
                                    }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>

                    {/* Clip List */}
                    {activeTab === 'clips' && (
                        <div className="flex-1 overflow-y-auto p-4 space-y-3">
                            {fakeClips.map((clip, idx) => (
                                <button
                                    key={clip.id}
                                    onClick={() => setSelectedClip(idx)}
                                    className={`w-full bg-gradient-to-br ${clip.color} rounded-lg overflow-hidden border transition-all group hover:scale-[1.02] ${selectedClip === idx
                                            ? 'border-white/40 shadow-[0_0_20px_rgba(255,255,255,0.15)]'
                                            : 'border-white/10 hover:border-white/30'
                                        }`}
                                >
                                    {/* Thumbnail */}
                                    <div className="aspect-video bg-black/50 flex items-center justify-center relative">
                                        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent" />
                                        <svg
                                            className="w-8 h-8 text-white/20"
                                            viewBox="0 0 24 24"
                                            fill="currentColor"
                                        >
                                            <polygon points="5,3 19,12 5,21" />
                                        </svg>
                                    </div>

                                    {/* Info */}
                                    <div className="p-3 text-left">
                                        <div className="flex items-center justify-between mb-1">
                                            <h3 className="font-semibold text-sm">{clip.title}</h3>
                                            <span className="text-xs text-white/60">{clip.score}</span>
                                        </div>
                                        <p className="text-xs text-white/40">{clip.duration}</p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}

                    {activeTab === 'media' && (
                        <div className="flex-1 flex items-center justify-center text-white/40 text-sm">
                            Media Library (Demo)
                        </div>
                    )}

                    {activeTab === 'notes' && (
                        <div className="flex-1 p-4 space-y-3">
                            <div className="text-xs text-white/60 space-y-2">
                                <p className="font-medium text-white/80">AI Notes:</p>
                                <p>• Opening establishes mood effectively</p>
                                <p>• Peak emotional moment at 0:42</p>
                                <p>• Consider tighter cuts in action</p>
                            </div>
                        </div>
                    )}
                </aside>

                {/* CENTER + RIGHT CONTAINER */}
                <div className="flex-1 flex flex-col">
                    {/* VIDEO + RIGHT PANEL ROW */}
                    <div className="flex-1 flex overflow-hidden">
                        {/* CENTER PANEL - VIDEO */}
                        <div className="flex-1 flex flex-col bg-[#0b0b0b] p-6">
                            {/* Video Preview */}
                            <div className="flex-1 flex items-center justify-center">
                                <div className="w-full max-w-5xl aspect-video bg-black rounded-xl overflow-hidden border border-white/10 relative group shadow-[0_0_40px_rgba(0,0,0,0.5)]">
                                    {/* Fake Video Content */}
                                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10" />
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="text-center">
                                            <div className="w-32 h-32 rounded-full bg-white/5 border-2 border-white/20 flex items-center justify-center mb-4 mx-auto">
                                                <svg
                                                    className="w-12 h-12 text-white/40"
                                                    viewBox="0 0 24 24"
                                                    fill="currentColor"
                                                >
                                                    <polygon points="5,3 19,12 5,21" />
                                                </svg>
                                            </div>
                                            <p className="text-white/40 text-sm">Demo Video Placeholder</p>
                                        </div>
                                    </div>

                                    {/* Play/Pause Overlay */}
                                    <button
                                        onClick={togglePlayPause}
                                        className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 hover:opacity-100 transition-opacity z-10"
                                    >
                                        <div className="w-20 h-20 rounded-full bg-white/10 backdrop-blur-sm border-2 border-white flex items-center justify-center hover:bg-white/20 transition-all ring-[3px] ring-white/40">
                                            {isPlaying ? (
                                                <svg className="w-8 h-8" viewBox="0 0 24 24" fill="white">
                                                    <rect x="6" y="4" width="4" height="16" />
                                                    <rect x="14" y="4" width="4" height="16" />
                                                </svg>
                                            ) : (
                                                <svg className="w-8 h-8 ml-1" viewBox="0 0 24 24" fill="white">
                                                    <polygon points="5,3 19,12 5,21" />
                                                </svg>
                                            )}
                                        </div>
                                    </button>

                                    {/* Playback Indicator */}
                                    {isPlaying && (
                                        <div className="absolute top-4 left-4 bg-red-500 text-white text-xs px-2 py-1 rounded flex items-center space-x-1">
                                            <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                                            <span>LIVE</span>
                                        </div>
                                    )}

                                    {/* Time Display */}
                                    <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-sm text-white text-sm px-3 py-1 rounded font-mono">
                                        {formatTime(currentTime)} / {formatTime(duration)}
                                    </div>
                                </div>
                            </div>

                            {/* Video Controls */}
                            <div className="mt-4 flex items-center justify-center space-x-4">
                                <button
                                    onClick={togglePlayPause}
                                    className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center transition-colors"
                                >
                                    {isPlaying ? (
                                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="white">
                                            <rect x="6" y="4" width="4" height="16" />
                                            <rect x="14" y="4" width="4" height="16" />
                                        </svg>
                                    ) : (
                                        <svg className="w-5 h-5 ml-0.5" viewBox="0 0 24 24" fill="white">
                                            <polygon points="5,3 19,12 5,21" />
                                        </svg>
                                    )}
                                </button>

                                <div className="flex items-center space-x-2 text-xs text-white/40">
                                    <button className="hover:text-white transition-colors p-2">
                                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <polygon points="11 19 2 12 11 5 11 19" />
                                            <polygon points="22 19 13 12 22 5 22 19" />
                                        </svg>
                                    </button>
                                    <button className="hover:text-white transition-colors p-2">
                                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <polygon points="13 19 22 12 13 5 13 19" />
                                            <polygon points="2 19 11 12 2 5 2 19" />
                                        </svg>
                                    </button>
                                </div>

                                <div className="flex items-center space-x-2">
                                    <button className="px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded text-xs transition-colors">
                                        Cut
                                    </button>
                                    <button className="px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded text-xs transition-colors">
                                        Trim
                                    </button>
                                    <button className="px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded text-xs transition-colors">
                                        Split
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* RIGHT PANEL - AI INSIGHTS */}
                        <aside className="w-[300px] bg-[#0a0a0a] border-l border-white/5 overflow-y-auto">
                            <div className="p-4 space-y-6">
                                {/* AI Insights Section */}
                                <div>
                                    <h3 className="text-lg font-medium text-white/70 mb-4 flex items-center">
                                        <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M12 2L2 7l10 5 10-5-10-5z" />
                                            <path d="M2 17l10 5 10-5M2 12l10 5 10-5" />
                                        </svg>
                                        AI Insights
                                    </h3>
                                    <div className="space-y-3">
                                        {[
                                            { label: 'Emotional Score', value: 92, color: 'from-pink-500 to-red-500' },
                                            { label: 'Scene Tension', value: 88, color: 'from-purple-500 to-blue-500' },
                                            { label: 'Motion Score', value: 84, color: 'from-orange-500 to-yellow-500' },
                                            { label: 'Audio Energy', value: 90, color: 'from-green-500 to-teal-500' },
                                        ].map((metric) => (
                                            <div key={metric.label} className="space-y-1">
                                                <div className="flex items-center justify-between text-xs">
                                                    <span className="text-white/60">{metric.label}</span>
                                                    <span className="font-semibold">{metric.value}</span>
                                                </div>
                                                <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full bg-gradient-to-r ${metric.color}`}
                                                        style={{ width: `${metric.value}%` }}
                                                    />
                                                </div>
                                            </div>
                                        ))}

                                        <div className="pt-3 border-t border-white/5 space-y-2 text-xs">
                                            <div className="flex justify-between">
                                                <span className="text-white/60">Lighting Mood</span>
                                                <span className="font-medium">Dramatic</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-white/60">Pacing</span>
                                                <span className="font-medium">Dynamic</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-white/60">Color Grade</span>
                                                <span className="font-medium">Cinematic</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* AI Suggestions */}
                                <div>
                                    <h3 className="text-lg font-medium text-white/70 mb-4 flex items-center">
                                        <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                        </svg>
                                        AI Cut Suggestions
                                    </h3>
                                    <div className="space-y-2">
                                        {[
                                            'Trim 0:34 → 0:51 for tighter pacing',
                                            'Increase contrast in Frame 14-24',
                                            'Add soft music for emotional boost',
                                            'Consider split-screen at 1:08',
                                        ].map((suggestion, idx) => (
                                            <div
                                                key={idx}
                                                className="p-3 bg-white/5 rounded-lg border border-white/10 hover:border-white/20 transition-colors text-xs text-white/80"
                                            >
                                                {suggestion}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Scene Graph */}
                                <div>
                                    <h3 className="text-lg font-medium text-white/70 mb-4">Scene Graph</h3>
                                    <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                                        <svg className="w-full h-32" viewBox="0 0 200 80">
                                            <path
                                                d="M 0 60 Q 25 40, 50 50 T 100 45 T 150 55 T 200 40"
                                                fill="none"
                                                stroke="rgba(255,255,255,0.3)"
                                                strokeWidth="2"
                                            />
                                            <path
                                                d="M 0 60 Q 25 40, 50 50 T 100 45 T 150 55 T 200 40"
                                                fill="none"
                                                stroke="rgba(255,255,255,0.6)"
                                                strokeWidth="2"
                                                strokeDasharray="4 4"
                                                className="animate-pulse"
                                            />
                                        </svg>
                                        <p className="text-xs text-white/40 text-center mt-2">Emotion Flow</p>
                                    </div>
                                </div>
                            </div>
                        </aside>
                    </div>

                    {/* BOTTOM TIMELINE */}
                    <div className="h-48 bg-[#0b0b0b] border-t border-white/5 flex flex-col">
                        <div className="flex-1 p-4">
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="text-xs font-medium text-white/60 uppercase tracking-wider">Timeline</h3>
                                <div className="flex items-center space-x-2 text-xs text-white/40">
                                    <button className="hover:text-white transition-colors">1x</button>
                                    <span>•</span>
                                    <button className="hover:text-white transition-colors">2x</button>
                                    <span>•</span>
                                    <button className="hover:text-white transition-colors">4x</button>
                                </div>
                            </div>

                            {/* Timeline Track */}
                            <div
                                onClick={handleTimelineClick}
                                className="relative h-20 bg-black/50 rounded-lg border border-white/10 overflow-hidden cursor-pointer group"
                            >
                                {/* Waveform (Fake) */}
                                <div className="absolute inset-0 flex items-center justify-around px-1 opacity-20">
                                    {Array.from({ length: 60 }).map((_, i) => (
                                        <div
                                            key={i}
                                            className="w-[2px] bg-white/60 rounded-full"
                                            style={{ height: `${Math.random() * 70 + 10}%` }}
                                        />
                                    ))}
                                </div>

                                {/* Timeline Clips */}
                                {timelineClips.map((clip, idx) => (
                                    <div
                                        key={idx}
                                        className={`absolute inset-y-2 ${clip.color} rounded border border-white/20 flex items-center justify-center text-xs font-medium hover:border-white/40 transition-colors`}
                                        style={{
                                            left: `${(clip.start / duration) * 100}%`,
                                            width: `${((clip.end - clip.start) / duration) * 100}%`,
                                        }}
                                    >
                                        {clip.label}
                                    </div>
                                ))}

                                {/* Playhead */}
                                <div
                                    className="absolute inset-y-0 w-0.5 bg-white shadow-[0_0_10px_rgba(255,255,255,0.8)] pointer-events-none"
                                    style={{ left: `${(currentTime / duration) * 100}%` }}
                                >
                                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-full">
                                        <div className="w-3 h-3 bg-white rounded-full shadow-lg" />
                                    </div>
                                </div>

                                {/* Time Markers */}
                                <div className="absolute inset-x-0 bottom-0 flex justify-between px-2 pb-1 text-[10px] text-white/30 pointer-events-none">
                                    {[0, 30, 60, 90, 120].map((time) => (
                                        <span key={time}>{formatTime(time)}</span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

