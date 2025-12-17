
import React, { useState, useEffect, useRef } from 'react';
import { DatabaseService } from '../services/database';
import { SiteSettings, User, UserRole } from '../types';
import { 
  Settings, Layout, Users, Save, Shield, ShieldCheck, 
  Image as ImageIcon, Upload, Check, RefreshCw, X 
} from 'lucide-react';

interface Props {
  onSettingsUpdate: (settings: SiteSettings) => void;
}

export const AdminSettings: React.FC<Props> = ({ onSettingsUpdate }) => {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [activeTab, setActiveTab] = useState<'site' | 'users'>('site');
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const loadData = async () => {
      const s = await DatabaseService.getSiteSettings();
      const u = await DatabaseService.getAllUsers();
      setSettings(s);
      setUsers(u);
    };
    loadData();
  }, []);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && settings) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSettings({ ...settings, logoUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const saveSettings = async () => {
    if (!settings) return;
    setIsSaving(true);
    await DatabaseService.updateSiteSettings(settings);
    onSettingsUpdate(settings);
    setIsSaving(false);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const toggleUserRole = async (user: User) => {
    const newRole = user.role === UserRole.ADMIN ? UserRole.CREATOR : UserRole.ADMIN;
    await DatabaseService.updateUserRole(user.id, newRole);
    setUsers(prev => prev.map(u => u.id === user.id ? { ...u, role: newRole } : u));
  };

  if (!settings) return null;

  return (
    <div className="max-w-4xl mx-auto pb-20 animate-in fade-in duration-500">
      <div className="flex items-center gap-4 mb-10">
        <div className="p-3 bg-brand-600 text-white rounded-2xl shadow-xl shadow-brand-600/20">
          <Settings size={28} />
        </div>
        <div>
          <h2 className="text-3xl font-black text-stone-900 dark:text-white uppercase tracking-tight">Trạm Quản Trị</h2>
          <p className="text-xs font-bold text-stone-400 dark:text-brand-600 uppercase tracking-widest">Thiết lập hệ thống & quyền hạn</p>
        </div>
      </div>

      <div className="flex gap-2 p-1 bg-white dark:bg-brand-900/40 rounded-2xl mb-8 border border-brand-100 dark:border-brand-800 w-fit shadow-sm">
        <button 
          onClick={() => setActiveTab('site')}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'site' ? 'bg-brand-600 text-white shadow-lg' : 'text-stone-500 hover:bg-brand-50'}`}
        >
          <Layout size={18} /> Thương hiệu
        </button>
        <button 
          onClick={() => setActiveTab('users')}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'users' ? 'bg-brand-600 text-white shadow-lg' : 'text-stone-500 hover:bg-brand-50'}`}
        >
          <Users size={18} /> Nhân sự
        </button>
      </div>

      {activeTab === 'site' ? (
        <div className="space-y-6">
          <div className="bg-white dark:bg-brand-900/20 border border-brand-100 dark:border-brand-800 rounded-[2.5rem] p-8 shadow-xl">
            <h3 className="text-sm font-black text-brand-600 dark:text-brand-400 uppercase tracking-widest mb-8 flex items-center gap-2">
              <RefreshCw size={16} /> Nhận diện trang web
            </h3>
            
            <div className="grid md:grid-cols-2 gap-10">
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-stone-400 tracking-widest">Tên trang web</label>
                  <input 
                    type="text"
                    value={settings.siteName}
                    onChange={e => setSettings({...settings, siteName: e.target.value})}
                    className="w-full bg-brand-50/50 dark:bg-brand-950/50 border border-brand-100 dark:border-brand-800 rounded-2xl px-5 py-4 text-stone-900 dark:text-white font-bold focus:ring-4 focus:ring-brand-500/10 outline-none transition-all"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase text-stone-400 tracking-widest">Logo trang web</label>
                <div 
                  onClick={() => logoInputRef.current?.click()}
                  className="aspect-video rounded-3xl border-2 border-dashed border-brand-200 dark:border-brand-800 bg-brand-50/30 dark:bg-brand-950/30 flex flex-col items-center justify-center cursor-pointer hover:border-brand-500 transition-all overflow-hidden relative group"
                >
                  {settings.logoUrl ? (
                    <img src={settings.logoUrl} className="w-full h-full object-contain p-4" alt="Logo preview" />
                  ) : (
                    <>
                      <ImageIcon size={32} className="text-brand-300 mb-2" />
                      <span className="text-xs font-bold text-stone-400">Tải lên Logo mới</span>
                    </>
                  )}
                  <div className="absolute inset-0 bg-brand-900/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity font-bold text-xs uppercase tracking-widest">
                    Thay đổi logo
                  </div>
                  <input type="file" ref={logoInputRef} onChange={handleLogoUpload} className="hidden" accept="image/*" />
                </div>
                {settings.logoUrl && (
                  <button 
                    onClick={() => setSettings({...settings, logoUrl: ''})}
                    className="text-[10px] font-bold text-rose-500 hover:underline"
                  >
                    Xóa Logo, dùng mặc định
                  </button>
                )}
              </div>
            </div>

            <button 
              onClick={saveSettings}
              disabled={isSaving}
              className={`mt-10 w-full py-5 rounded-2xl font-black uppercase tracking-widest text-sm transition-all flex items-center justify-center gap-3 shadow-xl ${
                showSuccess ? 'bg-emerald-500 text-white' : 'bg-brand-600 hover:bg-brand-500 text-white shadow-brand-600/20'
              }`}
            >
              {isSaving ? <RefreshCw size={20} className="animate-spin" /> : showSuccess ? <><Check size={20} /> Đã lưu cài đặt</> : <><Save size={20} /> Lưu thay đổi thương hiệu</>}
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-brand-900/20 border border-brand-100 dark:border-brand-800 rounded-[2.5rem] overflow-hidden shadow-xl">
          <div className="p-8 border-b border-brand-100 dark:border-brand-800 bg-brand-50/30 dark:bg-brand-950/30">
             <h3 className="text-sm font-black text-brand-600 dark:text-brand-400 uppercase tracking-widest flex items-center gap-2">
                <Shield size={18} /> Phân quyền hệ thống
             </h3>
             <p className="text-xs text-stone-400 mt-1 font-bold">Chỉ Admin mới có quyền truy cập trang cài đặt và chỉnh sửa nội dung toàn trang.</p>
          </div>
          
          <div className="divide-y divide-brand-50 dark:divide-brand-900/50">
            {users.map(user => (
              <div key={user.id} className="p-6 flex items-center justify-between hover:bg-brand-50/20 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl overflow-hidden border-2 border-brand-100 dark:border-brand-800 bg-white">
                    <img src={user.avatar} className="w-full h-full object-cover" alt="" />
                  </div>
                  <div>
                    <p className="font-bold text-stone-900 dark:text-white">{user.name}</p>
                    <p className="text-[10px] text-stone-400 font-bold uppercase tracking-widest">{user.bio || 'Một thành viên tích cực'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                    user.role === UserRole.ADMIN 
                    ? 'bg-amber-500/10 border-amber-500/20 text-amber-600' 
                    : 'bg-stone-100 border-stone-200 text-stone-500 dark:bg-brand-900 dark:border-brand-800 dark:text-brand-500'
                  }`}>
                    {user.role}
                  </div>
                  
                  <button 
                    onClick={() => toggleUserRole(user)}
                    className={`p-2.5 rounded-xl transition-all active:scale-90 ${
                      user.role === UserRole.ADMIN 
                      ? 'text-rose-500 hover:bg-rose-50' 
                      : 'text-brand-600 hover:bg-brand-50 dark:text-brand-400 dark:hover:bg-brand-900'
                    }`}
                    title={user.role === UserRole.ADMIN ? "Gỡ quyền Admin" : "Cấp quyền Admin"}
                  >
                    {user.role === UserRole.ADMIN ? <Shield size={20} /> : <ShieldCheck size={20} />}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
