"use client";

/**
 * Tab System Component
 * Premium tab navigation for DemoResults
 */

import { ReactNode } from "react";

export interface Tab {
  id: string;
  label: string;
  icon?: ReactNode;
  badge?: string | number;
}

interface TabSystemProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

export function TabSystem({ tabs, activeTab, onTabChange }: TabSystemProps) {
  return (
    <div className="border-b border-white/10 bg-[#0a0a0a]/50 backdrop-blur-sm sticky top-0 z-20">
      <div className="flex items-center gap-1 px-4 overflow-x-auto scrollbar-hide">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`
                relative px-4 py-3 text-sm font-medium whitespace-nowrap
                transition-all duration-200
                ${
                  isActive
                    ? "text-white border-b-2 border-white"
                    : "text-white/50 hover:text-white/80 border-b-2 border-transparent"
                }
              `}
            >
              <div className="flex items-center gap-2">
                {tab.icon && <span className="w-4 h-4">{tab.icon}</span>}
                <span>{tab.label}</span>
                {tab.badge && (
                  <span
                    className={`
                    px-1.5 py-0.5 text-xs rounded-full
                    ${
                      isActive
                        ? "bg-white/20 text-white"
                        : "bg-white/10 text-white/60"
                    }
                  `}
                  >
                    {tab.badge}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

interface TabPanelProps {
  id: string;
  activeTab: string;
  children: ReactNode;
}

export function TabPanel({ id, activeTab, children }: TabPanelProps) {
  if (activeTab !== id) return null;

  return <div className="p-6 space-y-6">{children}</div>;
}

