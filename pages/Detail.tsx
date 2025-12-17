
import React, { useEffect, useState, useRef, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ContentItem, ContentType, Comment, User, Chapter } from '../types';
import { DatabaseService } from '../services/database';
import { 
  ArrowLeft, MessageSquare, ThumbsUp, Share2, Eye, 
  Trash2, Check, Send, User as UserIcon, 
  Menu, X, BookOpen,
  Heart, MessageCircle, Clock, History as HistoryIcon, Settings, Type, AlignLeft, Minus, Plus, 
  ArrowUpDown, Languages, PlayCircle, Bookmark, ChevronLeft, ChevronRight, List, Copy
} from 'lucide-react';
import { AuthorModal } from '../components/AuthorModal';

interface Props {
  items: ContentItem[];
  onDelete: (id: string) => void;
  currentUser: User | null;
  onUpdateUser: (user: User) => void;
}

interface ReaderSettings {
  fontSize: number;
  fontFamily: 'serif' | 'sans';
  lineHeight: number;
}

export const Detail: React.FC<Props> = ({ items, onDelete, currentUser, onUpdateUser }) => {
  const { id, chapterIndex: chapterIndexParam } = useParams<{ id: string; chapterIndex: string }>();
  const navigate = useNavigate();
  const [item, setItem] = useState<ContentItem | undefined>(undefined);
  const [currentChapterIndex, setCurrentChapterIndex] = useState(parseInt(chapterIndexParam || '0'));
  const [isToCOpen, setIsToCOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [selectedAuthor, setSelectedAuthor] = useState<string | null>(null);
  
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [showShareToast, setShowShareToast] = useState(false);

  const [comments, setComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [readerSettings, setReaderSettings] = useState<ReaderSettings>(() => {
    const saved = localStorage.getItem('konbini_reader_settings');
    return saved ? JSON.parse(saved) : { fontSize: 18, fontFamily: 'serif', lineHeight: 1.8 };
  });

  useEffect(() => {
    localStorage.setItem('konbini_reader_settings', JSON.stringify(readerSettings));
  }, [readerSettings]);

  useEffect(() => {
    const found = items.find(i => i.id === id);
    if (found) {
      setItem(found);
      setLikesCount(found.likes?.length || 0);
      setIsLiked(found.likes?.includes(currentUser?.id || '') || false);
    }
    
    if (chapterIndexParam !== undefined) {
      const idx = parseInt(chapterIndexParam);
      setCurrentChapterIndex(idx);
      
      // Tự động lưu tiến độ cho thành viên
      if (currentUser && !currentUser.isAnonymous && id) {
        DatabaseService.updateReadingProgress(currentUser, id, idx).then(updated => {
          if (updated) onUpdateUser(updated);
        });
      }
    }
    
    window.scrollTo(0, 0);
    if (id) loadComments(id);
  }, [id, items, chapterIndexParam, currentUser?.id]);

  const loadComments = async (contentId: string) => {
    const data = await DatabaseService.getComments(contentId);
    setComments(data);
  };

  const handleToggleLike = async () => {
    if (!id || !currentUser) return;
    const result = await DatabaseService.toggleLike(id, currentUser.id);
    setLikesCount(result.likes);
    setIsLiked(result.isLiked);
  };

  const handleShare = () => {
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({
        title: item?.title,
        text: `Đang đọc chương ${currentChapterIndex + 1} của ${item?.title} trên The Konbini!`,
        url: url,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(url);
      setShowShareToast(true);
      setTimeout(() => setShowShareToast(false), 2000);
    }
  };

  const handleNextChapter = () => {
    if (item && currentChapterIndex < item.chapters.length - 1) {
      navigate(`/read/${id}/${currentChapterIndex + 1}`);
    }
  };

  const handlePrevChapter = () => {
    if (currentChapterIndex > 0) {
      navigate(`/read/${id}/${currentChapterIndex - 1}`);
    }
  };

  const jumpToChapter = (index: number) => {
    navigate(`/read/${id}/${index}`);
    setIsToCOpen(false);
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || !id || isSubmitting || !currentUser || !item) return;

    setIsSubmitting(true);
    const newComment: Comment = {
      id: Date.now().toString(),
      contentId: id,
      chapterId: item.chapters[currentChapterIndex].id,
      userName: currentUser.name,
      userAvatar: currentUser.avatar,
      userId: currentUser.id,
      text: commentText.trim(),
      createdAt: new Date().toISOString()
    };

    const success = await DatabaseService.addComment(newComment);
    if (success) {
      setComments(prev => [newComment, ...prev]);
      setCommentText('');
    }
    setIsSubmitting(false);
  };

  const currentChapter = item?.chapters[currentChapterIndex];

  const paragraphs = useMemo(() => {
    if (!currentChapter?.content) return [];
    const cleanContent = currentChapter.content.replace(/<p>/g, '').replace(/<br\/>/g, '\n');
    return cleanContent.split(/<\/p>|\n/).filter(p => p.trim().length > 0);
  }, [currentChapter]);

  if (!item || !currentChapter) return null;

  return (
    <div className="relative pb-20 max-w-4xl mx-auto px-4 md:px-0">
      <AuthorModal isOpen={!!selectedAuthor} authorName={selectedAuthor || ''} onClose={() => setSelectedAuthor(null)} />

      {/* Share Toast */}
      {showShareToast && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[110] bg-stone-900 text-white px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest flex items-center gap-2 shadow-2xl animate-in fade-in slide-in-from-top-4">
          <Copy size={14} /> Đã sao chép liên kết chương!
        </div>
      )}

      {/* Table of Contents Overlay */}
      {isToCOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsToCOpen(false)}></div>
          <div className="relative w-full max-w-2xl bg-white dark:bg-surface-dark rounded-[3rem] border border-brand-100 dark:border-brand-800 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-8 border-b border-brand-50 dark:border-brand-900 flex items-center justify-between">
              <h3 className="text-xl font-black uppercase tracking-tighter flex items-center gap-3">
                <List className="text-brand-600" /> Mục lục chương
              </h3>
              <button onClick={() => setIsToCOpen(false)} className="p-2 hover:bg-brand-50 dark:hover:bg-brand-900 rounded-full transition-colors">
                <X size={24} />
              </button>
            </div>
            <div className="p-6 max-h-[60vh] overflow-y-auto custom-scrollbar">
              <div className="grid sm:grid-cols-2 gap-3">
                {item.chapters.map((ch, idx) => (
                  <button 
                    key={ch.id}
                    onClick={() => jumpToChapter(idx)}
                    className={`flex items-center gap-4 p-4 rounded-2xl border transition-all text-left ${
                      idx === currentChapterIndex 
                      ? 'bg-brand-600 border-transparent text-white shadow-lg' 
                      : 'bg-brand-50/50 dark:bg-brand-950/30 border-brand-100 dark:border-brand-800 hover:border-brand-500'
                    }`}
                  >
                    <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-black ${idx === currentChapterIndex ? 'bg-white/20' : 'bg-white dark:bg-brand-900 border'}`}>
                      {idx + 1}
                    </span>
                    <span className="text-sm font-bold truncate">{ch.title}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center mb-10">
        <Link to={`/intro/${id}`} className="flex items-center gap-2 text-stone-500 hover:text-brand-600 font-bold transition-colors">
          <ArrowLeft size={18} /> <span className="hidden sm:inline">QUAY LẠI GIỚI THIỆU</span>
        </Link>
        <div className="flex items-center gap-2">
           <button 
            onClick={() => setIsSettingsOpen(true)} 
            className="p-3 bg-brand-50 dark:bg-brand-950/50 rounded-xl border border-brand-100 dark:border-brand-800 text-stone-600 dark:text-brand-400 hover:bg-brand-100 transition-all"
            title="Cài đặt hiển thị"
           >
             <Settings size={20} />
           </button>
           <button 
            onClick={() => setIsToCOpen(true)} 
            className="flex items-center gap-2 px-5 py-3 bg-brand-600 text-white rounded-xl shadow-lg shadow-brand-600/20 text-[10px] font-black uppercase tracking-widest hover:bg-brand-500 active:scale-95 transition-all"
           >
             <List size={18} /> Mục lục
           </button>
        </div>
      </div>

      <article className="bg-white dark:bg-[#120d08] rounded-[3.5rem] border border-brand-100 dark:border-brand-900/40 shadow-2xl overflow-hidden mb-8">
        {item.type === ContentType.NOVEL ? (
           <div 
             className={`p-8 md:p-20 text-stone-800 dark:text-stone-200 transition-all duration-300 ${readerSettings.fontFamily === 'serif' ? 'font-serif' : 'font-sans'}`}
             style={{ fontSize: `${readerSettings.fontSize}px`, lineHeight: readerSettings.lineHeight }}
           >
              <div className="text-center mb-16 space-y-4">
                  <span className="text-[10px] font-black text-brand-500 uppercase tracking-[0.4em]">CHƯƠNG {currentChapterIndex + 1}</span>
                  <h1 className="text-3xl md:text-5xl font-black text-stone-900 dark:text-white leading-tight">
                    {currentChapter.title}
                  </h1>
                  <div className="w-16 h-1.5 bg-brand-500/20 mx-auto rounded-full"></div>
              </div>
              <div className="space-y-10">
                {paragraphs.map((p, idx) => (
                  <p key={idx} className="hover:bg-brand-50/40 dark:hover:bg-brand-900/10 px-4 py-2 rounded-2xl transition-all leading-relaxed">
                    {p.trim()}
                  </p>
                ))}
              </div>
              <div className="mt-20 flex flex-col items-center gap-4 py-10 border-t border-brand-50 dark:border-brand-900/30">
                  <div className="flex gap-2">
                      <div className="w-2 h-2 bg-brand-500 rounded-full opacity-20"></div>
                      <div className="w-2 h-2 bg-brand-500 rounded-full opacity-60"></div>
                      <div className="w-2 h-2 bg-brand-500 rounded-full opacity-20"></div>
                  </div>
                  <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest">Hết chương {currentChapterIndex + 1}</p>
              </div>
           </div>
        ) : (
          <div className="p-0 bg-stone-900">
             {item.type === ContentType.COMIC && (
               <div className="flex flex-col">
                  {currentChapter.pages?.map((p, i) => (
                    <img key={i} src={p} className="w-full h-auto" alt={`Page ${i + 1}`} loading="lazy" />
                  ))}
               </div>
             )}
             {item.type === ContentType.VIDEO && currentChapter.videoUrl && (
               <div className="aspect-video w-full bg-black">
                  <video src={currentChapter.videoUrl} controls className="w-full h-full" poster={item.coverUrl} />
               </div>
             )}
          </div>
        )}
      </article>

      <div className="mb-12 flex flex-col items-center gap-6 animate-in fade-in slide-in-from-bottom-2 duration-700 delay-300">
         <p className="text-[10px] font-black uppercase tracking-[0.3em] text-stone-400">Tiếp thêm động lực cho chủ trạm</p>
         <div className="flex items-center gap-4">
            <button 
              onClick={handleToggleLike}
              className={`flex items-center gap-2 px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all active:scale-95 border ${
                isLiked 
                ? 'bg-rose-500 border-rose-500 text-white shadow-xl shadow-rose-500/30' 
                : 'bg-white dark:bg-brand-900/30 border-brand-100 dark:border-brand-800 text-stone-500 hover:border-brand-400'
              }`}
            >
              <Heart size={18} className={isLiked ? 'fill-current' : ''} />
              {likesCount} Thích
            </button>
            <button 
              onClick={handleShare}
              className="flex items-center gap-2 px-8 py-4 bg-white dark:bg-brand-900/30 border border-brand-100 dark:border-brand-800 text-stone-500 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-brand-50 hover:border-brand-400 transition-all active:scale-95 shadow-sm"
            >
              <Share2 size={18} /> Chia sẻ
            </button>
         </div>
      </div>

      <div className="flex items-center gap-3 mb-24 px-2">
        <button 
          onClick={handlePrevChapter} 
          disabled={currentChapterIndex === 0}
          className="flex-1 py-5 bg-white dark:bg-brand-900/30 border border-brand-100 dark:border-brand-800 rounded-3xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 disabled:opacity-30 active:scale-95 transition-all text-stone-600 dark:text-stone-400"
        >
          <ChevronLeft size={16} /> <span className="hidden sm:inline">Chương trước</span>
        </button>
        <button 
          onClick={() => setIsToCOpen(true)}
          className="p-5 bg-white dark:bg-brand-900/30 border border-brand-100 dark:border-brand-800 rounded-3xl text-brand-600 dark:text-brand-400 hover:bg-brand-50 transition-all active:scale-90"
          title="Mở mục lục"
        >
          <List size={22} />
        </button>
        <button 
          onClick={handleNextChapter}
          disabled={currentChapterIndex === item.chapters.length - 1}
          className="flex-1 py-5 bg-brand-600 text-white rounded-3xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 disabled:opacity-30 active:scale-95 transition-all shadow-xl shadow-brand-600/30"
        >
          <span className="hidden sm:inline">Chương tiếp</span> <ChevronRight size={16} />
        </button>
      </div>

      <section className="space-y-10 px-4 md:px-10">
          <div className="flex items-center justify-between border-b border-brand-100 dark:border-brand-800 pb-6">
            <h3 className="text-xl font-black uppercase tracking-tighter flex items-center gap-3">
              <MessageSquare className="text-brand-600" /> Thảo luận ({comments.length})
            </h3>
          </div>
          
          <form onSubmit={handleCommentSubmit} className="space-y-4">
             <div className="flex gap-4">
                <img src={currentUser?.avatar || `https://api.dicebear.com/7.x/identicon/svg?seed=guest`} className="w-10 h-10 rounded-xl border border-brand-100" alt="" />
                <div className="flex-1 space-y-3">
                    <textarea 
                      value={commentText} onChange={e => setCommentText(e.target.value)}
                      className="w-full bg-white dark:bg-brand-900/20 border border-brand-100 dark:border-brand-800 rounded-3xl p-6 text-sm outline-none focus:border-brand-500 transition-all resize-none shadow-inner"
                      placeholder={currentUser?.isAnonymous ? "Bạn đang bình luận ẩn danh..." : "Cảm nghĩ của bạn về chương này..."}
                      rows={3}
                    />
                    <button className="px-8 py-3 bg-brand-600 hover:bg-brand-500 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-brand-600/20 transition-all active:scale-95">
                      Gửi bình luận
                    </button>
                </div>
             </div>
          </form>
          
          <div className="space-y-6 pt-6">
            {comments.map(c => (
                <div key={c.id} className="flex gap-5 p-6 bg-white dark:bg-brand-900/10 border border-brand-100 dark:border-brand-800 rounded-[2.5rem] transition-all hover:border-brand-300">
                   <img src={c.userAvatar} className="w-12 h-12 rounded-2xl shadow-md" alt="" />
                   <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                          <p className="font-black text-xs text-brand-600 uppercase tracking-widest">{c.userName}</p>
                          <span className="text-[10px] text-stone-400 font-bold">{new Date(c.createdAt).toLocaleDateString('vi-VN')}</span>
                      </div>
                      <p className="text-sm text-stone-700 dark:text-stone-300 leading-relaxed">{c.text}</p>
                   </div>
                </div>
              ))}
          </div>
      </section>
    </div>
  );
};
