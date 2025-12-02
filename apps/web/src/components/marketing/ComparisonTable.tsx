'use client';

import { CheckCircle2, X, Minus, Crown } from 'lucide-react';
import { RevealOnScroll } from './RevealOnScroll';

type CellValue = boolean | string | number;

interface ComparisonColumn {
  name: string;
  tagline?: string;
  highlighted?: boolean;
  icon?: React.ComponentType<{ className?: string }>;
}

interface ComparisonRow {
  feature: string;
  values: CellValue[];
  highlight?: boolean;
}

interface ComparisonTableProps {
  /** Section title */
  title?: string;
  /** Section description */
  description?: string;
  /** Column headers */
  columns?: ComparisonColumn[];
  /** Comparison rows */
  rows?: ComparisonRow[];
  /** Background variant */
  backgroundVariant?: 'dark' | 'light' | 'gradient';
  /** Table style */
  tableStyle?: 'bordered' | 'striped' | 'minimal';
  /** Enable sticky header */
  stickyHeader?: boolean;
}

export function ComparisonTable({
  title = 'How We Compare',
  description = 'MonoFrame Studio vs Traditional Video Editors',
  columns = [
    {
      name: 'MonoFrame',
      tagline: 'AI-Powered',
      highlighted: true,
      icon: Crown,
    },
    {
      name: 'Traditional Editors',
      tagline: 'Premiere, Final Cut',
    },
    {
      name: 'Other AI Tools',
      tagline: 'Competitors',
    },
  ],
  rows = [
    {
      feature: 'AI Scene Detection',
      values: [true, false, true],
    },
    {
      feature: 'Emotion Analysis',
      values: [true, false, false],
      highlight: true,
    },
    {
      feature: 'Automatic Highlights',
      values: [true, false, true],
    },
    {
      feature: 'Browser-Based',
      values: [true, false, true],
    },
    {
      feature: 'No Installation',
      values: [true, false, true],
    },
    {
      feature: 'Learning Curve',
      values: ['Minutes', 'Weeks', 'Hours'],
      highlight: true,
    },
    {
      feature: 'Avg. Edit Time',
      values: ['5-10 min', '4-8 hours', '1-2 hours'],
    },
    {
      feature: 'Export Speed',
      values: ['Instant', 'Slow', 'Fast'],
    },
    {
      feature: 'Price',
      values: ['$29/mo', '$300-600', '$50-150/mo'],
    },
  ],
  backgroundVariant = 'dark',
  tableStyle = 'bordered',
  stickyHeader = false,
}: ComparisonTableProps) {
  const backgroundClasses = {
    dark: 'bg-mono-charcoal text-mono-white',
    light: 'bg-mono-white text-mono-black',
    gradient: 'bg-gradient-to-b from-mono-black to-mono-charcoal text-mono-white',
  };

  const renderCellValue = (value: CellValue, columnIndex: number, isHighlighted?: boolean) => {
    const isMonoFrame = columns[columnIndex]?.highlighted;

    if (typeof value === 'boolean') {
      if (value) {
        return (
          <CheckCircle2
            className={`w-6 h-6 mx-auto ${
              isMonoFrame
                ? 'text-green-400'
                : 'text-mono-silver'
            }`}
          />
        );
      } else {
        return (
          <X
            className={`w-6 h-6 mx-auto ${
              isMonoFrame
                ? 'text-mono-silver'
                : 'text-red-400'
            }`}
          />
        );
      }
    }

    if (value === '—' || value === '-') {
      return (
        <Minus className="w-6 h-6 mx-auto text-mono-silver" />
      );
    }

    return (
      <span
        className={`font-semibold ${
          isMonoFrame && isHighlighted
            ? 'text-green-400'
            : isMonoFrame
            ? 'text-mono-white'
            : 'text-mono-silver'
        }`}
      >
        {value}
      </span>
    );
  };

  const getColumnClasses = (column: ComparisonColumn) => {
    if (column.highlighted) {
      return 'bg-mono-white/5 border-l-2 border-r-2 border-mono-white';
    }
    return '';
  };

  const getHeaderClasses = (column: ComparisonColumn) => {
    const base = 'py-4 px-6 text-center';
    if (column.highlighted) {
      return `${base} bg-mono-white/10`;
    }
    return `${base}`;
  };

  return (
    <section className={`py-28 px-4 ${backgroundClasses[backgroundVariant]}`}>
      <div className="w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent mb-20"></div>
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        {(title || description) && (
          <RevealOnScroll.FadeUp>
            <div className="text-center mb-20">
              {title && (
                <h2 className="text-4xl md:text-6xl font-bold mb-6">
                  {title}
                </h2>
              )}
              {description && (
                <p className="text-xl text-mono-silver font-inter">
                  {description}
                </p>
              )}
            </div>
          </RevealOnScroll.FadeUp>
        )}

        {/* Table Container */}
        <RevealOnScroll delay={200}>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              {/* Header */}
              <thead className={stickyHeader ? 'sticky top-0 z-10 bg-mono-charcoal' : ''}>
                <tr className="border-b border-mono-border">
                  <th className="text-left py-4 px-6 font-inter text-mono-silver min-w-[200px]">
                    Feature
                  </th>
                  {columns.map((column, i) => (
                    <th
                      key={i}
                      className={`${getHeaderClasses(column)} min-w-[150px] relative`}
                    >
                      {/* Icon */}
                      {column.icon && (
                        <column.icon className="w-6 h-6 mx-auto mb-2" />
                      )}

                      {/* Column Name */}
                      <div className="font-semibold text-lg">
                        {column.name}
                      </div>

                      {/* Tagline */}
                      {column.tagline && (
                        <div className="text-xs text-mono-silver/60 mt-1">
                          {column.tagline}
                        </div>
                      )}

                      {/* Highlight Badge */}
                      {column.highlighted && (
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-green-400 text-mono-black text-xs font-bold rounded-full">
                          BEST
                        </div>
                      )}
                    </th>
                  ))}
                </tr>
              </thead>

              {/* Body */}
              <tbody>
                {rows.map((row, i) => (
                  <tr
                    key={i}
                    className={`border-b border-mono-border/50 transition-colors ${
                      tableStyle === 'striped' && i % 2 === 0
                        ? 'bg-mono-white/5'
                        : ''
                    } ${
                      row.highlight
                        ? 'bg-mono-white/5'
                        : 'hover:bg-mono-white/5'
                    }`}
                  >
                    {/* Feature Name */}
                    <td
                      className={`py-4 px-6 font-inter ${
                        row.highlight
                          ? 'font-semibold'
                          : ''
                      }`}
                    >
                      {row.feature}
                      {row.highlight && (
                        <span className="ml-2 text-xs text-green-400">★</span>
                      )}
                    </td>

                    {/* Values */}
                    {row.values.map((value, j) => (
                      <td
                        key={j}
                        className={`py-4 px-6 text-center ${getColumnClasses(
                          columns[j]
                        )}`}
                      >
                        {renderCellValue(value, j, row.highlight)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </RevealOnScroll>

        {/* Footer Note */}
        <RevealOnScroll delay={400}>
          <div className="mt-12 text-center">
            <p className="text-sm text-mono-silver font-inter mb-4">
              ★ Key differentiators that set MonoFrame apart
            </p>
            <p className="text-xs text-mono-silver/60 font-inter">
              Comparison based on publicly available information as of {new Date().getFullYear()}
            </p>
          </div>
        </RevealOnScroll>
      </div>
    </section>
  );
}

/**
 * Preset: Striped (alternating row backgrounds)
 */
ComparisonTable.Striped = function StripedComparison(
  props: Omit<ComparisonTableProps, 'tableStyle'>
) {
  return <ComparisonTable tableStyle="striped" {...props} />;
};

/**
 * Preset: Minimal (minimal styling)
 */
ComparisonTable.Minimal = function MinimalComparison(
  props: Omit<ComparisonTableProps, 'tableStyle'>
) {
  return <ComparisonTable tableStyle="minimal" {...props} />;
};

/**
 * Preset: Sticky (sticky header on scroll)
 */
ComparisonTable.Sticky = function StickyComparison(
  props: Omit<ComparisonTableProps, 'stickyHeader'>
) {
  return <ComparisonTable stickyHeader={true} {...props} />;
};

/**
 * Preset: Light (light background)
 */
ComparisonTable.Light = function LightComparison(
  props: Omit<ComparisonTableProps, 'backgroundVariant'>
) {
  return <ComparisonTable backgroundVariant="light" {...props} />;
};

