
import React, { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ContentItem, ContentType } from '../types';
import { ContentCard } from '../components/ContentCard';
import { ArrowLeft, Book, Eye, Heart, Award, Sparkles, LayoutGrid } from 'lucide-react';

interface Props {
  items: ContentItem[];
  onDelete?: (id: string) => void;
}

export const AuthorProfile: React.FC<Props> = ({ items, onDelete }) => {
  const { authorName } = useParams<{ authorName: string }>();
  const navigate = useNavigate();

  const authorWorks = useMemo(() => {
    return items.filter(item => item.author === authorName);
  }, [items, authorName]);

  const stats = useMemo(() => {
    const totalViews = authorWorks.reduce((acc, curr) => acc + (curr.views || 0), 0);
    const totalLikes = authorWorks.reduce((acc, curr) => acc + (curr.likes?.length || 0), 0);
    return { totalViews, totalLikes, count: authorWorks.length };
  }, [authorWorks]);

  if (!authorName) return null;

  return (
    <div className="pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header Profile */}
      <div className="relative mb-16">
        <button 
          onClick={() => navigate(-1)} 
          className="mb-8 flex items-center gap-2 text-stone-500 hover:text-brand-600 font-black text-[10px] uppercase tracking-widest transition-all"
        >
          <ArrowLeft size={16} /> Quay lại
        </button>

        <div className="bg-white dark:bg-brand-900/20 border border-brand-100 dark:border-brand-800 rounded-[3.5rem] p-10 md:p-16 shadow-2xl relative overflow-hidden">
          {/* Background Decor */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-brand-600/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>
          
          <div className="flex flex-col md:flex-row items-center gap-10 relative z-10">
            <div className="relative">
              <div className="w-40 h-40 rounded-[2.5rem] overflow-hidden border-4 border-white dark:border-brand-800 shadow-2xl bg-white">
                <img 
                  src={`https://api.dicebear.com/7.x/identicon/svg?seed=${authorName}&backgroundColor=b6e3f4,c0aede,d1d4f9`} 
                  className="w-full h-full object-cover"
                  alt={authorName}
                />
              </div>
              <div className="absolute -bottom-4 -right-4 bg-amber-500 text-white p-3 rounded-2xl shadow-xl border-4 border-white dark:border-brand-800">
                <Award size={24} />
              </div>
            </div>

            <div className="text-center md:text-left flex-1">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-4">
                <h1 className="text-4xl md:text-5xl font-black text-stone-900 dark:text-white uppercase tracking-tighter">
                  {authorName}
                </h1>
                <span className="px-3 py-1 bg-brand-600 text-white rounded-full text-[10px] font-black uppercase tracking-widest">
                  Tác giả uy tín
                </span>
              </div>
              <p className="text-stone-500 dark:text-stone-400 max-w-2xl text-lg font-medium leading-relaxed mb-8">
                Chào mừng bạn đến với thế giới sáng tạo của {authorName}. Nơi những câu chuyện được kể bằng cả trái tim và niềm đam mê.
              </p>

              <div className="flex flex-wrap justify-center md:justify-start gap-6">
                <div className="flex flex-col">
                  <span className="text-2xl font-black text-stone-900 dark:text-white">{stats.count}</span>
                  <span className="text-[10px] font-black text-stone-400 uppercase tracking-widest">Tác phẩm</span>
                </div>
                <div className="w-px h-10 bg-brand-100 dark:bg-brand-800 hidden sm:block"></div>
                <div className="flex flex-col">
                  <span className="text-2xl font-black text-stone-900 dark:text-white">
                    {stats.totalViews >= 1000 ? `${(stats.totalViews/1000).toFixed(1)}k` : stats.totalViews}
                  </span>
                  <span className="text-[10px] font-black text-stone-400 uppercase tracking-widest">Tổng lượt xem</span>
                </div>
                <div className="w-px h-10 bg-brand-100 dark:bg-brand-800 hidden sm:block"></div>
                <div className="flex flex-col">
                  <span className="text-2xl font-black text-stone-900 dark:text-white">{stats.totalLikes}</span>
                  <span className="text-[10px] font-black text-stone-400 uppercase tracking-widest">Yêu thích</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Works Grid */}
      <section>
        <div className="flex items-center justify-between mb-10 border-b border-brand-100 dark:border-brand-900/40 pb-6">
          <h2 className="text-2xl font-black text-stone-900 dark:text-white flex items-center gap-3">
            <LayoutGrid className="text-brand-600" /> Kệ truyện của {authorName}
          </h2>
          <div className="text-[10px] font-black text-stone-400 uppercase tracking-[0.2em] bg-brand-50 dark:bg-brand-900/40 px-4 py-2 rounded-xl">
            Tất cả thể loại
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8">
          {authorWorks.map(item => (
            <ContentCard 
              key={item.id} 
              item={item} 
              onDelete={onDelete} 
            />
          ))}
        </div>
      </section>
    </div>
  );
};
