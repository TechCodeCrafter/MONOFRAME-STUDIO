'use client';

interface HeaderProps {
  title: string;
  subtitle: string;
  onMenuClick: () => void;
  onNewProject: () => void;
}

export default function Header({ title, subtitle, onMenuClick, onNewProject }: HeaderProps) {
  return (
    <header className="bg-mono-black border-b border-mono-silver/15 sticky top-0 z-30 backdrop-blur-sm">
      <div className="px-6 lg:px-8 py-6 flex items-center justify-between">
        {/* Left: Title + Menu Button */}
        <div className="flex items-center space-x-4">
          {/* Mobile Menu Button */}
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 hover:bg-mono-white/5 rounded transition-colors"
            aria-label="Open menu"
          >
            <svg
              className="w-6 h-6 stroke-mono-white"
              viewBox="0 0 24 24"
              fill="none"
              strokeWidth="2"
            >
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>

          {/* Title */}
          <div>
            <h1 className="font-montserrat font-bold text-2xl md:text-3xl text-mono-white">
              {title}
            </h1>
            <p className="font-inter text-sm text-mono-silver mt-1">{subtitle}</p>
          </div>
        </div>

        {/* Right: New Project Button */}
        <button
          onClick={onNewProject}
          className="bg-mono-white text-mono-black font-montserrat font-semibold 
            px-4 md:px-6 py-2 md:py-3 text-sm md:text-base rounded 
            hover:bg-mono-silver hover:shadow-lg hover:-translate-y-0.5 
            transition-all duration-300"
        >
          <span className="hidden sm:inline">New Project</span>
          <span className="sm:hidden">+</span>
        </button>
      </div>
    </header>
  );
}
