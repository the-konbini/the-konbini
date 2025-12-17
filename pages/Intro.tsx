
import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ContentItem, ContentType, User, UserRole } from '../types';
import { 
  ArrowLeft, BookOpen, Eye, Heart, Calendar, 
  Share2, PlayCircle, Book, FileText, ChevronRight,
  Clock, CheckCircle2, List, ArrowUpDown, Sparkles, Bookmark, LogIn, Edit3, Trash2,
  Coffee, Gift, HeartHandshake
} from 'lucide-react';
import { AuthorModal } from '../components/AuthorModal';
import { DatabaseService } from '../services/database';

interface Props {
  items: ContentItem[];
  currentUser: User;
  onUpdateUser: (user: User) => void;
  onLoginRequest: () => void;
}

export const Intro: React.FC<Props> = ({ items, currentUser, onUpdateUser, onLoginRequest }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [item, setItem] = useState<ContentItem | undefined>(undefined);
  const [selectedAuthor, setSelectedAuthor] = useState<string | null>(null);
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  const isAdmin = currentUser.role === UserRole.ADMIN;
  const isFavorite = currentUser.favorites?.includes(id || '');

  useEffect(() => {
    const found = items.find(i => i.id === id);
    if (found) {
      setItem(found);
      setLikesCount(found.likes?.length || 0);
      setIsLiked(found.likes?.includes(currentUser.id) || false);
    }
    window.scrollTo(0, 0);
  }, [id, items, currentUser.id]);

  const handleToggleLike = async () => {
    if (!id) return;
    const result = await DatabaseService.toggleLike(id, currentUser.id);
    setLikesCount(result.likes);
    setIsLiked(result.isLiked);
  };

  const handleToggleFavorite = async () => {
    if (currentUser.isAnonymous) {
      setShowLoginPrompt(true);
      return;
    }
    if (!id) return;
    const updatedUser = await DatabaseService.toggleFavorite(currentUser, id);
    onUpdateUser(updatedUser);
  };

  const sortedChapters = useMemo(() => {
    if (!item) return [];
    const chapters = [...item.chapters].map((ch, idx) => ({ ...ch, originalIndex: idx }));
    return sortOrder === 'asc' ? chapters : chapters.reverse();
  }, [item, sortOrder]);

  if (!item) return null;

  const Icon = item.type === ContentType.VIDEO ? PlayCircle : (item.type === ContentType.COMIC ? Book : FileText);
  const typeLabel = item.type === ContentType.NOVEL ? 'Truyện chữ' : item.type === ContentType.COMIC ? 'Truyện tranh' : 'Video';

  return (
    <div className="pb-20 animate-in fade-in duration-700">
      <AuthorModal isOpen={!!selectedAuthor} authorName={selectedAuthor || ''} onClose={() => setSelectedAuthor(null)} />

      {showLoginPrompt && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm" onClick={() => setShowLoginPrompt(false)}></div>
          <div className="relative bg-white dark:bg-surface-dark p-10 rounded-[3rem] shadow-2xl border border-brand-100 dark:border-brand-800 text-center max-w-sm">
            <div className="w-16 h-16 bg-brand-100 dark:bg-brand-900 rounded-full flex items-center justify-center mx-auto mb-6 text-brand-600">
              <Bookmark size={32} />
            </div>
            <h3 className="text-xl font-black uppercase tracking-tight mb-2">Lưu vào bộ sưu tập</h3>
            <p className="text-sm text-stone-500 mb-8 font-medium">Vui lòng đăng nhập để lưu truyện và đồng bộ tiến độ đọc trên mọi thiết bị.</p>
            <div className="space-y-3">
              <button 
                onClick={() => { onLoginRequest(); setShowLoginPrompt(false); }}
                className="w-full py-4 bg-brand-600 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 shadow-lg"
              >
                <LogIn size={16} /> Đăng nhập ngay
              </button>
              <button onClick={() => setShowLoginPrompt(false)} className="w-full py-3 text-stone-400 font-bold text-xs">Để sau</button>
            </div>
          </div>
        </div>
      )}

      <div className="absolute top-0 left-0 right-0 h-[550px] overflow-hidden -z-10 pointer-events-none">
        <img src={item.coverUrl} className="w-full h-full object-cover blur-3xl opacity-25 dark:opacity-10 scale-110" alt="" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-surface-light/50 dark:via-surface-dark/50 to-surface-light dark:to-surface-dark"></div>
      </div>

      <div className="flex items-center justify-between mb-10">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-stone-500 hover:text-brand-600 font-black text-[10px] uppercase tracking-widest transition-all">
          <ArrowLeft size={16} /> Quay lại
        </button>
        
        {isAdmin && (
          <div className="flex gap-2">
            <Link 
              to={`/studio/${item.id}`}
              className="flex items-center gap-2 px-6 py-3 bg-brand-50 dark:bg-brand-900/40 text-brand-600 dark:text-brand-300 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-brand-200 dark:border-brand-800 hover:bg-brand-600 hover:text-white transition-all shadow-sm"
            >
              <Edit3 size={16} /> Sửa tác phẩm
            </Link>
          </div>
        )}
      </div>

      <div className="grid lg:grid-cols-12 gap-10 lg:gap-16">
        <div className="lg:col-span-4 space-y-8">
          <div className="relative group">
            <div className="aspect-[3/4] rounded-[3rem] overflow-hidden shadow-2xl ring-1 ring-brand-100 dark:ring-brand-900/50 bg-white">
              <img src={item.coverUrl} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" alt={item.title} />
            </div>
            <div className="absolute -bottom-4 -right-4 p-5 bg-brand-600 text-white rounded-[2rem] shadow-2xl shadow-brand-600/30 ring-4 ring-white dark:ring-surface-dark">
              <Icon size={32} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button 
              onClick={handleToggleLike}
              className={`flex items-center justify-center gap-2 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all active:scale-95 border ${
                isLiked 
                ? 'bg-rose-500 border-rose-500 text-white shadow-lg shadow-rose-500/30' 
                : 'bg-white dark:bg-brand-900/20 border-brand-100 dark:border-brand-800 text-stone-500 hover:border-brand-300'
              }`}
            >
              <Heart size={18} className={isLiked ? 'fill-current' : ''} />
              {likesCount} Thích
            </button>
            <button 
              onClick={handleToggleFavorite}
              className={`flex items-center justify-center gap-2 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all active:scale-95 border ${
                isFavorite 
                ? 'bg-brand-700 border-brand-700 text-white shadow-lg shadow-brand-700/20' 
                : 'bg-white dark:bg-brand-900/20 border-brand-100 dark:border-brand-800 text-stone-500 hover:border-brand-300'
              }`}
            >
              <Bookmark size={18} className={isFavorite ? 'fill-current' : ''} />
              {isFavorite ? 'Đã lưu' : 'Bộ sưu tập'}
            </button>
          </div>
          
          <button className="w-full flex items-center justify-center gap-2 py-4 bg-white dark:bg-brand-900/20 border border-brand-100 dark:border-brand-800 text-stone-500 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-brand-50 hover:border-brand-300 transition-all active:scale-95">
              <Share2 size={18} /> Chia sẻ trạm dừng
          </button>
        </div>

        <div className="lg:col-span-8 space-y-12">
          <div className="space-y-6">
            <div className="flex flex-wrap items-center gap-3">
              <span className="px-4 py-1.5 bg-brand-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-brand-600/20">
                {typeLabel}
              </span>
              <span className="flex items-center gap-1.5 px-4 py-1.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-xl text-[10px] font-black uppercase tracking-widest border border-emerald-100 dark:border-emerald-800">
                <CheckCircle2 size={12} /> {item.status || "Đang cập nhật"}
              </span>
            </div>
            <h1 className="text-5xl md:text-7xl font-black text-stone-900 dark:text-white leading-[0.9] uppercase tracking-tighter">
              {item.title}
            </h1>
            <div className="flex items-center gap-6 text-sm font-bold">
              <button 
                onClick={() => setSelectedAuthor(item.author)}
                className="flex items-center gap-2 text-brand-600 dark:text-brand-400 hover:text-brand-800 transition-colors group"
              >
                <div className="w-8 h-8 rounded-full bg-brand-100 dark:bg-brand-900 overflow-hidden">
                    <img src={`https://api.dicebear.com/7.x/identicon/svg?seed=${item.author}`} alt="" />
                </div>
                <span className="group-hover:underline">{item.author}</span>
              </button>
              <div className="w-1.5 h-1.5 rounded-full bg-stone-200 dark:bg-brand-800"></div>
              <span className="text-stone-400 flex items-center gap-1.5"><Eye size={18} /> {item.views.toLocaleString()}</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-4">
            <Link 
              to={`/read/${item.id}/0`}
              className="flex-1 min-w-[240px] flex items-center justify-center gap-3 py-6 bg-brand-600 hover:bg-brand-500 text-white rounded-[2rem] font-black uppercase tracking-[0.2em] text-xs shadow-2xl shadow-brand-600/30 transition-all hover:-translate-y-1 active:scale-95"
            >
              Bắt đầu {item.type === ContentType.VIDEO ? 'xem' : 'đọc'} ngay <ChevronRight size={20} />
            </Link>
          </div>

          <div className="space-y-6">
            <div className="flex items-center gap-3 border-b border-brand-100 dark:border-brand-800 pb-4">
               <Sparkles size={18} className="text-brand-600" />
               <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-stone-400">Giới thiệu tác phẩm</h3>
            </div>
            <p className="text-xl text-stone-600 dark:text-stone-300 leading-relaxed font-serif italic first-letter:text-5xl first-letter:font-black first-letter:text-brand-600 first-letter:mr-3 first-letter:float-left">
              {item.description}
            </p>
            <div className="flex flex-wrap gap-2 pt-4">
              {item.tags.map(tag => (
                <span key={tag} className="px-4 py-2 bg-stone-100 dark:bg-brand-900/30 text-stone-500 dark:text-brand-400 rounded-xl text-[10px] font-black uppercase tracking-wider border border-transparent hover:border-brand-200 transition-all cursor-default">#{tag}</span>
              ))}
            </div>

            {/* KHUNG "GIVE US A TEA" ĐÃ CẬP NHẬT */}
            <div className="mt-8 relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-brand-400 to-brand-600 rounded-[2rem] blur opacity-10 group-hover:opacity-20 transition duration-1000 group-hover:duration-200"></div>
                <div className="relative bg-white dark:bg-brand-900/20 border border-brand-100 dark:border-brand-800 p-6 md:p-8 rounded-[2rem] flex flex-col md:flex-row items-center gap-6 shadow-sm overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                        <Coffee size={80} className="rotate-12" />
                    </div>
                    <div className="w-16 h-16 bg-brand-50 dark:bg-brand-950 rounded-2xl flex items-center justify-center text-brand-600 shadow-inner flex-shrink-0 animate-bounce transition-all duration-[2000ms]">
                        <Coffee size={32} />
                    </div>
                    <div className="flex-1 text-center md:text-left">
                        <h4 className="text-sm font-black text-stone-900 dark:text-white uppercase tracking-tight mb-1">Mời team một ly trà đá?</h4>
                        <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed max-w-sm font-medium">
                            Sự ủng hộ của bạn là động lực cực lớn để Team The Konbini tiếp tục duy trì và nâng cấp.
                        </p>
                    </div>
                    {/* THAY ĐỔI: Chuyển button thành thẻ 'a' với href */}
                    <a 
                      href="https://your-qr-link-here.com" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="px-6 py-3 bg-brand-900 dark:bg-brand-800 text-white rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-stone-800 transition-all active:scale-95 shadow-lg"
                    >
                        <Gift size={16} /> Ủng hộ trà đá
                    </a>
                </div>
            </div>
          </div>

          <div className="bg-white dark:bg-[#120d08] border border-brand-100 dark:border-brand-900/50 rounded-[3rem] p-1 shadow-2xl overflow-hidden">
            <div className="p-8 border-b border-brand-50 dark:border-brand-900/30 flex items-center justify-between">
              <h3 className="text-sm font-black uppercase tracking-[0.2em] text-stone-900 dark:text-white flex items-center gap-3">
                <List size={22} className="text-brand-600" /> Mục lục <span className="text-stone-400">({item.chapters.length})</span>
              </h3>
              <button 
                onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                className="flex items-center gap-2 px-4 py-2 bg-brand-50 dark:bg-brand-950 text-[10px] font-black uppercase tracking-widest text-brand-600 rounded-xl border border-brand-100 dark:border-brand-800 hover:bg-brand-100 transition-all"
              >
                <ArrowUpDown size={14} /> {sortOrder === 'asc' ? 'Cũ nhất' : 'Mới nhất'}
              </button>
            </div>
            <div className="max-h-[500px] overflow-y-auto custom-scrollbar">
              <div className="divide-y divide-brand-50 dark:divide-brand-900/20">
                {sortedChapters.map((chapter) => (
                  <Link 
                    key={chapter.id} 
                    to={`/read/${item.id}/${chapter.originalIndex}`}
                    className="flex items-center justify-between p-6 hover:bg-brand-50/50 dark:hover:bg-brand-900/10 transition-all group"
                  >
                    <div className="flex items-center gap-6 min-w-0">
                      <span className="text-sm font-black text-stone-300 dark:text-brand-900 group-hover:text-brand-600 transition-colors w-6">
                        {(chapter.originalIndex + 1).toString().padStart(2, '0')}
                      </span>
                      <div className="min-w-0">
                        <p className="text-base font-bold text-stone-800 dark:text-stone-200 group-hover:text-brand-600 transition-all truncate">
                          {chapter.title}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6 flex-shrink-0">
                        <span className="hidden sm:flex items-center gap-1.5 text-[10px] font-black text-stone-400 uppercase tracking-widest bg-brand-50/50 dark:bg-brand-950 px-3 py-1 rounded-lg">
                            <Clock size={12} /> {chapter.createdAt}
                        </span>
                        <div className="w-10 h-10 rounded-full bg-brand-50 dark:bg-brand-900 flex items-center justify-center text-brand-600 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 translate-x-4 transition-all shadow-md">
                            <ChevronRight size={20} />
                        </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
