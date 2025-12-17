
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ContentItem, ContentType, Chapter } from '../types';
import { Sparkles, Upload, Loader2, Save, Code, PlusCircle, Image as ImageIcon, X, Trash2, ArrowLeft, Send, Check, User } from 'lucide-react';
import { generateCreativeContent, generateTags } from '../services/geminiService';
import { DatabaseService } from '../services/database';

interface Props {
  onPublish: (item: ContentItem) => void;
}

export const Studio: React.FC<Props> = ({ onPublish }) => {
  const navigate = useNavigate();
  const { editId } = useParams<{ editId: string }>();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [loading, setLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [aiGenerating, setAiGenerating] = useState(false);
  
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('The Konbini Studio'); // Mặc định hoặc nhập mới
  const [description, setDescription] = useState('');
  const [type, setType] = useState<ContentType>(ContentType.NOVEL);
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [activeChapterIdx, setActiveChapterIdx] = useState(0);

  useEffect(() => {
    if (editId) {
      const fetchItem = async () => {
        setIsFetching(true);
        const item = await DatabaseService.getItemById(editId);
        if (item) {
          setTitle(item.title);
          setAuthor(item.author || 'The Konbini Studio');
          setDescription(item.description);
          setType(item.type);
          setCoverImage(item.coverUrl);
          setTags(item.tags);
          setChapters(item.chapters.map(ch => ({
            ...ch,
            content: ch.content ? ch.content.replace(/<p>|<\/p>/g, '').replace(/<br\/>/g, '\n') : ''
          })));
        }
        setIsFetching(false);
      };
      fetchItem();
    } else {
      setChapters([{
        id: Date.now().toString(),
        title: 'Chương 1: Khởi đầu',
        content: '',
        createdAt: new Date().toLocaleDateString('vi-VN')
      }]);
    }
  }, [editId]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("Kích thước ảnh quá lớn! Vui lòng chọn ảnh dưới 2MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const addChapter = () => {
    const newIdx = chapters.length;
    setChapters([...chapters, {
      id: Date.now().toString(),
      title: `Chương ${newIdx + 1}`,
      content: '',
      createdAt: new Date().toLocaleDateString('vi-VN')
    }]);
    setActiveChapterIdx(newIdx);
  };

  const updateChapterTitle = (newTitle: string) => {
    const newChapters = [...chapters];
    newChapters[activeChapterIdx].title = newTitle;
    setChapters(newChapters);
  };

  const updateChapterContent = (newContent: string) => {
    const newChapters = [...chapters];
    newChapters[activeChapterIdx].content = newContent;
    setChapters(newChapters);
  };

  const deleteChapter = (idx: number) => {
    if (chapters.length <= 1) return;
    const newChapters = chapters.filter((_, i) => i !== idx);
    setChapters(newChapters);
    setActiveChapterIdx(Math.max(0, idx - 1));
  };

  const handleMagicAssist = async () => {
    if (!title && !description) {
      alert("Vui lòng nhập ít nhất Tiêu đề để AI có thể hỗ trợ!");
      return;
    }
    setAiGenerating(true);
    const currentContent = chapters[activeChapterIdx].content || '';
    const prompt = title ? `Viết tiếp nội dung chương "${chapters[activeChapterIdx].title}" cho truyện "${title}"` : `Gợi ý ý tưởng tiếp theo`;
    const result = await generateCreativeContent(prompt, type, currentContent);
    updateChapterContent(currentContent + (currentContent ? "\n\n" : "") + result);
    setAiGenerating(false);
  };

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const generatedTags = tags.length > 0 ? tags : await generateTags(title, description || title);
      
      const formattedChapters = chapters.map(ch => ({
        ...ch,
        content: type === ContentType.NOVEL ? `<p>${ch.content?.replace(/\n/g, '<br/>')}</p>` : undefined,
        pages: type === ContentType.COMIC ? ch.pages || ['https://picsum.photos/seed/p1/800/1200'] : undefined,
        videoUrl: type === ContentType.VIDEO ? ch.videoUrl || 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4' : undefined,
      }));

      const newItem: ContentItem = {
        id: editId || Date.now().toString(),
        title,
        description,
        type,
        coverUrl: coverImage || `https://picsum.photos/seed/${Date.now()}/600/800`,
        author: author.trim() || 'The Konbini Studio', // Sử dụng tên tác giả được nhập vào
        views: editId ? (await DatabaseService.getItemById(editId))?.views || 0 : 0,
        likes: editId ? (await DatabaseService.getItemById(editId))?.likes || [] : [],
        createdAt: editId ? (await DatabaseService.getItemById(editId))?.createdAt || new Date().toLocaleDateString('vi-VN') : new Date().toLocaleDateString('vi-VN'),
        tags: generatedTags,
        chapters: formattedChapters
      };

      await onPublish(newItem);
      navigate(editId ? `/intro/${editId}` : '/');
    } catch (error) {
      console.error("Lỗi lưu bài:", error);
      alert("Đã xảy ra lỗi khi lưu tác phẩm.");
    } finally {
      setLoading(false);
    }
  };

  if (isFetching) return (
    <div className="flex flex-col items-center justify-center h-[60vh]">
        <Loader2 className="animate-spin text-brand-600 mb-4" size={40} />
        <p className="text-xs font-black uppercase tracking-widest text-stone-400">Đang nạp dữ liệu tác phẩm...</p>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto pb-32 animate-in fade-in duration-500">
      <div className="flex items-center justify-between mb-10">
        <button type="button" onClick={() => navigate(-1)} className="flex items-center gap-2 text-stone-500 hover:text-brand-600 font-black text-[10px] uppercase tracking-widest transition-all">
          <ArrowLeft size={16} /> Quay lại
        </button>
        <h2 className="text-2xl font-black uppercase tracking-tight text-stone-900 dark:text-white flex items-center gap-3">
          <div className="w-1.5 h-6 bg-brand-600 rounded-full"></div>
          {editId ? 'Hiệu chỉnh tác phẩm' : 'Sáng tạo tác phẩm mới'}
        </h2>
      </div>

      <form onSubmit={handlePublish} className="grid lg:grid-cols-12 gap-10">
        <div className="lg:col-span-4 space-y-8">
            <div className="bg-white dark:bg-brand-900/20 border border-brand-100 dark:border-brand-800 p-8 rounded-[3rem] shadow-xl">
                <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest block mb-4">Ảnh bìa tác phẩm</label>
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className={`aspect-[3/4] rounded-2xl border-2 border-dashed flex flex-col items-center justify-center relative overflow-hidden transition-all group cursor-pointer ${
                    coverImage 
                      ? 'border-brand-500 bg-brand-50' 
                      : 'border-brand-200 dark:border-brand-800 hover:border-brand-400 bg-brand-50/30 dark:bg-brand-900/10'
                  }`}
                >
                  {coverImage ? (
                    <img src={coverImage} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <>
                      <ImageIcon size={32} className="text-brand-300 mb-2" />
                      <span className="text-[10px] font-bold text-stone-400 px-4 text-center uppercase tracking-widest">Tải ảnh (3:4)</span>
                    </>
                  )}
                  <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
                </div>

                <div className="mt-8 space-y-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest px-1">Tiêu đề tác phẩm</label>
                        <input 
                        type="text" required value={title} onChange={e => setTitle(e.target.value)}
                        className="w-full bg-brand-50 dark:bg-brand-950/50 border border-brand-100 dark:border-brand-800 rounded-xl px-4 py-3 text-stone-900 dark:text-white outline-none focus:border-brand-500 transition-all font-bold"
                        placeholder="Tên bộ truyện/video..."
                        />
                    </div>

                    {/* Ô NHẬP TÊN TÁC GIẢ MỚI */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest px-1 flex items-center gap-2">
                          <User size={12} /> Tên Tác giả (Người sáng tác)
                        </label>
                        <input 
                        type="text" required value={author} onChange={e => setAuthor(e.target.value)}
                        className="w-full bg-brand-50 dark:bg-brand-950/50 border border-brand-100 dark:border-brand-800 rounded-xl px-4 py-3 text-stone-900 dark:text-white outline-none focus:border-brand-500 transition-all font-bold"
                        placeholder="Ví dụ: Kim Dung, Team Konbini..."
                        />
                        <p className="text-[9px] text-stone-400 italic px-1">* Hệ thống sẽ dùng tên này để tạo hồ sơ riêng cho tác giả.</p>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest px-1">Mô tả ngắn</label>
                        <textarea 
                        rows={4} required value={description} onChange={e => setDescription(e.target.value)}
                        className="w-full bg-brand-50 dark:bg-brand-950/50 border border-brand-100 dark:border-brand-800 rounded-xl px-4 py-3 text-stone-900 dark:text-white outline-none focus:border-brand-500 transition-all text-sm leading-relaxed"
                        placeholder="Tóm tắt cốt truyện hấp dẫn..."
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest px-1">Loại nội dung</label>
                        <div className="grid grid-cols-3 gap-2">
                            {[ContentType.NOVEL, ContentType.COMIC, ContentType.VIDEO].map(t => (
                                <button
                                    key={t} type="button" onClick={() => setType(t)}
                                    className={`py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${type === t ? 'bg-brand-600 border-brand-600 text-white shadow-lg shadow-brand-600/20' : 'bg-brand-50 dark:bg-brand-950/40 border-brand-100 dark:border-brand-800 text-stone-500'}`}
                                >
                                    {t === ContentType.NOVEL ? 'Chữ' : t === ContentType.COMIC ? 'Tranh' : 'Video'}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <button 
                type="submit" disabled={loading}
                className={`w-full py-5 text-white font-black uppercase tracking-widest text-sm rounded-[2rem] flex items-center justify-center gap-3 shadow-2xl transition-all active:scale-95 disabled:opacity-50 ${
                  editId 
                  ? 'bg-brand-800 hover:bg-brand-700 shadow-brand-900/30' 
                  : 'bg-brand-600 hover:bg-brand-500 shadow-brand-600/30'
                }`}
            >
                {loading ? <Loader2 className="animate-spin" /> : editId ? <Check size={20} /> : <Send size={20} />}
                {editId ? 'Cập nhật' : 'Đăng tải tác phẩm'}
            </button>
        </div>

        <div className="lg:col-span-8 space-y-8">
            <div className="bg-white dark:bg-brand-900/20 border border-brand-100 dark:border-brand-800 rounded-[3.5rem] overflow-hidden shadow-xl">
                <div className="p-6 border-b border-brand-50 dark:border-brand-800 bg-brand-50/30 dark:bg-brand-950/30 flex items-center gap-2 overflow-x-auto custom-scrollbar">
                    {chapters.map((ch, idx) => (
                        <div key={ch.id} className="flex-shrink-0 flex items-center gap-1 group">
                            <button
                                type="button"
                                onClick={() => setActiveChapterIdx(idx)}
                                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${
                                    activeChapterIdx === idx 
                                    ? 'bg-brand-600 border-brand-600 text-white shadow-lg' 
                                    : 'bg-white dark:bg-brand-900/50 border-brand-100 dark:border-brand-800 text-stone-500 hover:border-brand-300'
                                }`}
                            >
                                Chương {idx + 1}
                            </button>
                            {chapters.length > 1 && (
                                <button type="button" onClick={() => deleteChapter(idx)} className="p-2 text-stone-300 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100">
                                    <X size={14} />
                                </button>
                            )}
                        </div>
                    ))}
                    <button type="button" onClick={addChapter} className="p-2 bg-brand-600 text-white rounded-xl hover:bg-brand-500 transition-all active:scale-90">
                        <PlusCircle size={20} />
                    </button>
                </div>

                <div className="p-10 space-y-6">
                    <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                         <div className="w-full md:w-1/2">
                            <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest block mb-2 px-1">Tiêu đề chương</label>
                            <input 
                                type="text" required value={chapters[activeChapterIdx]?.title || ''} 
                                onChange={e => updateChapterTitle(e.target.value)}
                                className="w-full bg-brand-50 dark:bg-brand-950 border border-brand-100 dark:border-brand-800 rounded-xl px-4 py-3 text-stone-900 dark:text-white outline-none focus:border-brand-500 font-bold"
                                placeholder="Tên chương..."
                            />
                         </div>
                         <button type="button" onClick={handleMagicAssist} disabled={aiGenerating} className="flex items-center gap-2 px-6 py-3 bg-brand-50 dark:bg-brand-900/60 text-brand-600 dark:text-brand-300 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-brand-100 dark:border-brand-800 hover:bg-brand-600 hover:text-white transition-all shadow-sm active:scale-95">
                            {aiGenerating ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />} Sáng tạo bằng AI
                         </button>
                    </div>

                    <div className="relative">
                         <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest block mb-2 px-1">Nội dung chương</label>
                         <textarea 
                            rows={15} 
                            value={chapters[activeChapterIdx]?.content || ''} 
                            onChange={e => updateChapterContent(e.target.value)}
                            className="w-full bg-white dark:bg-brand-950/50 border border-brand-100 dark:border-brand-800 rounded-3xl p-8 text-stone-800 dark:text-stone-200 outline-none focus:border-brand-500 font-serif text-lg leading-relaxed shadow-inner"
                            placeholder={type === ContentType.NOVEL ? "Viết câu chuyện của bạn tại đây..." : "Dán link ảnh hoặc mô tả phân cảnh..."}
                         />
                    </div>
                </div>
            </div>
        </div>
      </form>
    </div>
  );
};
