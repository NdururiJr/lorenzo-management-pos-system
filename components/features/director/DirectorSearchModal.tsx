/**
 * DirectorSearchModal Component
 *
 * Modal for displaying AI-powered search results from the analytics agent.
 * Shows the natural language response, data sources, and allows follow-up queries.
 *
 * @module components/features/director/DirectorSearchModal
 */

'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Sparkles,
  TrendingUp,
  Package,
  Users,
  DollarSign,
  Truck,
  Building2,
  BarChart3,
  RefreshCw,
  Copy,
  Check,
  ChevronRight,
} from 'lucide-react';

/**
 * Data source from analytics agent
 */
export interface SearchDataSource {
  type: 'revenue' | 'orders' | 'customers' | 'staff' | 'branch' | 'delivery';
  label: string;
  data: Record<string, unknown>;
}

/**
 * Search result from API
 */
export interface SearchResult {
  answer: string;
  intent: string;
  sources: SearchDataSource[];
  branchId: string;
}

/**
 * Props for DirectorSearchModal
 */
export interface DirectorSearchModalProps {
  /** Whether the modal is open */
  isOpen: boolean;
  /** Callback to close the modal */
  onClose: () => void;
  /** The original query */
  query: string;
  /** The search result */
  result: SearchResult | null;
  /** Whether the search is loading */
  isLoading: boolean;
  /** Error message if search failed */
  error: string | null;
  /** Callback to perform a new search */
  onNewSearch: (query: string) => void;
}

/**
 * Get icon for data source type
 */
function getSourceIcon(type: string) {
  switch (type) {
    case 'revenue':
      return DollarSign;
    case 'orders':
      return Package;
    case 'customers':
      return Users;
    case 'staff':
      return BarChart3;
    case 'branch':
      return Building2;
    case 'delivery':
      return Truck;
    default:
      return TrendingUp;
  }
}

/**
 * Get color for data source type
 */
function getSourceColor(type: string) {
  switch (type) {
    case 'revenue':
      return 'text-green-400 bg-green-400/10';
    case 'orders':
      return 'text-blue-400 bg-blue-400/10';
    case 'customers':
      return 'text-purple-400 bg-purple-400/10';
    case 'staff':
      return 'text-orange-400 bg-orange-400/10';
    case 'branch':
      return 'text-cyan-400 bg-cyan-400/10';
    case 'delivery':
      return 'text-yellow-400 bg-yellow-400/10';
    default:
      return 'text-gray-400 bg-gray-400/10';
  }
}

/**
 * Suggested follow-up questions based on intent
 */
const FOLLOW_UP_SUGGESTIONS: Record<string, string[]> = {
  ANALYTICS_REVENUE: [
    'Compare to last week',
    'Break down by payment method',
    'Which branch had the highest revenue?',
  ],
  ANALYTICS_ORDERS: [
    'Show overdue orders',
    'What\'s the average turnaround time?',
    'Compare to yesterday',
  ],
  ANALYTICS_CUSTOMERS: [
    'Show customer retention rate',
    'How many new customers this week?',
    'Who are the most frequent customers?',
  ],
  ANALYTICS_STAFF: [
    'Who are the top performers?',
    'Show productivity trends',
    'Compare team performance',
  ],
  ANALYTICS_BRANCH: [
    'Which branch needs attention?',
    'Show all branches',
    'Compare efficiency scores',
  ],
  ANALYTICS_DELIVERY: [
    'Show pending deliveries',
    'Which driver is most efficient?',
    'Delivery success rate',
  ],
};

/**
 * DirectorSearchModal - AI search results modal
 */
export function DirectorSearchModal({
  isOpen,
  onClose,
  query,
  result,
  isLoading,
  error,
  onNewSearch,
}: DirectorSearchModalProps) {
  const [copied, setCopied] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, onClose]);

  // Copy answer to clipboard
  const handleCopyAnswer = async () => {
    if (result?.answer) {
      await navigator.clipboard.writeText(result.answer);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Get follow-up suggestions based on intent
  const suggestions = result?.intent
    ? FOLLOW_UP_SUGGESTIONS[result.intent] || FOLLOW_UP_SUGGESTIONS.ANALYTICS_ORDERS
    : [];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            ref={modalRef}
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-x-4 top-[10%] md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:w-full md:max-w-2xl z-50"
          >
            <div className="glass-card-dark border border-white/10 overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-lorenzo-accent-teal/20">
                    <Sparkles size={18} className="text-lorenzo-accent-teal" />
                  </div>
                  <div>
                    <h2 className="text-[15px] font-semibold text-white">
                      AI Business Analyst
                    </h2>
                    <p className="text-[11px] text-white/50">
                      Powered by Lorenzo Analytics Engine
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                  aria-label="Close"
                >
                  <X size={18} className="text-white/60" />
                </button>
              </div>

              {/* Query */}
              <div className="px-4 py-3 bg-white/5 border-b border-white/10">
                <p className="text-[13px] text-white/70">
                  <span className="text-white/40">You asked: </span>
                  <span className="text-white font-medium">&quot;{query}&quot;</span>
                </p>
              </div>

              {/* Content */}
              <div className="p-4 max-h-[60vh] overflow-y-auto">
                {/* Loading State */}
                {isLoading && (
                  <div className="flex flex-col items-center justify-center py-12">
                    <RefreshCw size={32} className="text-lorenzo-accent-teal animate-spin mb-4" />
                    <p className="text-[14px] text-white/70">Analyzing your question...</p>
                    <p className="text-[12px] text-white/40 mt-1">
                      Querying databases and generating insights
                    </p>
                  </div>
                )}

                {/* Error State */}
                {error && !isLoading && (
                  <div className="flex flex-col items-center justify-center py-12">
                    <div className="p-3 rounded-full bg-red-500/20 mb-4">
                      <X size={24} className="text-red-400" />
                    </div>
                    <p className="text-[14px] text-white/70 text-center">{error}</p>
                    <button
                      onClick={() => onNewSearch(query)}
                      className="mt-4 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-[13px] text-white transition-colors"
                    >
                      Try Again
                    </button>
                  </div>
                )}

                {/* Result */}
                {result && !isLoading && !error && (
                  <div className="space-y-4">
                    {/* Answer */}
                    <div className="relative">
                      <div className="prose prose-invert prose-sm max-w-none">
                        <p className="text-[14px] text-white/90 leading-relaxed whitespace-pre-wrap">
                          {result.answer}
                        </p>
                      </div>
                      <button
                        onClick={handleCopyAnswer}
                        className="absolute top-0 right-0 p-2 rounded-lg hover:bg-white/10 transition-colors"
                        aria-label="Copy answer"
                      >
                        {copied ? (
                          <Check size={14} className="text-green-400" />
                        ) : (
                          <Copy size={14} className="text-white/40" />
                        )}
                      </button>
                    </div>

                    {/* Data Sources */}
                    {result.sources && result.sources.length > 0 && (
                      <div className="pt-4 border-t border-white/10">
                        <p className="text-[11px] text-white/40 uppercase tracking-wider mb-3">
                          Data Sources
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {result.sources.map((source, index) => {
                            const Icon = getSourceIcon(source.type);
                            const colorClass = getSourceColor(source.type);
                            return (
                              <div
                                key={index}
                                className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${colorClass}`}
                              >
                                <Icon size={12} />
                                <span className="text-[11px] font-medium">
                                  {source.label}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Follow-up Suggestions */}
                    {suggestions.length > 0 && (
                      <div className="pt-4 border-t border-white/10">
                        <p className="text-[11px] text-white/40 uppercase tracking-wider mb-3">
                          Related Questions
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {suggestions.map((suggestion, index) => (
                            <button
                              key={index}
                              onClick={() => onNewSearch(suggestion)}
                              className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 text-[12px] text-white/70 hover:text-white transition-colors"
                            >
                              <span>{suggestion}</span>
                              <ChevronRight size={12} />
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Intent Badge */}
                    <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-white/30">Intent:</span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-white/10 text-white/50 font-mono">
                          {result.intent}
                        </span>
                      </div>
                      {result.branchId && (
                        <div className="flex items-center gap-2">
                          <Building2 size={12} className="text-white/30" />
                          <span className="text-[10px] text-white/50">
                            {result.branchId === 'all' ? 'All Branches' : result.branchId}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default DirectorSearchModal;
