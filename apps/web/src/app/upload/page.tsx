'use client';

import { useState, useRef, DragEvent } from 'react';
import Link from 'next/link';

export default function UploadPage() {
    const [file, setFile] = useState<File | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const acceptedFormats = ['.mp4', '.mov', '.avi'];
    const acceptedMimeTypes = ['video/mp4', 'video/quicktime', 'video/x-msvideo'];

    const validateFile = (file: File): boolean => {
        return acceptedMimeTypes.includes(file.type);
    };

    const formatFileSize = (bytes: number): string => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    };

    const handleDragEnter = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };

    const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };

    const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        const droppedFiles = e.dataTransfer.files;
        if (droppedFiles.length > 0) {
            const droppedFile = droppedFiles[0];
            if (validateFile(droppedFile)) {
                setFile(droppedFile);
            } else {
                alert('Please upload a valid video file (.mp4, .mov, .avi)');
            }
        }
    };

    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFiles = e.target.files;
        if (selectedFiles && selectedFiles.length > 0) {
            const selectedFile = selectedFiles[0];
            if (validateFile(selectedFile)) {
                setFile(selectedFile);
            } else {
                alert('Please upload a valid video file (.mp4, .mov, .avi)');
            }
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

    return (
        <main className="min-h-screen bg-mono-black text-mono-white flex flex-col animate-fade-in">
            {/* Cinematic Vignette */}
            <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.02),transparent_70%)]" />

            {/* Header */}
            <header className="border-b border-mono-silver/20 py-8 md:py-12 px-8 relative z-10">
                <div className="container mx-auto max-w-6xl flex items-center justify-between">
                    <Link href="/" className="flex items-center space-x-4 hover:opacity-80 transition-opacity">
                        <svg
                            className="w-10 h-10"
                            viewBox="0 0 64 64"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.5"
                        >
                            <rect x="8" y="8" width="48" height="48" />
                            <line x1="32" y1="8" x2="32" y2="56" />
                            <line x1="8" y1="32" x2="56" y2="32" />
                        </svg>
                        <span className="font-montserrat font-bold text-2xl">MONOFRAME</span>
                    </Link>
                    <Link
                        href="/"
                        className="font-inter text-sm text-mono-silver hover:text-mono-white transition-colors"
                    >
                        Back to Home
                    </Link>
                </div>
            </header>

            {/* Main Content */}
            <div className="flex-1 flex items-center justify-center px-4 py-16 relative z-10">
                <div className="container mx-auto max-w-4xl">
                    {/* Step Indicator */}
                    <div className="text-center mb-8 animate-fade-up">
                        <p className="font-montserrat text-sm text-mono-silver/60 tracking-widest uppercase">
                            Step 1 of 3 — Upload Footage
                        </p>
                    </div>

                    {/* Title */}
                    <div className="text-center mb-12 animate-fade-up animation-delay-200">
                        <h1 className="font-montserrat font-bold text-5xl md:text-7xl mb-6">Upload Footage</h1>
                        <p className="font-inter text-xl md:text-2xl text-mono-silver/80">
                            Drop your raw video and let AI work its magic
                        </p>
                    </div>

                    {/* Upload Zone */}
                    <div className="animate-fade-up animation-delay-400">
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
                  animate-[fadeIn_0.8s_ease-out]
                  ${isDragging
                                        ? 'border-mono-white bg-mono-white/10 scale-[1.02]'
                                        : 'border-mono-silver hover:border-mono-white hover:bg-mono-white/10 animate-[breathe_4s_ease-in-out_infinite]'
                                    }
                `}
                            >
                                {/* Radial Glow Behind Drop Zone */}
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                    <div className="w-[600px] h-[400px] bg-mono-white/[0.02] blur-[100px] rounded-full" />
                                </div>

                                <div className="text-center space-y-6 relative z-10">
                                    {/* Upload Icon - MonoFrame Grid Rotated */}
                                    <div className={`transition-transform duration-300 ${isDragging ? 'translate-y-[-3px]' : ''}`}>
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
                                            <path d="M32 8 L32 16 M32 48 L32 56 M8 32 L16 32 M48 32 L56 32" strokeWidth="2" />
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
                                        Supported formats: MP4, MOV, AVI
                                    </p>
                                </div>

                                {/* Hidden File Input */}
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept={acceptedFormats.join(',')}
                                    onChange={handleFileInput}
                                    className="hidden"
                                />
                            </div>
                        ) : (
                            <div className="border-2 border-mono-silver rounded-lg p-12 bg-mono-slate">
                                {/* File Info */}
                                <div className="flex items-start justify-between mb-8">
                                    <div className="flex items-start space-x-6 flex-1">
                                        {/* Video Icon */}
                                        <svg
                                            className="w-16 h-16 stroke-mono-white flex-shrink-0"
                                            viewBox="0 0 64 64"
                                            fill="none"
                                            strokeWidth="1.5"
                                        >
                                            <rect x="8" y="16" width="48" height="32" />
                                            <polygon points="28,28 28,36 38,32" fill="currentColor" />
                                        </svg>

                                        {/* File Details */}
                                        <div className="flex-1 min-w-0">
                                            <p className="font-montserrat font-semibold text-2xl md:text-3xl mb-2 truncate">
                                                {file.name}
                                            </p>
                                            <p className="font-inter text-lg text-mono-silver">
                                                {formatFileSize(file.size)}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Remove Button */}
                                    <button
                                        onClick={handleRemoveFile}
                                        className="ml-4 p-3 hover:bg-mono-white/10 rounded transition-colors flex-shrink-0"
                                        aria-label="Remove file"
                                    >
                                        <svg
                                            className="w-6 h-6 stroke-mono-silver hover:stroke-mono-white"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            strokeWidth="2"
                                        >
                                            <line x1="18" y1="6" x2="6" y2="18" />
                                            <line x1="6" y1="6" x2="18" y2="18" />
                                        </svg>
                                    </button>
                                </div>

                                {/* Upload Another */}
                                <button
                                    onClick={handleBrowseClick}
                                    className="font-inter text-mono-silver hover:text-mono-white underline transition-colors"
                                >
                                    Upload a different file
                                </button>

                                {/* Hidden File Input */}
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept={acceptedFormats.join(',')}
                                    onChange={handleFileInput}
                                    className="hidden"
                                />
                            </div>
                        )}
                    </div>

                    {/* Continue Button */}
                    <div className="mt-8 text-center animate-fade-up animation-delay-600">
                        <Link
                            href={file ? '/processing' : '#'}
                            className={`
                inline-block font-montserrat font-semibold text-lg px-12 py-4 rounded
                transition-all duration-300
                ${file
                                    ? 'bg-mono-white text-mono-black hover:bg-mono-silver cursor-pointer'
                                    : 'bg-mono-slate text-mono-silver cursor-not-allowed pointer-events-none'
                                }
              `}
                        >
                            Continue to Processing
                        </Link>
                    </div>
                </div>
            </div>
        </main>
    );
}

