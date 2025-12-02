"use client";

/**
 * Accordion Component
 * Collapsible section for large charts/data
 */

import { useState, ReactNode } from "react";
import { ChevronDown } from "lucide-react";

interface AccordionProps {
  title: string;
  summary: ReactNode;
  children: ReactNode;
  defaultOpen?: boolean;
  icon?: ReactNode;
}

export function Accordion({
  title,
  summary,
  children,
  defaultOpen = false,
  icon,
}: AccordionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border border-white/10 bg-white/[0.02] backdrop-blur-md rounded-lg overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-white/[0.04] transition-colors"
      >
        <div className="flex items-center gap-3 flex-1">
          {icon && <div className="text-white/70">{icon}</div>}
          <div className="text-left flex-1">
            <div className="text-sm font-medium text-white">{title}</div>
            {!isOpen && <div className="text-xs text-white/50 mt-1">{summary}</div>}
          </div>
        </div>
        <ChevronDown
          className={`w-4 h-4 text-white/50 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Content */}
      {isOpen && (
        <div className="px-4 pb-4 pt-2 border-t border-white/5">{children}</div>
      )}
    </div>
  );
}

