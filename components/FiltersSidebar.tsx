"use client";

import Image from "next/image";
import { CategoryIcon } from "./CategoryIcon";

export interface FilterItem {
  id: number;
  name: string;
  icon?: React.ReactNode;
}

export interface TopicItem {
  id: number;
  name: string;
  categoryId: number;
}

export interface InstructorItem {
  id: number;
  name: string;
  avatar?: string;
}

interface FiltersSidebarProps {
  categories: FilterItem[];
  topics: TopicItem[];
  instructors: InstructorItem[];
  selectedCategories: number[];
  selectedTopics: number[];
  selectedInstructors: number[];
  onCategoryChange: (id: number) => void;
  onTopicChange: (id: number) => void;
  onInstructorChange: (id: number) => void;
  onClearAll: () => void;
  activeCount: number;
}

export function FiltersSidebar({
  categories,
  topics,
  instructors,
  selectedCategories,
  selectedTopics,
  selectedInstructors,
  onCategoryChange,
  onTopicChange,
  onInstructorChange,
  onClearAll,
  activeCount,
}: FiltersSidebarProps) {
  // Topics should only show those belonging to selected categories, unless none are selected
  const visibleTopics = selectedCategories.length > 0
    ? topics.filter(t => selectedCategories.includes(t.categoryId))
    : topics;

  return (
    <div className="w-full md:w-64 shrink-0 flex flex-col pt-2">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">Filters</h2>
        {(activeCount > 0) && (
          <button
            onClick={onClearAll}
            className="text-sm text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors flex items-center gap-1"
          >
            Clear All Filters
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        )}
      </div>

      {/* Categories */}
      <div className="mb-8">
        <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-4">Categories</h3>
        <div className="flex flex-wrap gap-2.5">
          {categories.map((cat) => {
            const isSelected = selectedCategories.includes(cat.id);
            return (
              <button
                key={`cat-${cat.id}`}
                onClick={() => onCategoryChange(cat.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${isSelected
                    ? "bg-indigo-50 border-indigo-200 text-indigo-700 dark:bg-indigo-900/30 dark:border-indigo-800 dark:text-indigo-400"
                    : "bg-white border-zinc-200 text-zinc-600 hover:border-zinc-300 dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-400 dark:hover:border-zinc-700"
                  }`}
              >
                <div className={`w-4 h-4 flex items-center justify-center ${isSelected ? "text-indigo-600 dark:text-indigo-400" : "text-zinc-400"}`}>
                  <CategoryIcon categoryName={cat.name} className="w-full h-full" />
                </div>
                {cat.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Topics */}
      <div className="mb-8">
        <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-4">Topics</h3>
        <div className="flex flex-wrap gap-2.5">
          {visibleTopics.length > 0 ? (
            visibleTopics.map((topic) => {
              const isSelected = selectedTopics.includes(topic.id);
              return (
                <button
                  key={`topic-${topic.id}`}
                  onClick={() => onTopicChange(topic.id)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${isSelected
                      ? "bg-indigo-50 border-indigo-200 text-indigo-700 dark:bg-indigo-900/30 dark:border-indigo-800 dark:text-indigo-400"
                      : "bg-white border-zinc-200 text-zinc-600 hover:border-zinc-300 dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-400 dark:hover:border-zinc-700"
                    }`}
                >
                  {topic.name}
                </button>
              );
            })
          ) : (
            <p className="text-xs text-zinc-400 italic">No topics available for selected categories.</p>
          )}
        </div>
      </div>

      {/* Instructors */}
      <div className="mb-8">
        <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-4">Instructor</h3>
        <div className="flex flex-col gap-3">
          {instructors.map((inst) => {
            const isSelected = selectedInstructors.includes(inst.id);
            return (
              <button
                key={`inst-${inst.id}`}
                onClick={() => onInstructorChange(inst.id)}
                className={`flex items-center gap-3 p-1.5 -ml-1.5 rounded-lg transition-colors ${isSelected
                    ? "bg-zinc-50 dark:bg-zinc-800/50"
                    : "hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
                  }`}
              >
                <div className="relative w-8 h-8 rounded-full overflow-hidden border border-zinc-200 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 shrink-0">
                  {inst.avatar ? (
                    <Image src={inst.avatar} alt={inst.name} fill className="object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs font-bold text-zinc-400">
                      {inst.name.charAt(0)}
                    </div>
                  )}
                </div>
                <span className={`text-sm ${isSelected ? 'font-semibold text-zinc-900 dark:text-white' : 'font-medium text-zinc-600 dark:text-zinc-400'}`}>
                  {inst.name}
                </span>

                {/* Visual Checkbox Indicator for Instructor */}
                <div className={`ml-auto w-4 h-4 rounded-full border flex items-center justify-center ${isSelected ? 'bg-indigo-600 border-indigo-600' : 'border-zinc-300 dark:border-zinc-600'}`}>
                  {isSelected && (
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Footer / Active Count */}
      <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800">
        <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
          {activeCount === 0 ? "0 Filters Active" : `${activeCount} Filter${activeCount > 1 ? 's' : ''} Active`}
        </p>
      </div>
    </div>
  );
}
