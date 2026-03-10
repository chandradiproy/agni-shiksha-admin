// src/features/content/components/test-series/TestSeriesSidebar.tsx
import React from 'react';
import { Layers, Plus, Play, Lock, FileQuestion, Loader2 } from 'lucide-react';
import type { TestSeries } from '../../types';

interface TestSeriesSidebarProps {
  testSeriesList: TestSeries[];
  isLoading: boolean;
  selectedTsId: string | null;
  isCreating: boolean;
  onSelect: (id: string) => void;
  onCreateNew: () => void;
  showDetailView: boolean; // Used for mobile responsive sliding
}

export const TestSeriesSidebar: React.FC<TestSeriesSidebarProps> = ({
  testSeriesList, isLoading, selectedTsId, isCreating, onSelect, onCreateNew, showDetailView
}) => {
  return (
    <div className={`
      absolute md:static inset-y-0 left-0 z-20 w-full md:w-80 bg-gray-50/50 md:bg-gray-50 border-r border-gray-200 overflow-y-auto p-4 flex flex-col gap-3 transition-transform duration-300 ease-in-out
      ${showDetailView ? '-translate-x-full md:translate-x-0' : 'translate-x-0'}
    `}>
      <button 
        onClick={onCreateNew}
        className={`w-full py-2.5 rounded-lg text-sm font-semibold flex items-center justify-center transition-all shadow-sm ${
          isCreating ? 'bg-primary text-white shadow-md' : 'bg-white border border-gray-200 text-gray-700 hover:border-primary/50 hover:bg-primary-light/10'
        }`}
      >
        <Plus className="w-4 h-4 mr-2" /> Create New Test
      </button>

      {isLoading ? (
        <div className="flex justify-center p-8"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
      ) : testSeriesList.length === 0 ? (
        <div className="text-center p-6 text-gray-400">
          <Layers className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No tests found for this exam.</p>
        </div>
      ) : (
        <div className="space-y-2.5 pb-20 md:pb-0">
          {testSeriesList.map(ts => (
            <div 
              key={ts.id} 
              onClick={() => onSelect(ts.id)}
              className={`p-4 rounded-xl cursor-pointer border transition-all ${
                selectedTsId === ts.id && !isCreating 
                  ? 'bg-primary-light/40 border-primary shadow-sm ring-1 ring-primary/20' 
                  : 'bg-white border-gray-200 hover:border-primary/40 hover:shadow-sm'
              }`}
            >
              <div className="flex justify-between items-start gap-2">
                <h3 className="font-bold text-gray-900 text-sm line-clamp-2 leading-tight">{ts.title}</h3>
                {ts.is_published ? <Play className="w-4 h-4 text-green-600 shrink-0 mt-0.5" /> : <Lock className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />}
              </div>
              <div className="flex items-center gap-3 mt-3 text-xs text-gray-500 font-medium">
                <span className="flex items-center"><FileQuestion className="w-3.5 h-3.5 mr-1 text-gray-400" /> {ts.total_questions} Qs</span>
                <span className={`px-2 py-0.5 rounded-md ${ts.is_published ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                  {ts.is_published ? 'LIVE' : 'DRAFT'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};