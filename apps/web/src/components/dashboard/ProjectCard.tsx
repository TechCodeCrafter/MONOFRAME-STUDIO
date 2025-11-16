'use client';

import Link from 'next/link';
import Image from 'next/image';

interface ProjectCardProps {
  id: number | string;
  title: string;
  status: 'Processed' | 'Processing' | 'Uploaded';
  date: string;
  thumbnailUrl?: string;
}

export default function ProjectCard({ id, title, status, date, thumbnailUrl }: ProjectCardProps) {
  const statusColors = {
    Processed: 'bg-mono-white/10 text-mono-white border-mono-white/30',
    Processing: 'bg-mono-silver/10 text-mono-silver border-mono-silver/30',
    Uploaded: 'bg-mono-silver/5 text-mono-silver/70 border-mono-silver/20',
  };

  return (
    <Link
      href={`/dashboard/${id}`}
      className="group block bg-mono-slate/30 border border-mono-silver/15 rounded-lg 
        overflow-hidden hover:border-mono-white/40 hover:shadow-2xl hover:-translate-y-1 
        transition-all duration-300"
    >
      {/* Thumbnail */}
      <div className="aspect-video bg-mono-shadow relative overflow-hidden">
        {thumbnailUrl ? (
          <Image src={thumbnailUrl} alt={title} fill className="object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg
              className="w-16 h-16 stroke-mono-silver/30"
              viewBox="0 0 64 64"
              fill="none"
              strokeWidth="1.5"
            >
              <rect x="8" y="16" width="48" height="32" />
              <circle cx="20" cy="28" r="4" />
              <polyline points="8,40 20,32 32,36 44,28 56,32" />
            </svg>
          </div>
        )}

        {/* Status Badge */}
        <div className="absolute top-3 right-3">
          <span
            className={`
              px-3 py-1 rounded-full text-xs font-montserrat font-semibold
              border backdrop-blur-sm
              ${statusColors[status]}
            `}
          >
            {status}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <h3
          className="font-montserrat font-semibold text-lg text-mono-white mb-2 
          group-hover:text-mono-silver transition-colors"
        >
          {title}
        </h3>
        <div className="flex items-center justify-between text-sm text-mono-silver">
          <span className="font-inter">{date}</span>
          <svg
            className="w-4 h-4 stroke-mono-silver group-hover:translate-x-1 transition-transform"
            viewBox="0 0 24 24"
            fill="none"
            strokeWidth="2"
          >
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="12 5 19 12 12 19" />
          </svg>
        </div>
      </div>
    </Link>
  );
}
