
import React, { useState } from 'react';
import { X, UserPlus, UserCheck, MessageCircle, Twitter, Globe, Book, Eye, Award, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface AuthorModalProps {
  authorName: string;
  isOpen: boolean;
  onClose: () => void;
}

export const AuthorModal: React.FC<AuthorModalProps> = ({ authorName, isOpen, onClose }) => {
  const [isFollowing, setIsFollowing] = useState(false);
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleGoToProfile = () => {
    navigate(`/author/${encodeURIComponent(authorName)}`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-stone-900/60 backdrop-blur-md animate-in fade-in duration-300"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative w-full max-w-md bg-white dark:bg-surface-dark border border-brand-100 dark:border-brand-800 rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 fade-in duration-300">
        {/* Header Decor */}
        <div className="h-32 bg-gradient-to-br from-brand-600 to-brand-800 relative">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/40 text-white rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Profile Content */}
        <div className="px-8 pb-8 -mt-16 text-center">
          <div className="relative inline-block">
            <img 
              src={`https://api.dicebear.com/7.x/identicon/svg?seed=${authorName}&backgroundColor=b6e3f4,c0aede,d1d4f9`} 
              className="w-32 h-32 rounded-3xl border-4 border-white dark:border-surface-dark shadow-xl object-cover bg-white"
              alt={authorName}
            />
            <div className="absolute -bottom-2 -right-2 bg-amber-500 text-white p-2 rounded-xl shadow-lg border-2 border-white dark:border-surface-dark">
              <Award size={16} />
            </div>
          </div>

          <h2 className="mt-4 text-2xl font-black text-stone-900 dark:text-white">{authorName}</h2>
          <p className="text-xs font-bold text-brand-600 uppercase tracking-widest mb-4">Nhà sáng tạo nội dung</p>
          
          <p className="text-sm text-stone-500 dark:text-stone-400 leading-relaxed mb-6">
            Đam mê sáng tạo những câu chuyện mang đậm hơi thở cuộc sống. Một thành viên nhiệt huyết của đại gia đình The Konbini.
          </p>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-brand-50 dark:bg-brand-900/30 p-4 rounded-2xl border border-brand-100 dark:border-brand-800">
              <div className="flex justify-center text-brand-600 dark:text-brand-400 mb-1">
                <Book size={18} />
              </div>
              <p className="text-lg font-black text-stone-900 dark:text-white">Truyện</p>
              <p className="text-[10px] font-bold text-stone-400 uppercase">Sáng tác</p>
            </div>
            <div className="bg-brand-50 dark:bg-brand-900/30 p-4 rounded-2xl border border-brand-100 dark:border-brand-800">
              <div className="flex justify-center text-brand-600 dark:text-brand-400 mb-1">
                <Eye size={18} />
              </div>
              <p className="text-lg font-black text-stone-900 dark:text-white">Hot</p>
              <p className="text-[10px] font-bold text-stone-400 uppercase">Xu hướng</p>
            </div>
          </div>

          {/* Main Actions */}
          <div className="flex gap-3 mb-4">
            <button 
              onClick={() => setIsFollowing(!isFollowing)}
              className={`flex-1 py-3 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all active:scale-95 ${
                isFollowing 
                ? 'bg-stone-100 dark:bg-brand-800 text-stone-600 dark:text-stone-300' 
                : 'bg-brand-600 text-white shadow-lg shadow-brand-600/20 hover:bg-brand-500'
              }`}
            >
              {isFollowing ? (
                <><UserCheck size={18} /> Đang theo dõi</>
              ) : (
                <><UserPlus size={18} /> Theo dõi</>
              )}
            </button>
            <button className="p-3 bg-brand-50 dark:bg-brand-900/40 text-brand-600 dark:text-brand-400 rounded-2xl border border-brand-100 dark:border-brand-800 hover:bg-brand-100 dark:hover:bg-brand-800 transition-colors">
              <MessageCircle size={20} />
            </button>
          </div>

          {/* THE NEW BUTTON: VIEW ALL WORKS */}
          <button 
            onClick={handleGoToProfile}
            className="w-full py-4 bg-stone-900 dark:bg-brand-800/80 text-white rounded-[1.5rem] font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 hover:bg-stone-800 transition-all active:scale-95 shadow-xl"
          >
            Xem tất cả tác phẩm <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};
