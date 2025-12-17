
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { BookOpen, PenTool, Home, Search, Sun, Moon, Settings, Shield, LogIn } from 'lucide-react';
import { UserRole } from '../types';

interface ThemeProps {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  userAvatar?: string;
  userRole?: UserRole;
  logoUrl?: string;
  isAnonymous: boolean;
  onLoginRequest?: () => void;
}

export const Navbar: React.FC<ThemeProps> = ({ theme, toggleTheme, userAvatar, userRole, logoUrl, isAnonymous, onLoginRequest }) => {
  const location = useLocation();
  const isAdmin = userRole === UserRole.ADMIN;

  const isActive = (path: string) => {
    return location.pathname === path 
      ? "text-brand-600 dark:text-brand-400 bg-brand-500/10 dark:bg-brand-500/5 shadow-inner" 
      : "text-stone-400 dark:text-stone-700 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-950/40";
  };

  return (
    <nav className="fixed top-0 left-0 h-full w-20 bg-white dark:bg-[#120d08] border-r border-brand-100 dark:border-brand-900/30 flex flex-col items-center py-6 z-50 hidden md:flex transition-all duration-300">
      <Link to="/" className="mb-10 p-1.5 rounded-2xl hover:rotate-6 transition-transform active:scale-95">
        {logoUrl ? (
          <img src={logoUrl} className="w-12 h-12 object-contain" alt="Logo" />
        ) : (
          <div className="p-3 bg-brand-600 dark:bg-brand-900 text-white rounded-2xl shadow-xl shadow-brand-900/20">
            <BookOpen size={28} />
          </div>
        )}
      </Link>
      
      <div className="flex flex-col gap-5 w-full px-2.5">
        <Link to="/" className={`flex flex-col items-center justify-center p-3.5 rounded-2xl transition-all ${isActive('/')}`}>
          <Home size={22} />
          <span className="text-[9px] mt-1.5 font-black uppercase tracking-tighter">Home</span>
        </Link>
        
        <Link to="/search" className={`flex flex-col items-center justify-center p-3.5 rounded-2xl transition-all ${isActive('/search')}`}>
          <Search size={22} />
          <span className="text-[9px] mt-1.5 font-black uppercase tracking-tighter">Tìm</span>
        </Link>
        
        {isAdmin && (
          <>
            <Link to="/studio" className={`flex flex-col items-center justify-center p-3.5 rounded-2xl transition-all ${isActive('/studio')}`}>
              <PenTool size={22} />
              <span className="text-[9px] mt-1.5 font-black uppercase tracking-tighter">Đăng</span>
            </Link>

            <Link to="/admin" className={`flex flex-col items-center justify-center p-3.5 rounded-2xl transition-all ${isActive('/admin')}`}>
              <Settings size={22} />
              <span className="text-[9px] mt-1.5 font-black uppercase tracking-tighter">Trạm</span>
            </Link>
          </>
        )}
      </div>

      <div className="mt-auto flex flex-col items-center gap-5">
        <button 
          onClick={toggleTheme}
          className="p-3.5 rounded-2xl bg-brand-50 dark:bg-brand-950/20 text-stone-400 dark:text-brand-800 hover:text-brand-600 dark:hover:text-brand-400 transition-all active:scale-90 border border-transparent hover:border-brand-100 dark:hover:border-brand-900"
        >
          {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        {isAnonymous ? (
           <button 
             onClick={onLoginRequest}
             className="w-12 h-12 rounded-2xl bg-brand-600 text-white flex items-center justify-center shadow-lg hover:bg-brand-500 transition-all active:scale-90"
             title="Đăng nhập Google"
           >
             <LogIn size={20} />
           </button>
        ) : (
          <Link to="/profile" className="w-12 h-12 rounded-2xl bg-brand-50 dark:bg-brand-950/20 p-1 border-2 border-transparent hover:border-brand-500 transition-all overflow-hidden group shadow-sm relative">
            <img 
              src={userAvatar || `https://api.dicebear.com/7.x/identicon/svg?seed=konbini`} 
              className="w-full h-full object-cover rounded-xl transition-transform group-hover:scale-110" 
              alt="Me" 
            />
            {isAdmin && (
              <div className="absolute top-0 right-0 p-0.5 bg-brand-600 rounded-bl-lg text-white">
                  <Shield size={8} />
              </div>
            )}
          </Link>
        )}
      </div>
    </nav>
  );
};

export const MobileNavbar: React.FC<ThemeProps> = ({ theme, toggleTheme, userAvatar, userRole, isAnonymous, onLoginRequest }) => {
    const location = useLocation();
    const isAdmin = userRole === UserRole.ADMIN;
    
    const isActive = (path: string) => location.pathname === path 
      ? "text-brand-600 dark:text-brand-400" 
      : "text-stone-400 dark:text-stone-800";

    return (
        <nav className="fixed bottom-0 left-0 w-full bg-white/95 dark:bg-[#120d08]/95 backdrop-blur-xl border-t border-brand-100 dark:border-brand-900/20 flex justify-around items-center p-3 z-50 md:hidden transition-colors duration-300 pb-safe shadow-[0_-10px_30px_rgba(0,0,0,0.1)]">
             <Link to="/" className={`flex flex-col items-center transition-all active:scale-90 ${isActive('/')}`}>
                <Home size={20} />
                <span className="text-[9px] mt-1 font-black uppercase tracking-tighter">Home</span>
            </Link>
            <Link to="/search" className={`flex flex-col items-center transition-all active:scale-90 ${isActive('/search')}`}>
                <Search size={20} />
                <span className="text-[9px] mt-1 font-black uppercase tracking-tighter">Tìm</span>
            </Link>
            
            {isAdmin ? (
                <Link to="/studio" className={`flex flex-col items-center transition-all active:scale-95`}>
                    <div className={`p-3 rounded-2xl transition-all ${location.pathname === '/studio' ? 'bg-brand-600 dark:bg-brand-900 text-white shadow-lg' : 'bg-brand-50 dark:bg-brand-950/40 text-stone-400 dark:text-stone-800'}`}>
                    <PenTool size={22} />
                    </div>
                </Link>
            ) : (
                <div className="flex flex-col items-center justify-center p-3 bg-brand-600 rounded-2xl text-white shadow-lg" onClick={isAnonymous ? onLoginRequest : undefined}>
                    {isAnonymous ? <LogIn size={20} /> : <BookOpen size={20} />}
                </div>
            )}

            {isAdmin && (
              <Link to="/admin" className={`flex flex-col items-center transition-all active:scale-90 ${isActive('/admin')}`}>
                <Settings size={20} />
                <span className="text-[9px] mt-1 font-black uppercase tracking-tighter">Trạm</span>
              </Link>
            )}
            
             <Link to="/profile" className={`flex flex-col items-center transition-all active:scale-90 ${isActive('/profile')}`}>
                <div className={`w-7 h-7 rounded-xl overflow-hidden border-2 transition-all ${location.pathname === '/profile' ? 'border-brand-500' : 'border-brand-100 dark:border-brand-900'}`}>
                  {isAnonymous ? (
                    <div className="w-full h-full bg-stone-200 flex items-center justify-center text-stone-500">
                      <Shield size={14} />
                    </div>
                  ) : (
                    <img src={userAvatar} className="w-full h-full object-cover" alt="Me" />
                  )}
                </div>
                <span className="text-[9px] mt-1 font-black uppercase tracking-tighter">Hồ sơ</span>
            </Link>
        </nav>
    )
}
