"use client";

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, SlidersHorizontal, ChevronDown, ChevronUp } from 'lucide-react';
import { COMPANIES, INDIAN_COMPANIES, GLOBAL_COMPANIES } from '@/lib/companies';
import { ALL_TOPICS, ALL_CATEGORIES, ALL_DIFFICULTIES, ALL_FREQUENCIES, type QuestionFilters } from '@/lib/question-bank';

interface FilterSidebarProps {
  filters: QuestionFilters;
  onFiltersChange: (filters: QuestionFilters) => void;
  filteredCount: number;
  totalCount: number;
}

export default function FilterSidebar({ filters, onFiltersChange, filteredCount, totalCount }: FilterSidebarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchInput, setSearchInput] = useState(filters.search || '');
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    company: true, difficulty: true, category: true, topic: false, frequency: false, status: true
  });
  const debounceRef = useRef<NodeJS.Timeout>();

  // Debounced search
  useEffect(() => {
    debounceRef.current = setTimeout(() => {
      onFiltersChange({ ...filters, search: searchInput || undefined, page: 1 });
    }, 300);
    return () => clearTimeout(debounceRef.current);
  }, [searchInput]);

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const toggleArrayFilter = (key: 'companies' | 'difficulties' | 'categories' | 'topics' | 'frequencies', value: string) => {
    const current = filters[key] || [];
    const updated = current.includes(value)
      ? current.filter(v => v !== value)
      : [...current, value];
    onFiltersChange({ ...filters, [key]: updated.length > 0 ? updated : undefined, page: 1 });
  };

  const setStatusFilter = (status: 'all' | 'attempted' | 'unattempted' | 'bookmarked') => {
    onFiltersChange({ ...filters, status, page: 1 });
  };

  const clearAll = () => {
    setSearchInput('');
    onFiltersChange({ page: 1, pageSize: 20, sortBy: 'recent' });
  };

  const hasActiveFilters = !!(filters.search || filters.companies?.length || filters.difficulties?.length ||
    filters.categories?.length || filters.topics?.length || filters.frequencies?.length ||
    (filters.status && filters.status !== 'all'));

  const filterContent = (
    <div className="space-y-5">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-muted)' }} />
        <input
          type="text"
          placeholder="Search questions..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="w-full rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
          style={{ background: 'var(--bg-card)', border: '0.5px solid var(--border-color)', color: 'var(--text-primary)' }}
        />
        {searchInput && (
          <button onClick={() => setSearchInput('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Filtered count */}
      <div className="text-xs font-medium px-1" style={{ color: 'var(--text-muted)' }}>
        Showing <span className="text-primary font-bold">{filteredCount}</span> of {totalCount} questions
      </div>

      {/* Company Filter */}
      <FilterSection title="Company" expanded={expandedSections.company} onToggle={() => toggleSection('company')}>
        <div className="space-y-3">
          <p className="text-[11px] uppercase tracking-wider font-semibold" style={{ color: 'var(--text-muted)' }}>Indian Companies</p>
          <div className="space-y-1">
            {INDIAN_COMPANIES.map(c => {
              const checked = filters.companies?.includes(c.name) || false;
              return (
                <label 
                  key={c.id} 
                  className="group flex items-center gap-[10px] py-1.5 px-2 rounded-lg cursor-pointer transition-colors"
                  onMouseEnter={(e) => {
                    const box = e.currentTarget.querySelector('.custom-checkbox') as HTMLElement;
                    const text = e.currentTarget.querySelector('.label-text') as HTMLElement;
                    if (box) box.style.borderColor = 'rgba(124,58,237,0.5)';
                    if (text) text.style.color = 'var(--text-primary)';
                  }}
                  onMouseLeave={(e) => {
                    const box = e.currentTarget.querySelector('.custom-checkbox') as HTMLElement;
                    const text = e.currentTarget.querySelector('.label-text') as HTMLElement;
                    if (box) box.style.borderColor = 'rgba(255,255,255,0.2)';
                    if (text) text.style.color = 'var(--text-secondary)';
                  }}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleArrayFilter('companies', c.name)}
                    className="sr-only"
                  />
                  <div 
                    className="custom-checkbox"
                    style={{
                      width: '16px',
                      height: '16px',
                      borderRadius: '4px',
                      border: '0.5px solid rgba(255,255,255,0.2)',
                      background: checked ? '#7C3AED' : 'rgba(255,255,255,0.04)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.15s ease',
                      flexShrink: 0
                    }}
                  >
                    <AnimatePresence>
                      {checked && (
                        <motion.svg 
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          exit={{ scale: 0 }}
                          transition={{ duration: 0.15 }}
                          width="10" height="10" viewBox="0 0 10 10" fill="none"
                        >
                          <path d="M2 5l2.5 2.5L8 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </motion.svg>
                      )}
                    </AnimatePresence>
                  </div>
                  <img 
                    src={c.logo} 
                    alt={c.name} 
                    width={24}
                    height={24}
                    loading="lazy"
                    className="rounded object-contain bg-white p-0.5"
                    onError={(e) => { 
                      e.currentTarget.src = `https://ui-avatars.com/api/?name=${c.name}&background=7C3AED&color=fff&size=48&bold=true&length=2`
                    }} 
                  />
                  <span className="label-text text-[13px] transition-colors" style={{ color: 'var(--text-secondary)' }}>{c.name}</span>
                </label>
              );
            })}
          </div>
          <p className="text-[11px] uppercase tracking-wider font-semibold mt-3" style={{ color: 'var(--text-muted)' }}>Global Companies</p>
          <div className="space-y-1">
            {GLOBAL_COMPANIES.map(c => {
              const checked = filters.companies?.includes(c.name) || false;
              return (
                <label 
                  key={c.id} 
                  className="group flex items-center gap-[10px] py-1.5 px-2 rounded-lg cursor-pointer transition-colors"
                  onMouseEnter={(e) => {
                    const box = e.currentTarget.querySelector('.custom-checkbox') as HTMLElement;
                    const text = e.currentTarget.querySelector('.label-text') as HTMLElement;
                    if (box) box.style.borderColor = 'rgba(124,58,237,0.5)';
                    if (text) text.style.color = 'var(--text-primary)';
                  }}
                  onMouseLeave={(e) => {
                    const box = e.currentTarget.querySelector('.custom-checkbox') as HTMLElement;
                    const text = e.currentTarget.querySelector('.label-text') as HTMLElement;
                    if (box) box.style.borderColor = 'rgba(255,255,255,0.2)';
                    if (text) text.style.color = 'var(--text-secondary)';
                  }}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleArrayFilter('companies', c.name)}
                    className="sr-only"
                  />
                  <div 
                    className="custom-checkbox"
                    style={{
                      width: '16px',
                      height: '16px',
                      borderRadius: '4px',
                      border: '0.5px solid rgba(255,255,255,0.2)',
                      background: checked ? '#7C3AED' : 'rgba(255,255,255,0.04)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.15s ease',
                      flexShrink: 0
                    }}
                  >
                    <AnimatePresence>
                      {checked && (
                        <motion.svg 
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          exit={{ scale: 0 }}
                          transition={{ duration: 0.15 }}
                          width="10" height="10" viewBox="0 0 10 10" fill="none"
                        >
                          <path d="M2 5l2.5 2.5L8 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </motion.svg>
                      )}
                    </AnimatePresence>
                  </div>
                  <img 
                    src={c.logo} 
                    alt={c.name} 
                    width={24}
                    height={24}
                    loading="lazy"
                    className="rounded object-contain bg-white p-0.5"
                    onError={(e) => { 
                      e.currentTarget.src = `https://ui-avatars.com/api/?name=${c.name}&background=7C3AED&color=fff&size=48&bold=true&length=2`
                    }} 
                  />
                  <span className="label-text text-[13px] transition-colors" style={{ color: 'var(--text-secondary)' }}>{c.name}</span>
                </label>
              );
            })}
          </div>
        </div>
      </FilterSection>

      {/* Difficulty */}
      <FilterSection title="Difficulty" expanded={expandedSections.difficulty} onToggle={() => toggleSection('difficulty')}>
        <div className="flex flex-col gap-1">
          {ALL_DIFFICULTIES.map(d => {
            const checked = filters.difficulties?.includes(d) || false;
            return (
              <label 
                key={d} 
                className="group flex items-center gap-[10px] py-1.5 px-2 rounded-lg cursor-pointer transition-colors"
                onMouseEnter={(e) => {
                  const box = e.currentTarget.querySelector('.custom-checkbox') as HTMLElement;
                  const text = e.currentTarget.querySelector('.label-text') as HTMLElement;
                  if (box) box.style.borderColor = 'rgba(124,58,237,0.5)';
                  if (text) text.style.color = 'var(--text-primary)';
                }}
                onMouseLeave={(e) => {
                  const box = e.currentTarget.querySelector('.custom-checkbox') as HTMLElement;
                  const text = e.currentTarget.querySelector('.label-text') as HTMLElement;
                  if (box) box.style.borderColor = 'rgba(255,255,255,0.2)';
                  if (text) text.style.color = 'var(--text-secondary)';
                }}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggleArrayFilter('difficulties', d)}
                  className="sr-only"
                />
                <div 
                  className="custom-checkbox"
                  style={{
                    width: '16px',
                    height: '16px',
                    borderRadius: '4px',
                    border: '0.5px solid rgba(255,255,255,0.2)',
                    background: checked ? '#7C3AED' : 'rgba(255,255,255,0.04)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.15s ease',
                    flexShrink: 0
                  }}
                >
                  <AnimatePresence>
                    {checked && (
                      <motion.svg 
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        transition={{ duration: 0.15 }}
                        width="10" height="10" viewBox="0 0 10 10" fill="none"
                      >
                        <path d="M2 5l2.5 2.5L8 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </motion.svg>
                    )}
                  </AnimatePresence>
                </div>
                <span className="label-text text-[13px] transition-colors" style={{ color: 'var(--text-secondary)' }}>{d}</span>
              </label>
            );
          })}
        </div>
      </FilterSection>

      {/* Category */}
      <FilterSection title="Category" expanded={expandedSections.category} onToggle={() => toggleSection('category')}>
        <div className="flex flex-col gap-1">
          {ALL_CATEGORIES.map(c => {
            const checked = filters.categories?.includes(c) || false;
            return (
              <label 
                key={c} 
                className="group flex items-center gap-[10px] py-1.5 px-2 rounded-lg cursor-pointer transition-colors"
                onMouseEnter={(e) => {
                  const box = e.currentTarget.querySelector('.custom-checkbox') as HTMLElement;
                  const text = e.currentTarget.querySelector('.label-text') as HTMLElement;
                  if (box) box.style.borderColor = 'rgba(124,58,237,0.5)';
                  if (text) text.style.color = 'var(--text-primary)';
                }}
                onMouseLeave={(e) => {
                  const box = e.currentTarget.querySelector('.custom-checkbox') as HTMLElement;
                  const text = e.currentTarget.querySelector('.label-text') as HTMLElement;
                  if (box) box.style.borderColor = 'rgba(255,255,255,0.2)';
                  if (text) text.style.color = 'var(--text-secondary)';
                }}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggleArrayFilter('categories', c)}
                  className="sr-only"
                />
                <div 
                  className="custom-checkbox"
                  style={{
                    width: '16px',
                    height: '16px',
                    borderRadius: '4px',
                    border: '0.5px solid rgba(255,255,255,0.2)',
                    background: checked ? '#7C3AED' : 'rgba(255,255,255,0.04)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.15s ease',
                    flexShrink: 0
                  }}
                >
                  <AnimatePresence>
                    {checked && (
                      <motion.svg 
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        transition={{ duration: 0.15 }}
                        width="10" height="10" viewBox="0 0 10 10" fill="none"
                      >
                        <path d="M2 5l2.5 2.5L8 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </motion.svg>
                    )}
                  </AnimatePresence>
                </div>
                <span className="label-text text-[13px] transition-colors" style={{ color: 'var(--text-secondary)' }}>{c}</span>
              </label>
            );
          })}
        </div>
      </FilterSection>

      {/* Topic */}
      <FilterSection title="Topic" expanded={expandedSections.topic} onToggle={() => toggleSection('topic')}>
        <div className="flex gap-1.5 flex-wrap max-h-48 overflow-y-auto custom-scrollbar">
          {ALL_TOPICS.map(t => (
            <button
              key={t}
              onClick={() => toggleArrayFilter('topics', t)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-medium border transition-all ${
                filters.topics?.includes(t)
                  ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30'
                  : ''
              }`}
              style={!filters.topics?.includes(t) ? { background: 'var(--bg-card)', color: 'var(--text-muted)', borderColor: 'var(--border-color)' } : undefined}
            >
              {t}
            </button>
          ))}
        </div>
      </FilterSection>

      {/* Frequency */}
      <FilterSection title="Frequency" expanded={expandedSections.frequency} onToggle={() => toggleSection('frequency')}>
        <div className="flex gap-2 flex-wrap">
          {ALL_FREQUENCIES.map(f => (
            <button
              key={f}
              onClick={() => toggleArrayFilter('frequencies', f)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                filters.frequencies?.includes(f)
                  ? 'bg-orange-500/20 text-orange-400 border-orange-500/30'
                  : ''
              }`}
              style={!filters.frequencies?.includes(f) ? { background: 'var(--bg-card)', color: 'var(--text-muted)', borderColor: 'var(--border-color)' } : undefined}
            >
              {f === 'Very Common' ? '🔥 ' : ''}{f}
            </button>
          ))}
        </div>
      </FilterSection>

      {/* Status */}
      <FilterSection title="Status" expanded={expandedSections.status} onToggle={() => toggleSection('status')}>
        <div className="flex gap-2 flex-wrap">
          {(['all', 'attempted', 'unattempted', 'bookmarked'] as const).map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border capitalize transition-all ${
                (filters.status || 'all') === s
                  ? 'bg-primary/20 text-primary border-primary/30'
                  : ''
              }`}
              style={(filters.status || 'all') !== s ? { background: 'var(--bg-card)', color: 'var(--text-muted)', borderColor: 'var(--border-color)' } : undefined}
            >
              {s}
            </button>
          ))}
        </div>
      </FilterSection>

      {/* Clear all */}
      {hasActiveFilters && (
        <button onClick={clearAll} className="w-full text-center text-sm text-primary hover:text-primary/80 font-medium py-2 transition-colors">
          Clear all filters
        </button>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-72 shrink-0" style={{ zIndex: 100, position: 'relative' }}>
        <div className="sticky top-4 glass rounded-2xl p-5 backdrop-blur-md max-h-[calc(100vh-6rem)] overflow-y-auto custom-scrollbar" style={{ background: 'var(--bg-surface)', border: '0.5px solid var(--border-color)', transition: 'var(--transition)' }}>
          <h3 className="text-sm font-bold mb-4 flex items-center space-x-2" style={{ color: 'var(--text-primary)' }}>
            <SlidersHorizontal className="w-4 h-4" />
            <span>Filters</span>
          </h3>
          {filterContent}
        </div>
      </aside>

      {/* Mobile Filter Button */}
      <div className="lg:hidden">
        <button
          onClick={() => setMobileOpen(true)}
          className="flex items-center space-x-2 px-4 py-2.5 bg-surface border border-white/10 rounded-xl text-sm font-medium text-white/70 hover:bg-white/10 transition-colors"
        >
          <SlidersHorizontal className="w-4 h-4" />
          <span>Filters</span>
          {hasActiveFilters && (
            <span className="w-2 h-2 rounded-full bg-primary" />
          )}
        </button>
      </div>

      {/* Mobile Bottom Sheet */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 z-50 lg:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 rounded-t-3xl z-50 max-h-[85vh] overflow-y-auto p-6 lg:hidden"
              style={{ background: 'var(--bg-surface)', borderTop: '1px solid var(--border-color)' }}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold">Filters</h3>
                <button onClick={() => setMobileOpen(false)} className="p-2 rounded-lg bg-white/5 hover:bg-white/10">
                  <X className="w-5 h-5" />
                </button>
              </div>
              {filterContent}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

function FilterSection({ title, expanded, onToggle, children }: {
  title: string; expanded: boolean; onToggle: () => void; children: React.ReactNode;
}) {
  return (
    <div className="pt-4" style={{ borderTop: '1px solid var(--border-color)' }}>
      <button onClick={onToggle} className="flex items-center justify-between w-full text-sm font-semibold transition-colors mb-3" style={{ color: 'var(--text-secondary)' }}>
        <span>{title}</span>
        {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>
      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}>
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
