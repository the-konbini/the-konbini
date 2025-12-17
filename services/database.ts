
import { ContentItem, Comment, SiteSettings, User, UserRole, ReadingProgress } from '../types';
import { INITIAL_CONTENT, INITIAL_SITE_SETTINGS, MOCK_USERS_LIST } from '../constants';

// Key dùng cho Local Storage (Dùng tạm khi chưa kết nối Cloud DB)
const DB_KEY = 'konbini_cloud_data';
const COMMENTS_KEY = 'konbini_comments_data';
const SETTINGS_KEY = 'konbini_site_settings_data';
const USERS_KEY = 'konbini_users_list_data';

export const DatabaseService = {
  // Giả lập độ trễ mạng để UI mượt mà hơn
  simulateNetwork: () => new Promise(resolve => setTimeout(resolve, 500)),

  async getSiteSettings(): Promise<SiteSettings> {
    const data = localStorage.getItem(SETTINGS_KEY);
    return data ? JSON.parse(data) : INITIAL_SITE_SETTINGS;
  },

  async updateSiteSettings(settings: SiteSettings): Promise<boolean> {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    return true;
  },

  async getAllUsers(): Promise<User[]> {
    const data = localStorage.getItem(USERS_KEY);
    return data ? JSON.parse(data) : MOCK_USERS_LIST;
  },

  async updateUserRole(userId: string, newRole: UserRole): Promise<boolean> {
    const users = await this.getAllUsers();
    const updated = users.map(u => u.id === userId ? { ...u, role: newRole } : u);
    localStorage.setItem(USERS_KEY, JSON.stringify(updated));
    return true;
  },

  async getAllItems(): Promise<ContentItem[]> {
    await this.simulateNetwork();
    const data = localStorage.getItem(DB_KEY);
    // Khi chạy lần đầu trên web công khai, sẽ lấy dữ liệu mẫu ban đầu
    const items = data ? JSON.parse(data) : INITIAL_CONTENT;
    if (!data) {
      localStorage.setItem(DB_KEY, JSON.stringify(INITIAL_CONTENT));
    }
    return items;
  },

  async getItemById(id: string): Promise<ContentItem | undefined> {
    const items = await this.getAllItems();
    return items.find(i => i.id === id);
  },

  async saveItem(newItem: ContentItem): Promise<boolean> {
    await this.simulateNetwork();
    const currentData = await this.getAllItems();
    const existingIndex = currentData.findIndex(i => i.id === newItem.id);
    
    let updatedData;
    if (existingIndex > -1) {
      updatedData = [...currentData];
      updatedData[existingIndex] = newItem;
    } else {
      updatedData = [newItem, ...currentData];
    }
    
    localStorage.setItem(DB_KEY, JSON.stringify(updatedData));
    return true;
  },

  async deleteItem(id: string): Promise<boolean> {
    await this.simulateNetwork();
    const currentData = await this.getAllItems();
    const updatedData = currentData.filter(item => item.id !== id);
    localStorage.setItem(DB_KEY, JSON.stringify(updatedData));
    return true;
  },

  async getComments(contentId: string): Promise<Comment[]> {
    const data = localStorage.getItem(COMMENTS_KEY);
    const allComments: Comment[] = data ? JSON.parse(data) : [];
    return allComments.filter(c => c.contentId === contentId).sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  },

  async addComment(comment: Comment): Promise<boolean> {
    const data = localStorage.getItem(COMMENTS_KEY);
    const allComments = data ? JSON.parse(data) : [];
    allComments.push(comment);
    localStorage.setItem(COMMENTS_KEY, JSON.stringify(allComments));
    return true;
  },

  async toggleLike(contentId: string, userId: string): Promise<{ likes: number; isLiked: boolean }> {
    const items = await this.getAllItems();
    const itemIndex = items.findIndex(i => i.id === contentId);
    if (itemIndex === -1) return { likes: 0, isLiked: false };

    const item = items[itemIndex];
    if (!item.likes) item.likes = [];
    const userIndex = item.likes.indexOf(userId);
    let isLiked = false;

    if (userIndex === -1) {
      item.likes.push(userId);
      isLiked = true;
    } else {
      item.likes.splice(userIndex, 1);
      isLiked = false;
    }

    localStorage.setItem(DB_KEY, JSON.stringify(items));
    return { likes: item.likes.length, isLiked };
  },

  async toggleFavorite(user: User, contentId: string): Promise<User> {
    const newFavorites = user.favorites.includes(contentId)
      ? user.favorites.filter(id => id !== contentId)
      : [...user.favorites, contentId];
    
    const updatedUser = { ...user, favorites: newFavorites };
    localStorage.setItem('konbini_user_profile', JSON.stringify(updatedUser));
    return updatedUser;
  },

  async updateReadingProgress(user: User, contentId: string, chapterIndex: number): Promise<User | null> {
    if (user.isAnonymous) return null;

    const history = [...(user.readingHistory || [])];
    const existingIndex = history.findIndex(h => h.contentId === contentId);
    
    const newProgress: ReadingProgress = {
      contentId,
      chapterIndex,
      updatedAt: new Date().toISOString()
    };

    if (existingIndex > -1) {
      history[existingIndex] = newProgress;
    } else {
      history.push(newProgress);
    }

    const updatedUser = { ...user, readingHistory: history };
    localStorage.setItem('konbini_user_profile', JSON.stringify(updatedUser));
    return updatedUser;
  }
};
