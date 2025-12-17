
import React, { useState, useMemo } from 'react';
import { ContentCard } from '../components/ContentCard';
import { ContentItem, ContentType } from '../types';
import { Search as SearchIcon, Filter, X, Tag, User, BookOpen, Check, LayoutGrid } from 'lucide-react';
import { AuthorModal } from '../components/AuthorModal';

interface Props {
  items: ContentItem[];
  onDelete: (id: string) => void;
}

export const Search: React.FC<Props> = ({ items, onDelete }) => {
  const [query, setQuery] = useState('');
  const [selectedType, setSelectedType] = useState<ContentType | 'all'>('all');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isFilterOpen, setIsFilterOpen] = useState(true);
  const [selectedAuthor, setSelectedAuthor] = useState<string | null>(null);

  // Trích xuất tất cả các thẻ duy nhất
  const allTags = useMemo(() => {
    const tagsSet = new Set<string>();
    items.forEach(item => {
      item.tags.forEach(tag => tagsSet.add(tag));
    });
    return Array.from(tagsSet).sort();
  }, [items]);

  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const matchesQuery = query === '' || 
        item.title.toLowerCase().includes(query.toLowerCase()) || 
        item.author.toLowerCase().includes(query.toLowerCase());
      
      const matchesType = selectedType === 'all' || item.type === selectedType;
      
      const matchesTags = selectedTags.length === 0 || 
        selectedTags.every(tag => item.tags.includes(tag));
      
      return matchesQuery && matchesType && matchesTags;
    });
  }, [items, query, selectedType, selectedTags]);

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const clearFilters = () => {
    setQuery('');
    setSelectedType('all');
    setSelectedTags([]);
  };

  return (
    <div className="pb-20 animate-in fade-in duration-500">
      <AuthorModal 
        isOpen={!!selectedAuthor} 
        authorName={selectedAuthor || ''} 
        onClose={() => setSelectedAuthor(null)} 
      />

      <div className="mb-10">
        <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl md:text-3xl font-black text-stone-900 dark:text-white flex items-center gap-3">
            <div className="w-2 h-10 bg-brand-600 rounded-full"></div>
            Tìm kiếm & Khám phá
            </h2>
            <button 
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-brand-900/60 text-brand-600 dark:text-brand-300 rounded-xl text-sm font-bold border border-brand-200 dark:border-brand-800 transition-all active:scale-95 shadow-sm"
            >
                <Filter size={18} />
                <span className="hidden sm:inline">{isFilterOpen ? 'Ẩn bộ lọc' : 'Hiện bộ lọc'}</span>
            </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters */}
          <aside className={`lg:w-72 space-y-6 transition-all duration-300 ${isFilterOpen ? 'opacity-100' : 'hidden lg:block lg:opacity-50'}`}>
            <div className="bg-white dark:bg-brand-900/20 border border-brand-100 dark:border-brand-800/60 rounded-[2.5rem] p-8 sticky top-24 shadow-sm">
              <div className="flex items-center justify-between mb-8">
                <h3 className="font-black text-stone-800 dark:text-brand-100 flex items-center gap-2 uppercase tracking-widest text-[10px]">
                  BỘ LỌC CHUYÊN SÂU
                </h3>
                <button 
                  onClick={clearFilters}
                  className="text-[10px] font-black text-stone-400 dark:text-brand-500 hover:text-brand-600 dark:hover:text-amber-400 transition-colors uppercase"
                >
                  Xóa tất cả
                </button>
              </div>

              {/* Phân loại theo loại */}
              <div className="mb-10">
                <p className="text-[10px] font-black text-brand-600/50 dark:text-brand-400/40 uppercase tracking-[0.2em] mb-4">Phân loại</p>
                <div className="space-y-1.5">
                  {[
                    { id: 'all', label: 'Tất cả tác phẩm' },
                    { id: ContentType.NOVEL, label: 'Truyện chữ' },
                    { id: ContentType.COMIC, label: 'Truyện tranh' },
                    { id: ContentType.VIDEO, label: 'Phim & Video' },
                  ].map(t => (
                    <button
                      key={t.id}
                      onClick={() => setSelectedType(t.id as any)}
                      className={`w-full text-left px-4 py-3 rounded-2xl text-xs transition-all border font-bold active:scale-95 ${
                        selectedType === t.id 
                        ? 'bg-brand-600 dark:bg-amber-600 text-white border-transparent shadow-lg shadow-brand-600/20' 
                        : 'text-stone-500 dark:text-brand-300 hover:bg-brand-50 dark:hover:bg-brand-800/40 border-transparent hover:text-brand-600 dark:hover:text-white'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tags Filter */}
              <div>
                <p className="text-[10px] font-black text-brand-600/50 dark:text-brand-400/40 uppercase tracking-[0.2em] mb-4">Từ khóa phổ biến</p>
                <div className="flex flex-wrap gap-2">
                  {allTags.map(tag => {
                    const isSelected = selectedTags.includes(tag);
                    return (
                      <button
                        key={tag}
                        onClick={() => toggleTag(tag)}
                        className={`px-3 py-2 rounded-xl text-[10px] transition-all border font-black flex items-center gap-1.5 active:scale-90 ${
                          isSelected
                          ? 'bg-brand-800 dark:bg-amber-500 border-transparent text-white shadow-md'
                          : 'bg-stone-50 dark:bg-brand-800/40 border-stone-200 dark:border-brand-700/50 text-stone-600 dark:text-brand-200 hover:border-brand-400 dark:hover:border-brand-500'
                        }`}
                      >
                        {isSelected && <Check size={10} strokeWidth={4} />}
                        {tag}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content Area */}
          <div className="flex-1">
            <div className="relative mb-10 group">
              <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none transition-colors group-focus-within:text-brand-600">
                <SearchIcon size={22} className="text-stone-400 dark:text-brand-500" />
              </div>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Tên tác phẩm, tác giả hoặc nội dung..."
                className="w-full bg-white dark:bg-brand-900/40 border-2 border-brand-100 dark:border-brand-800 rounded-[2.5rem] py-6 pl-16 pr-14 text-stone-900 dark:text-white placeholder-stone-300 dark:placeholder-brand-700 focus:ring-8 focus:ring-brand-500/5 focus:border-brand-500 dark:focus:border-brand-600 outline-none transition-all shadow-xl font-bold text-lg"
              />
              {query && (
                <button 
                  onClick={() => setQuery('')}
                  className="absolute inset-y-0 right-0 pr-6 flex items-center text-stone-300 hover:text-brand-600 dark:text-brand-600 dark:hover:text-brand-400 transition-colors"
                >
                  <X size={24} />
                </button>
              )}
            </div>

            <div className="flex items-center justify-between mb-8 px-2">
               <div className="flex items-center gap-2 text-sm text-stone-500 dark:text-brand-400 font-bold">
                <LayoutGrid size={16} />
                Kết quả tìm kiếm: <span className="text-brand-600 dark:text-brand-200">{filteredItems.length} tác phẩm</span>
               </div>
               
               {/* Sắp xếp nhanh (Mockup) */}
               <div className="hidden sm:flex items-center gap-4 text-[10px] font-black text-stone-400 dark:text-brand-600 uppercase tracking-widest">
                    <span>Sắp xếp:</span>
                    <button className="text-brand-600 dark:text-amber-500">Mới nhất</button>
                    <button className="hover:text-brand-600">Lượt xem</button>
               </div>
            </div>

            {filteredItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 bg-white dark:bg-brand-900/10 rounded-[3rem] border-2 border-dashed border-brand-100 dark:border-brand-800 shadow-sm">
                <div className="w-24 h-24 bg-brand-50 dark:bg-brand-800/40 rounded-full flex items-center justify-center mb-6 text-brand-200 dark:text-brand-700">
                  <SearchIcon size={48} />
                </div>
                <h3 className="text-2xl font-black text-stone-900 dark:text-brand-100 mb-3">Ồ! Không tìm thấy rồi...</h3>
                <p className="text-stone-400 dark:text-brand-500 max-w-sm text-center font-bold px-6">
                  Bạn có thể thử tìm kiếm với từ khóa khác hoặc dạo bước qua các thẻ phổ biến ở bên trái nhé!
                </p>
                <button 
                  onClick={clearFilters}
                  className="mt-10 px-10 py-4 bg-brand-600 hover:bg-brand-500 dark:bg-brand-800 dark:hover:bg-brand-700 text-white font-black rounded-2xl transition-all shadow-lg shadow-brand-600/20 active:scale-95"
                >
                  XÓA BỘ LỌC VÀ THỬ LẠI
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6 md:gap-8">
                {filteredItems.map(item => (
                  <ContentCard 
                    key={item.id} 
                    item={item} 
                    onDelete={onDelete} 
                    onAuthorClick={(name) => setSelectedAuthor(name)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
