
import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Navbar, MobileNavbar } from './components/Navbar';
import { Home } from './pages/Home';
import { Detail } from './pages/Detail';
import { Intro } from './pages/Intro';
import { Studio } from './pages/Studio';
import { Search } from './pages/Search';
import { Profile } from './pages/Profile';
import { AuthorProfile } from './pages/AuthorProfile';
import { AdminSettings } from './pages/AdminSettings';
import { ContentItem, User, SiteSettings, UserRole } from './types';
import { DatabaseService } from './services/database';
import { Cloud, Loader2, Sun, Moon, BookOpen, Shield, User as UserIcon, LogIn, AlertCircle, Info, WifiOff } from 'lucide-react';
import { GUEST_USER, INITIAL_SITE_SETTINGS } from './constants';

const App: React.FC = () => {
  const [items, setItems] = useState<ContentItem[]>([]);
  const [isSyncing, setIsSyncing] = useState(true);
  const [siteSettings, setSiteSettings] = useState<SiteSettings>(INITIAL_SITE_SETTINGS);
  const [showDeployGuide, setShowDeployGuide] = useState(false);
  const [apiError, setApiError] = useState(false);
  
  const [currentUser, setCurrentUser] = useState<User>(() => {
    const savedUser = localStorage.getItem('konbini_user_profile');
    return savedUser ? JSON.parse(savedUser) : GUEST_USER;
  });

  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('konbini_theme');
    return (saved as 'light' | 'dark') || 'dark';
  });

  // Kiểm tra API Key khi khởi chạy (Chỉ dành cho Admin biết)
  useEffect(() => {
    if (!process.env.API_KEY && currentUser.role === UserRole.ADMIN) {
      setApiError(true);
    }
  }, [currentUser.role]);

  // BẢO VỆ NỘI DUNG TỐI ĐA
  useEffect(() => {
    const preventAction = (e: Event) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) return;
      e.preventDefault();
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) return;

      if (
        (e.ctrlKey && (['c', 'u', 's', 'p', 'a'].includes(e.key.toLowerCase()))) ||
        e.key === 'F12' ||
        (e.ctrlKey && e.shiftKey && e.key === 'I')
      ) {
        e.preventDefault();
        return false;
      }
    };

    document.addEventListener('contextmenu', preventAction);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('contextmenu', preventAction);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const isAdmin = currentUser.role === UserRole.ADMIN;

  const syncData = async () => {
    setIsSyncing(true);
    try {
      const data = await DatabaseService.getAllItems();
      const settings = await DatabaseService.getSiteSettings();
      setItems(data);
      setSiteSettings(settings);
    } catch (e) {
      console.error("Lỗi tải dữ liệu", e);
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    syncData();
  }, []);

  useEffect(() => {
    document.title = siteSettings.siteName;
  }, [siteSettings]);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('konbini_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const handleUpdateUser = (updatedUser: User) => {
    setCurrentUser(updatedUser);
    localStorage.setItem('konbini_user_profile', JSON.stringify(updatedUser));
  };

  const handleGoogleLogin = () => {
    const email = window.prompt("Nhập Email Google của bạn để đăng nhập:", "couleuryou@gmail.com");
    if (email === null) return;

    setIsSyncing(true);
    setTimeout(() => {
      const isOwnerMail = email.trim().toLowerCase() === 'couleuryou@gmail.com';
      const loggedInUser: User = {
        id: 'google_' + Math.random().toString(36).substr(2, 9),
        name: isOwnerMail ? 'Chủ Trạm (couleuryou)' : 'Độc giả Konbini',
        avatar: isOwnerMail 
          ? 'https://api.dicebear.com/7.x/bottts/svg?seed=Admin' 
          : `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
        email: email,
        role: isOwnerMail ? UserRole.ADMIN : UserRole.READER,
        isAnonymous: false,
        favorites: currentUser.favorites || [],
        readingHistory: currentUser.readingHistory || []
      };
      handleUpdateUser(loggedInUser);
      setIsSyncing(false);
      if (isOwnerMail) alert("Chào mừng Chủ trạm đã quay trở lại!");
    }, 600);
  };

  const handleLogout = () => {
    if (window.confirm("Bạn muốn đăng xuất khỏi Trạm?")) {
      handleUpdateUser(GUEST_USER);
    }
  };

  const handlePublish = async (newItem: ContentItem) => {
    if (!isAdmin) return;
    setIsSyncing(true);
    const success = await DatabaseService.saveItem(newItem);
    if (success) await syncData();
    setIsSyncing(false);
  };

  const handleDelete = async (id: string) => {
    if (!isAdmin) return;
    if (window.confirm("Xóa tác phẩm này?")) {
      setIsSyncing(true);
      const success = await DatabaseService.deleteItem(id);
      if (success) setItems(prev => prev.filter(item => item.id !== id));
      setIsSyncing(false);
    }
  };

  return (
    <Router>
      <div className="min-h-screen bg-surface-light dark:bg-surface-dark text-stone-900 dark:text-brand-100 flex flex-col md:flex-row transition-colors duration-300 selection:bg-transparent">
        <Navbar 
          theme={theme} 
          toggleTheme={toggleTheme} 
          userAvatar={currentUser.avatar} 
          userRole={currentUser.role}
          logoUrl={siteSettings.logoUrl}
          isAnonymous={currentUser.isAnonymous}
          onLoginRequest={handleGoogleLogin}
        />

        <main className="flex-1 md:ml-20 min-h-screen flex flex-col">
          <header className="sticky top-0 z-40 bg-white/90 dark:bg-surface-dark/95 backdrop-blur-md border-b border-brand-100 dark:border-brand-900/50 px-6 py-4 flex items-center justify-between">
             <div className="flex items-center gap-4">
                <div className="flex items-center gap-3">
                    {siteSettings.logoUrl ? (
                      <img src={siteSettings.logoUrl} className="h-10 w-auto object-contain" alt="Logo" />
                    ) : (
                      <div className="w-10 h-10 bg-brand-600 rounded-xl flex items-center justify-center text-white shadow-lg">
                        <BookOpen size={22} />
                      </div>
                    )}
                    <div className="font-black text-2xl tracking-tighter text-stone-900 dark:text-white uppercase">
                        {siteSettings.siteName}<span className="text-brand-600">.</span>
                    </div>
                </div>
                
                {isAdmin && (
                  <button 
                    onClick={() => setShowDeployGuide(!showDeployGuide)}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500 text-white text-[9px] font-black uppercase tracking-wider animate-pulse"
                  >
                    <Info size={12} /> Hướng dẫn Online
                  </button>
                )}
             </div>
             
             <div className="flex items-center gap-3">
                <button 
                  onClick={toggleTheme}
                  className="p-2.5 rounded-xl bg-brand-50 dark:bg-brand-900/50 text-brand-700 dark:text-brand-400 border border-brand-100 dark:border-brand-800"
                >
                  {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                </button>
                <div className="w-10 h-10 rounded-xl bg-white dark:bg-brand-900 border-2 border-brand-500/30 overflow-hidden shadow-lg">
                    <img src={currentUser.avatar} alt="Avatar" className="w-full h-full object-cover" />
                </div>
             </div>
          </header>

          {/* Cảnh báo thiếu API Key trên Vercel */}
          {apiError && isAdmin && (
            <div className="mx-8 mt-4 p-4 bg-red-500/10 border border-red-500/50 rounded-2xl flex items-center gap-3 text-red-600 dark:text-red-400 animate-bounce">
              <WifiOff size={20} />
              <p className="text-[10px] font-black uppercase tracking-widest">Lỗi: Chưa cấu hình API_KEY trên Vercel. AI sẽ không hoạt động!</p>
            </div>
          )}

          {/* Deploy Guide Popup for Admin */}
          {isAdmin && showDeployGuide && (
            <div className="m-8 p-6 bg-brand-900 text-white rounded-[2rem] shadow-2xl border-4 border-amber-500 animate-in slide-in-from-top-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-black uppercase flex items-center gap-2"><AlertCircle /> Ghi chú cho Chủ Trạm</h3>
                <button onClick={() => setShowDeployGuide(false)} className="text-amber-500 font-bold">Đóng</button>
              </div>
              <ul className="text-xs space-y-2 opacity-90 font-medium">
                <li>• <b>Hosting:</b> Kết nối GitHub với <a href="https://vercel.com" target="_blank" className="underline text-amber-500">Vercel.com</a> để đưa web lên mạng miễn phí.</li>
                <li>• <b>Biến môi trường:</b> Trên Vercel, vào Project Settings -> Environment Variables, thêm <code>API_KEY</code> với giá trị từ Google AI Studio.</li>
                <li>• <b>Database:</b> Dữ liệu đang lưu ở LocalStorage (tạm thời).</li>
                <li>• <b>Bảo mật:</b> Đã chặn chuột phải và phím tắt sao chép nội dung.</li>
              </ul>
            </div>
          )}

          <div className="p-4 md:p-8 max-w-7xl mx-auto w-full flex-1">
            {isSyncing && items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-[60vh]">
                    <Loader2 size={40} className="animate-spin text-brand-600 mb-4" />
                    <p className="text-stone-400 font-black uppercase tracking-widest text-xs">Đang nạp năng lượng trạm...</p>
                </div>
            ) : (
                <div className="page-transition">
                  <Routes>
                      <Route path="/" element={<Home items={items} onDelete={isAdmin ? handleDelete : undefined} />} />
                      <Route path="/search" element={<Search items={items} onDelete={isAdmin ? handleDelete : undefined} />} />
                      <Route path="/intro/:id" element={<Intro items={items} currentUser={currentUser} onUpdateUser={handleUpdateUser} onLoginRequest={handleGoogleLogin} />} />
                      <Route path="/read/:id/:chapterIndex" element={<Detail items={items} onDelete={isAdmin ? handleDelete : undefined} currentUser={currentUser} onUpdateUser={handleUpdateUser} />} />
                      <Route path="/studio" element={isAdmin ? <Studio onPublish={handlePublish} /> : <Navigate to="/" />} />
                      <Route path="/studio/:editId" element={isAdmin ? <Studio onPublish={handlePublish} /> : <Navigate to="/" />} />
                      <Route path="/profile" element={<Profile user={currentUser} onUpdateUser={handleUpdateUser} items={items} onDelete={handleDelete} onLogout={handleLogout} onLogin={handleGoogleLogin} />} />
                      <Route path="/author/:authorName" element={<AuthorProfile items={items} onDelete={isAdmin ? handleDelete : undefined} />} />
                      <Route path="/admin" element={isAdmin ? <AdminSettings onSettingsUpdate={setSiteSettings} /> : <Navigate to="/" />} />
                  </Routes>
                </div>
            )}
          </div>
        </main>
        
        <MobileNavbar 
          theme={theme} 
          toggleTheme={toggleTheme} 
          userAvatar={currentUser.avatar} 
          userRole={currentUser.role} 
          isAnonymous={currentUser.isAnonymous}
          onLoginRequest={handleGoogleLogin}
        />
      </div>
    </Router>
  );
};

export default App;
