'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { createProject, simulateProcessing } from '@/lib/projectStore';

export default function NewProjectPage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type.startsWith('video/')) {
      setFile(droppedFile);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemoveFile = () => {
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !file) return;

    setIsCreating(true);

    // Create project
    const project = createProject({
      title: title.trim(),
      description: description.trim(),
      videoUrl: URL.createObjectURL(file), // In production, upload to cloud storage
    });

    // Start processing simulation
    simulateProcessing(project.id);

    // Redirect to project details
    router.push(`/dashboard/${project.id}`);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="min-h-screen bg-mono-black">
      {/* Header */}
      <header className="border-b border-mono-silver/15 py-8 px-8">
        <div className="container mx-auto max-w-4xl flex items-center justify-between">
          <div>
            <h1 className="font-montserrat font-bold text-3xl text-mono-white mb-2">
              Create New Project
            </h1>
            <p className="font-inter text-mono-silver">
              Upload your video and let AI create cinematic highlights
            </p>
          </div>
          <button
            onClick={() => router.push('/dashboard')}
            className="font-inter text-sm text-mono-silver hover:text-mono-white transition-colors"
          >
            ← Back
          </button>
        </div>
      </header>

      {/* Form */}
      <main className="px-8 py-12">
        <form onSubmit={handleSubmit} className="container mx-auto max-w-4xl space-y-8">
          {/* Title Input */}
          <div className="animate-fade-up">
            <label
              htmlFor="title"
              className="block font-montserrat font-semibold text-sm text-mono-white mb-3"
            >
              Project Title *
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Weekend Vlog, Wedding Footage"
              className="w-full bg-mono-slate/30 border border-mono-silver/20 rounded px-6 py-4
                text-mono-white placeholder-mono-silver/50 font-inter text-lg
                focus:border-mono-white/40 focus:outline-none transition-colors"
              required
            />
          </div>

          {/* Description Input */}
          <div className="animate-fade-up animation-delay-200">
            <label
              htmlFor="description"
              className="block font-montserrat font-semibold text-sm text-mono-white mb-3"
            >
              Description <span className="text-mono-silver/50">(optional)</span>
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add context about your video..."
              rows={4}
              className="w-full bg-mono-slate/30 border border-mono-silver/20 rounded px-6 py-4
                text-mono-white placeholder-mono-silver/50 font-inter text-lg resize-none
                focus:border-mono-white/40 focus:outline-none transition-colors"
            />
          </div>

          {/* File Upload */}
          <div className="animate-fade-up animation-delay-400">
            <label className="block font-montserrat font-semibold text-sm text-mono-white mb-3">
              Video File *
            </label>

            {!file ? (
              <div
                onDragEnter={handleDragEnter}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={handleBrowseClick}
                className={`
                  relative border-[1.5px] border-dashed rounded-lg p-16 md:p-24
                  transition-all duration-500 cursor-pointer
                  shadow-[inset_0_0_60px_rgba(255,255,255,0.03)]
                  shadow-[inset_0_0_40px_rgba(0,0,0,0.6)]
                  animate-breathe
                  ${
                    isDragging
                      ? 'border-mono-white bg-mono-white/10 scale-[1.02]'
                      : 'border-mono-silver hover:border-mono-white hover:bg-mono-white/5'
                  }
                `}
              >
                {/* Radial Glow */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-[600px] h-[400px] bg-mono-white/[0.02] blur-[100px] rounded-full" />
                </div>

                <div className="text-center space-y-6 relative z-10">
                  {/* Upload Icon */}
                  <div
                    className={`transition-transform duration-300 ${isDragging ? 'translate-y-[-3px]' : ''}`}
                  >
                    <svg
                      className="w-32 h-32 mx-auto stroke-mono-silver"
                      viewBox="0 0 64 64"
                      fill="none"
                      strokeWidth="1.5"
                      style={{ transform: 'rotate(45deg)' }}
                    >
                      <rect x="16" y="16" width="32" height="32" />
                      <line x1="32" y1="16" x2="32" y2="48" />
                      <line x1="16" y1="32" x2="48" y2="32" />
                      <path
                        d="M32 8 L32 16 M32 48 L32 56 M8 32 L16 32 M48 32 L56 32"
                        strokeWidth="2"
                      />
                    </svg>
                  </div>

                  {/* Text */}
                  <div>
                    <p className="font-montserrat font-semibold text-2xl md:text-3xl mb-3">
                      {isDragging ? 'Drop your video here' : 'Drag & drop your video'}
                    </p>
                    <p className="font-inter text-lg text-mono-silver/80">
                      or <span className="underline">browse files</span>
                    </p>
                  </div>

                  {/* Accepted Formats */}
                  <p className="font-inter text-sm text-mono-silver/60">
                    Supported formats: MP4, MOV, AVI • Max 500MB
                  </p>
                </div>

                {/* Hidden File Input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="video/mp4,video/quicktime,video/x-msvideo"
                  className="hidden"
                  onChange={handleFileSelect}
                />
              </div>
            ) : (
              <div className="relative border-[1.5px] border-solid border-mono-white rounded-lg p-16 md:p-24 animate-[fadeIn_0.8s_ease-out]">
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-[600px] h-[400px] bg-mono-white/[0.02] blur-[100px] rounded-full" />
                </div>
                <div className="text-center space-y-6 relative z-10">
                  <svg
                    className="w-24 h-24 mx-auto stroke-mono-white"
                    viewBox="0 0 64 64"
                    fill="none"
                    strokeWidth="1.5"
                  >
                    <path d="M16 20 L32 36 L48 20 M32 36 L32 48 M16 44 L48 44" />
                    <rect x="8" y="12" width="48" height="40" rx="4" ry="4" />
                  </svg>
                  <div>
                    <p className="font-montserrat font-semibold text-2xl md:text-3xl mb-3">
                      {file.name}
                    </p>
                    <p className="font-inter text-lg text-mono-silver/80">
                      {formatFileSize(file.size)}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveFile}
                    className="mt-4 font-inter text-sm text-mono-silver hover:text-mono-white transition-colors flex items-center justify-center mx-auto"
                  >
                    <svg
                      className="w-4 h-4 mr-2 stroke-mono-silver"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                    Remove
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="pt-8 animate-fade-up animation-delay-600">
            <button
              type="submit"
              disabled={!title.trim() || !file || isCreating}
              className="w-full bg-mono-white text-mono-black font-montserrat font-semibold 
                px-12 py-5 text-lg rounded hover:bg-mono-silver hover:shadow-lg hover:-translate-y-1
                transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed
                disabled:hover:translate-y-0 disabled:hover:shadow-none"
            >
              {isCreating ? 'Creating Project...' : 'Create Project & Start Processing'}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
