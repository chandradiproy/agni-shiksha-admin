// src/features/news/components/ArticleCard.tsx
import React from 'react';
import { Eye, EyeOff, Pin, Trash2, ExternalLink, Image as ImageIcon } from 'lucide-react';
import type { Article } from '../types';

interface ArticleCardProps {
  article: Article;
  onTogglePin: (id: string, currentStatus: boolean) => void;
  onToggleHide: (id: string, currentStatus: boolean) => void;
  onDelete: (id: string, title: string) => void;
}

export const ArticleCard: React.FC<ArticleCardProps> = ({ article, onTogglePin, onToggleHide, onDelete }) => {
  return (
    <div className={`bg-white border rounded-xl overflow-hidden shadow-sm flex flex-col transition-all ${article.is_hidden ? 'opacity-60 border-gray-200' : 'border-gray-200 hover:shadow-md'} ${article.is_pinned ? 'ring-2 ring-orange-400 border-transparent' : ''}`}>
      
      {/* Image Area */}
      <div className="h-40 bg-gray-100 relative group overflow-hidden">
        {article.image_url ? (
          <img src={article.image_url} alt={article.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300">
            <ImageIcon className="w-10 h-10" />
          </div>
        )}
        
        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 items-start">
          {article.is_pinned && <span className="bg-orange-500 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-sm flex items-center"><Pin className="w-3 h-3 mr-1" /> PINNED</span>}
          {article.is_custom ? (
            <span className="bg-purple-600 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-sm">CUSTOM POST</span>
          ) : (
            <span className="bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-sm">AI SYNCED</span>
          )}
          {article.is_hidden && <span className="bg-gray-800 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-sm flex items-center"><EyeOff className="w-3 h-3 mr-1" /> HIDDEN</span>}
        </div>
      </div>

      {/* Content Area */}
      <div className="p-4 flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-2">
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">{article.source_name}</span>
          <span className="text-[10px] text-gray-400">{new Date(article.published_at).toLocaleDateString()}</span>
        </div>
        
        <h3 className="font-bold text-gray-900 text-sm mb-2 line-clamp-2" title={article.title}>{article.title}</h3>
        <p className="text-sm text-gray-600 line-clamp-3 mb-4 flex-1">{article.summary}</p>
        
        {/* Actions Footer */}
        <div className="pt-3 border-t border-gray-100 flex items-center justify-between mt-auto">
          {article.source_url ? (
            <a href={article.source_url} target="_blank" rel="noreferrer" className="text-xs text-primary font-semibold flex items-center hover:underline">
              <ExternalLink className="w-3.5 h-3.5 mr-1" /> Read Source
            </a>
          ) : (
            <span className="text-xs text-gray-400 font-medium">Native Article</span>
          )}

          <div className="flex items-center gap-1">
            <button 
              onClick={() => onTogglePin(article.id, article.is_pinned)}
              className={`p-1.5 rounded transition-colors ${article.is_pinned ? 'text-orange-600 bg-orange-50' : 'text-gray-400 hover:text-gray-700 hover:bg-gray-100'}`}
              title={article.is_pinned ? "Unpin Article" : "Pin Article"}
            >
              <Pin className="w-4 h-4" />
            </button>
            <button 
              onClick={() => onToggleHide(article.id, article.is_hidden)}
              className={`p-1.5 rounded transition-colors ${article.is_hidden ? 'text-gray-800 bg-gray-200' : 'text-gray-400 hover:text-gray-700 hover:bg-gray-100'}`}
              title={article.is_hidden ? "Unhide Article" : "Hide Article"}
            >
              {article.is_hidden ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
            <button 
              onClick={() => onDelete(article.id, article.title)}
              className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
              title="Delete Article"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};