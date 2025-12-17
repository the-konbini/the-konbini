
export enum ContentType {
  NOVEL = 'novel',
  COMIC = 'comic',
  VIDEO = 'video'
}

export enum UserRole {
  ADMIN = 'admin',
  CREATOR = 'creator',
  READER = 'reader'
}

export interface Chapter {
  id: string;
  title: string;
  content?: string;
  pages?: string[];
  videoUrl?: string;
  createdAt: string;
}

export interface ContentItem {
  id: string;
  title: string;
  description: string;
  type: ContentType;
  coverUrl: string;
  author: string;
  views: number;
  likes: string[];
  createdAt: string;
  tags: string[];
  chapters: Chapter[];
  status?: string;
}

export interface Comment {
  id: string;
  contentId: string;
  paragraphIndex?: number;
  chapterId?: string;
  userName: string;
  userAvatar: string;
  userId: string;
  text: string;
  createdAt: string;
}

export interface ReadingProgress {
  contentId: string;
  chapterIndex: number;
  updatedAt: string;
}

export interface User {
  id: string;
  name: string;
  email?: string;
  avatar: string;
  bio?: string;
  role: UserRole;
  isAnonymous: boolean;
  favorites: string[]; // Danh sách IDs của truyện yêu thích
  readingHistory: ReadingProgress[]; // Tiến độ đọc
}

export interface SiteSettings {
  siteName: string;
  logoUrl: string;
}
