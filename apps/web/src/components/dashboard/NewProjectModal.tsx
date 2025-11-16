'use client';

import { useState, useRef } from 'react';

interface NewProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { title: string; description: string }) => void;
}

export default function NewProjectModal({ isOpen, onClose, onSubmit }: NewProjectModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim()) {
      onSubmit({ title, description });
      // Reset form
      setTitle('');
      setDescription('');
      setFile(null);
      onClose();
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-mono-black/90 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div
        className="relative bg-mono-slate border border-mono-silver/20 rounded-lg 
        max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-fade-up"
      >
        {/* Header */}
        <div className="border-b border-mono-silver/15 p-6 flex items-center justify-between">
          <h2 className="font-montserrat font-bold text-2xl text-mono-white">Create New Project</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-mono-white/5 rounded transition-colors"
            aria-label="Close modal"
          >
            <svg
              className="w-6 h-6 stroke-mono-silver hover:stroke-mono-white transition-colors"
              viewBox="0 0 24 24"
              fill="none"
              strokeWidth="2"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Title Input */}
          <div>
            <label
              htmlFor="title"
              className="block font-montserrat font-semibold text-sm text-mono-white mb-2"
            >
              Project Title *
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter project title"
              className="w-full bg-mono-shadow border border-mono-silver/20 rounded px-4 py-3
                text-mono-white placeholder-mono-silver/50 font-inter
                focus:border-mono-white/40 focus:outline-none transition-colors"
              required
            />
          </div>

          {/* Description Input */}
          <div>
            <label
              htmlFor="description"
              className="block font-montserrat font-semibold text-sm text-mono-white mb-2"
            >
              Description <span className="text-mono-silver/50">(optional)</span>
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add project notes or context"
              rows={4}
              className="w-full bg-mono-shadow border border-mono-silver/20 rounded px-4 py-3
                text-mono-white placeholder-mono-silver/50 font-inter resize-none
                focus:border-mono-white/40 focus:outline-none transition-colors"
            />
          </div>

          {/* File Upload Area */}
          <div>
            <label className="block font-montserrat font-semibold text-sm text-mono-white mb-2">
              Video File
            </label>
            <div
              onClick={handleBrowseClick}
              className="border-2 border-dashed border-mono-silver/30 rounded-lg p-8
                hover:border-mono-white/40 hover:bg-mono-white/5 
                transition-all duration-300 cursor-pointer"
            >
              {file ? (
                <div className="text-center">
                  <svg
                    className="w-12 h-12 stroke-mono-white mx-auto mb-3"
                    viewBox="0 0 24 24"
                    fill="none"
                    strokeWidth="1.5"
                  >
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <path d="M12 18v-6" />
                    <path d="m9 15 3-3 3 3" />
                  </svg>
                  <p className="font-montserrat text-mono-white mb-1">{file.name}</p>
                  <p className="font-inter text-sm text-mono-silver">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              ) : (
                <div className="text-center">
                  <svg
                    className="w-12 h-12 stroke-mono-silver/50 mx-auto mb-3"
                    viewBox="0 0 24 24"
                    fill="none"
                    strokeWidth="1.5"
                  >
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                  <p className="font-montserrat text-mono-silver mb-1">
                    Click to upload or drag and drop
                  </p>
                  <p className="font-inter text-sm text-mono-silver/70">
                    MP4, MOV, AVI (max 500MB)
                  </p>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="video/mp4,video/quicktime,video/x-msvideo"
                className="hidden"
                onChange={handleFileSelect}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border-2 border-mono-white/30 text-mono-white 
                font-montserrat font-semibold px-6 py-3 rounded
                hover:bg-mono-white/5 transition-all duration-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!title.trim()}
              className="flex-1 bg-mono-white text-mono-black font-montserrat font-semibold 
                px-6 py-3 rounded hover:bg-mono-silver hover:shadow-lg hover:-translate-y-0.5
                transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed
                disabled:hover:translate-y-0 disabled:hover:shadow-none"
            >
              Create Project
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
