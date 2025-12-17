
import React, { useState, useMemo } from 'react';
import { ContentCard } from '../components/ContentCard';
import { ContentItem, ContentType } from '../types';
import { AuthorModal } from '../components/AuthorModal';
import { TrendingUp, Flame, BookText, ImageIcon, PlayCircle, Trophy, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Props {
  items: ContentItem[];
  onDelete: (id: string) => void;
}

export const Home: React.FC<Props> = ({ items, onDelete }) => {
  const [selectedAuthor, setSelectedAuthor] = useState<string | null>(null);

  // Hàm tính điểm HOT
  const getHotScore = (item: ContentItem) => (item.views || 0) + (item.likes?.length || 0) * 5;

  // Lấy Top 5 cho từng loại
  const topNovels = useMemo(() => 
    items.filter(i => i.type === ContentType.NOVEL)
         .sort((a, b) => getHotScore(b) - getHotScore(a))
         .slice(0, 5), [items]);

  const topComics = useMemo(() => 
    items.filter(i => i.type === ContentType.COMIC)
         .sort((a, b) => getHotScore(b) - getHotScore(a))
         .slice(0, 5), [items]);

  const topVideos = useMemo(() => 
    items.filter(i => i.type === ContentType.VIDEO)
         .sort((a, b) => getHotScore(b) - getHotScore(a))
         .slice(0, 5), [items]);

  // Siêu phẩm số 1 toàn trạm
  const absoluteTop = useMemo(() => 
    [...items].sort((a, b) => getHotScore(b) - getHotScore(a))[0], [items]);

  const RankingSection = ({ title, icon: Icon, items: rankItems, type }: { title: string, icon: any, items: ContentItem[], type: string }) => {
    if (rankItems.length === 0) return null;
    
    return (
      <section className="mb-20">
        <div className="flex items-center justify-between mb-8 border-b border-brand-100 dark:border-brand-900/50 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-brand-600 text-white rounded-xl shadow-lg">
              <Icon size={20} />
            </div>
            <div>
              <h2 className="text-xl font-black text-stone-900 dark:text-white uppercase tracking-tight">{title}</h2>
              <p className="text-[10px] font-bold text-stone-400 dark:text-brand-600 uppercase tracking-[0.2em]">Bảng xếp hạng phổ biến</p>
            </div>
          </div>
          <Link to={`/search`} className="text-[10px] font-black text-brand-600 dark:text-brand-400 uppercase tracking-widest hover:underline flex items-center gap-1">
            Xem tất cả <ChevronRight size={14} />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
          {rankItems.map((item, idx) => (
            <div key={item.id} className="relative">
              {/* Badge Xếp Hạng */}
              <div className={`absolute -top-3 -left-2 z-10 w-9 h-9 rounded-xl flex items-center justify-center font-black shadow-lg border-2 rotate-[-12deg] text-xs transition-transform hover:rotate-0 cursor-default ${
                idx === 0 ? 'bg-gradient-to-br from-amber-300 via-amber-500 to-amber-600 text-white border-white' :
                idx === 1 ? 'bg-gradient-to-br from-slate-200 via-slate-400 to-slate-500 text-white border-white' :
                idx === 2 ? 'bg-gradient-to-br from-orange-400 via-orange-600 to-orange-700 text-white border-white' :
                'bg-white dark:bg-brand-900 text-stone-400 border-brand-100 dark:border-brand-800'
              }`}>
                {idx === 0 ? <Trophy size={14} /> : idx + 1}
              </div>
              <ContentCard 
                item={item} 
                onDelete={onDelete} 
                onAuthorClick={(name) => setSelectedAuthor(name)}
              />
            </div>
          ))}
        </div>
      </section>
    );
  };

  return (
    <div className="pb-20 animate-in fade-in duration-700">
      <AuthorModal 
        isOpen={!!selectedAuthor} 
        authorName={selectedAuthor || ''} 
        onClose={() => setSelectedAuthor(null)} 
      />

      {/* Hero Spotlight - Vô địch tuyệt đối */}
      {absoluteTop && (
        <section className="mb-20">
          <div className="flex items-center gap-2 mb-6 text-brand-600 dark:text-brand-400">
            <Flame size={24} className="animate-pulse" />
            <h2 className="text-sm font-black uppercase tracking-[0.3em]">Siêu phẩm dẫn đầu Trạm</h2>
          </div>
          <ContentCard 
            item={absoluteTop} 
            featured={true} 
            onDelete={onDelete} 
            onAuthorClick={(name) => setSelectedAuthor(name)}
          />
        </section>
      )}

      {items.length === 0 ? (
        <div className="text-center py-24 text-stone-500 border-2 border-dashed border-brand-200 dark:border-brand-800 rounded-[3rem] bg-brand-50/50 dark:bg-brand-900/10">
          <div className="w-20 h-20 bg-brand-100 dark:bg-brand-900/50 rounded-full flex items-center justify-center mx-auto mb-6 text-brand-300">
             <TrendingUp size={40} />
          </div>
          <p className="text-xl font-black text-stone-900 dark:text-brand-100 mb-2 uppercase tracking-tight">Trạm chưa có bảng xếp hạng</p>
          <p className="text-sm font-medium text-stone-400">Hãy đăng tác phẩm để bắt đầu cuộc đua!</p>
        </div>
      ) : (
        <div className="space-y-4">
          <RankingSection 
            title="Xếp hạng Tiểu thuyết" 
            icon={BookText} 
            items={topNovels} 
            type={ContentType.NOVEL} 
          />
          
          <RankingSection 
            title="Xếp hạng Truyện tranh" 
            icon={ImageIcon} 
            items={topComics} 
            type={ContentType.COMIC} 
          />
          
          <RankingSection 
            title="Xếp hạng Video" 
            icon={PlayCircle} 
            items={topVideos} 
            type={ContentType.VIDEO} 
          />
        </div>
      )}
    </div>
  );
};
