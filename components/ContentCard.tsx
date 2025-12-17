
import React from 'react';
import { Link } from 'react-router-dom';
import { Play, Book, FileText, Eye, Trash2 } from 'lucide-react';
import { ContentItem, ContentType } from '../types';

interface Props {
  item: ContentItem;
  featured?: boolean;
  onDelete?: (id: string) => void;
  onAuthorClick?: (authorName: string) => void;
}

export const ContentCard: React.FC<Props> = ({ item, featured = false, onDelete, onAuthorClick }) => {
  const Icon = item.type === ContentType.VIDEO ? Play : (item.type === ContentType.COMIC ? Book : FileText);
  
  const handleDeleteClick = (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (onDelete) onDelete(item.id);
  }

  const handleAuthorClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onAuthorClick) onAuthorClick(item.author);
  }

  if (featured) {
    return (
      <Link to={`/intro/${item.id}`} className="group relative block w-full h-64 md:h-96 rounded-3xl overflow-hidden shadow-2xl shadow-brand-900/50 dark:shadow-black ring-1 ring-brand-200 dark:ring-brand-800/50">
        <img 
          src={item.coverUrl} 
          alt={item.title} 
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-950 via-brand-900/40 to-transparent flex flex-col justify-end p-6 md:p-10">
          <div className="flex items-center gap-2 mb-3">
             <span className="px-3 py-1 text-xs font-bold uppercase tracking-wider bg-brand-600 text-white rounded-full shadow-lg shadow-brand-600/40">
                Nổi bật
             </span>
             <span className="px-3 py-1 text-xs font-bold uppercase tracking-wider bg-brand-900/80 backdrop-blur-md text-brand-200 rounded-full border border-brand-700">
               {item.type === ContentType.NOVEL ? 'Truyện chữ' : item.type === ContentType.COMIC ? 'Truyện tranh' : 'Video'}
             </span>
          </div>
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-2 leading-tight drop-shadow-lg">{item.title}</h2>
          <p className="text-brand-100 line-clamp-2 max-w-2xl text-sm md:text-lg mb-4 opacity-90">{item.description}</p>
          <div onClick={handleAuthorClick} className="text-white/80 hover:text-white font-bold text-sm transition-colors cursor-pointer w-fit">
            Bởi {item.author}
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link to={`/intro/${item.id}`} className="group flex flex-col bg-white dark:bg-brand-900/20 rounded-2xl overflow-hidden hover:bg-brand-50 dark:hover:bg-brand-900/40 transition-all border border-brand-100 dark:border-brand-800 hover:border-brand-500/50 shadow-sm hover:shadow-md">
      <div className="relative aspect-[3/4] overflow-hidden">
        <img 
          src={item.coverUrl} 
          alt={item.title} 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute top-2 right-2 flex gap-2">
             <div className="bg-brand-950/60 backdrop-blur-md p-1.5 rounded-lg text-white">
                <Icon size={16} />
            </div>
            {onDelete && (
                <button 
                    onClick={handleDeleteClick}
                    className="bg-red-500/80 hover:bg-red-600 backdrop-blur-md p-1.5 rounded-lg text-white transition-colors"
                    title="Xóa tác phẩm"
                >
                    <Trash2 size={16} />
                </button>
            )}
        </div>
      </div>
      <div className="p-4 flex-1 flex flex-col">
        <h3 className="text-lg font-bold text-stone-900 dark:text-brand-100 mb-1 line-clamp-1 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">{item.title}</h3>
        <p className="text-sm text-stone-600 dark:text-brand-300/80 line-clamp-2 mb-3 flex-1">{item.description}</p>
        <div className="flex items-center justify-between text-xs text-stone-500 dark:text-brand-400 mt-auto">
           <span 
            onClick={handleAuthorClick}
            className="font-bold text-brand-600 dark:text-brand-400 hover:text-brand-800 dark:hover:text-brand-200 transition-colors cursor-pointer"
           >
            {item.author}
           </span>
           <span className="flex items-center gap-1 font-bold"><Eye size={12}/> {item.views >= 1000 ? `${(item.views/1000).toFixed(1)}k` : item.views}</span>
        </div>
      </div>
    </Link>
  );
};
