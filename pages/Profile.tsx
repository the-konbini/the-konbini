
import React, { useState, useRef, useMemo } from 'react';
import { User, ContentItem, UserRole } from '../types';
import { 
  Camera, Save, Type, FileText, Check, 
  ArrowLeft, BookOpen, Eye, Heart, Sparkles, Trash2, Edit3,
  ExternalLink, ShieldCheck, User as UserIcon, RefreshCw, EyeOff, Bookmark, History, LogOut, LogIn, ChevronRight
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';

interface Props {
  user: User;
  onUpdateUser: (updatedUser: User) => void;
  items: ContentItem[];
  onDelete: (id: string) => void;
  onLogout: () => void;
  onLogin: () => void;
}

export const Profile: React.FC<Props> = ({ user, onUpdateUser, items, onDelete, onLogout, onLogin }) => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [name, setName] = useState(user.name);
  const [bio, setBio] = useState(user.bio || '');
  const [avatar, setAvatar] = useState(user.avatar);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [activeSection, setActiveSection] = useState<'works' | 'favorites' | 'history'>('works');

  const isAdmin = user.role === UserRole.ADMIN;

  const myItems = useMemo(() => {
    return items.filter(item => item.author === user.name || (user.role === UserRole.ADMIN && item.author.includes('Tôi')));
  }, [items, user.name, user.role]);

  const favoritesItems = useMemo(() => {
    return items.filter(item => user.favorites?.includes(item.id));
  }, [items, user.favorites]);

  const historyItems = useMemo(() => {
    if (!user.readingHistory) return [];
    return user.readingHistory
      .map(h => {
        const item = items.find(i => i.id === h.contentId);
        return item ? { ...item, progress: h } : null;
      })
      .filter(Boolean) as (ContentItem & { progress: any })[];
  }, [items, user.readingHistory]);

  const stats = useMemo(() => {
    return {
      worksCount: myItems.length,
      favoritesCount: favoritesItems.length,
      historyCount: historyItems.length
    };
  }, [myItems, favoritesItems, historyItems]);

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      onUpdateUser({ ...user, name, bio, avatar });
      setIsSaving(false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }, 1000);
  };

  if (user.isAnonymous) {
    return (
      <div className="max-w-xl mx-auto py-20 text-center animate-in fade-in zoom-in-95">
          <div className="w-24 h-24 bg-brand-50 dark:bg-brand-900/40 rounded-full flex items-center justify-center mx-auto mb-8 text-stone-300">
            <UserIcon size={48} />
          </div>
          <h2 className="text-3xl font-black uppercase tracking-tight mb-4">Chào bạn, Khách ẩn danh!</h2>
          <p className="text-stone-500 mb-10 font-medium">Đăng nhập để lưu những bộ truyện yêu thích, đồng bộ tiến độ đọc và quản lý các tác phẩm của riêng bạn.</p>
          <button 
            onClick={onLogin}
            className="w-full py-5 bg-brand-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 shadow-2xl shadow-brand-600/30 hover:scale-105 transition-all"
          >
            <LogIn size={20} /> Đăng nhập bằng Google
          </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto pb-20 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <h2 className="text-4xl font-black text-stone-900 dark:text-white uppercase tracking-tighter flex items-center gap-3">
           Hồ sơ của tôi {isAdmin && <ShieldCheck className="text-brand-600" />}
        </h2>
        <button onClick={onLogout} className="flex items-center gap-2 px-5 py-3 bg-rose-50 dark:bg-rose-900/20 text-rose-600 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-rose-100 dark:border-rose-800 transition-all hover:bg-rose-100">
          <LogOut size={16} /> Đăng xuất
        </button>
      </div>

      <div className="grid lg:grid-cols-12 gap-10">
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white dark:bg-brand-900/20 border border-brand-100 dark:border-brand-800 rounded-[3rem] p-8 shadow-2xl">
             <div className="flex flex-col items-center mb-8 relative">
                <div className="w-32 h-32 rounded-[3rem] overflow-hidden border-4 border-white dark:border-brand-800 shadow-2xl bg-brand-50">
                    <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
                </div>
                <h3 className="mt-4 font-black text-lg">{user.name}</h3>
                <p className="text-[10px] font-black text-brand-600 uppercase tracking-widest">{isAdmin ? 'CHỦ TRẠM' : 'ĐỘC GIẢ'}</p>
             </div>
             
             <div className="space-y-4">
                <button 
                  onClick={() => setActiveSection('works')}
                  className={`w-full flex items-center gap-3 px-6 py-4 rounded-2xl font-bold text-sm transition-all ${activeSection === 'works' ? 'bg-brand-600 text-white shadow-lg' : 'text-stone-500 hover:bg-brand-50'}`}
                >
                  <Sparkles size={18} /> {isAdmin ? 'Tác phẩm của tôi' : 'Hoạt động'}
                </button>
                <button 
                  onClick={() => setActiveSection('favorites')}
                  className={`w-full flex items-center gap-3 px-6 py-4 rounded-2xl font-bold text-sm transition-all ${activeSection === 'favorites' ? 'bg-brand-600 text-white shadow-lg' : 'text-stone-500 hover:bg-brand-50'}`}
                >
                  <Bookmark size={18} /> Bộ sưu tập ({stats.favoritesCount})
                </button>
                <button 
                  onClick={() => setActiveSection('history')}
                  className={`w-full flex items-center gap-3 px-6 py-4 rounded-2xl font-bold text-sm transition-all ${activeSection === 'history' ? 'bg-brand-600 text-white shadow-lg' : 'text-stone-500 hover:bg-brand-50'}`}
                >
                  <History size={18} /> Đang đọc ({stats.historyCount})
                </button>
             </div>
          </div>
        </div>

        <div className="lg:col-span-8 space-y-8">
            {activeSection === 'works' && (
              <div className="bg-white dark:bg-brand-900/20 border border-brand-100 dark:border-brand-800 rounded-[3.5rem] p-10 shadow-2xl">
                <h3 className="text-xl font-black uppercase tracking-tighter mb-8 flex items-center gap-3"><Sparkles className="text-brand-600" /> Tác phẩm sáng tạo</h3>
                {myItems.length === 0 ? (
                  <div className="text-center py-20 opacity-30">
                    <BookOpen size={48} className="mx-auto mb-4" />
                    <p className="text-xs font-black uppercase tracking-widest">Bạn chưa đăng tác phẩm nào</p>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {myItems.map(item => (
                      <Link key={item.id} to={`/intro/${item.id}`} className="flex items-center gap-4 p-4 bg-brand-50/40 rounded-2xl border border-brand-100 hover:border-brand-500 transition-all">
                        <img src={item.coverUrl} className="w-16 h-20 object-cover rounded-xl shadow-md" alt="" />
                        <div className="flex-1">
                          <h4 className="font-bold text-stone-900 dark:text-white uppercase text-sm tracking-tight">{item.title}</h4>
                          <p className="text-[10px] text-stone-400 font-bold uppercase tracking-widest mt-1">{item.type} • {item.views} lượt xem</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeSection === 'favorites' && (
              <div className="bg-white dark:bg-brand-900/20 border border-brand-100 dark:border-brand-800 rounded-[3.5rem] p-10 shadow-2xl">
                <h3 className="text-xl font-black uppercase tracking-tighter mb-8 flex items-center gap-3"><Bookmark className="text-brand-600" /> Bộ sưu tập yêu thích</h3>
                {favoritesItems.length === 0 ? (
                  <div className="text-center py-20 opacity-30">
                    <Bookmark size={48} className="mx-auto mb-4" />
                    <p className="text-xs font-black uppercase tracking-widest">Bộ sưu tập hiện đang trống</p>
                  </div>
                ) : (
                  <div className="grid sm:grid-cols-2 gap-4">
                    {favoritesItems.map(item => (
                      <Link key={item.id} to={`/intro/${item.id}`} className="flex items-center gap-4 p-4 bg-brand-50/40 rounded-2xl border border-brand-100 hover:border-brand-500 transition-all">
                        <img src={item.coverUrl} className="w-16 h-20 object-cover rounded-xl shadow-md" alt="" />
                        <div className="flex-1">
                          <h4 className="font-bold text-stone-900 dark:text-white uppercase text-sm tracking-tight truncate">{item.title}</h4>
                          <p className="text-[10px] text-stone-400 font-bold uppercase tracking-widest mt-1">{item.type}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeSection === 'history' && (
              <div className="bg-white dark:bg-brand-900/20 border border-brand-100 dark:border-brand-800 rounded-[3.5rem] p-10 shadow-2xl">
                <h3 className="text-xl font-black uppercase tracking-tighter mb-8 flex items-center gap-3"><History className="text-brand-600" /> Tiếp tục đọc</h3>
                {historyItems.length === 0 ? (
                  <div className="text-center py-20 opacity-30">
                    <History size={48} className="mx-auto mb-4" />
                    <p className="text-xs font-black uppercase tracking-widest">Bạn chưa đọc bộ nào</p>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {historyItems.map(item => (
                      <Link key={item.id} to={`/read/${item.id}/${item.progress.chapterIndex}`} className="flex items-center gap-5 p-5 bg-brand-50/40 rounded-2xl border border-brand-100 hover:border-brand-500 transition-all">
                        <img src={item.coverUrl} className="w-20 h-24 object-cover rounded-xl shadow-md" alt="" />
                        <div className="flex-1">
                          <h4 className="font-bold text-stone-900 dark:text-white uppercase text-base tracking-tight">{item.title}</h4>
                          <div className="flex items-center gap-2 mt-2">
                             <span className="px-2 py-0.5 bg-brand-600 text-white rounded text-[10px] font-black uppercase tracking-widest">Chương {item.progress.chapterIndex + 1}</span>
                             <span className="text-[10px] text-stone-400 font-bold uppercase tracking-widest">{new Date(item.progress.updatedAt).toLocaleDateString('vi-VN')}</span>
                          </div>
                        </div>
                        {/* Fix: ChevronRight was missing from imports */}
                        <div className="text-brand-600"><ChevronRight size={24} /></div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}
        </div>
      </div>
    </div>
  );
};
