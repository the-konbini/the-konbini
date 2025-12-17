
import { ContentItem, ContentType, User, UserRole, SiteSettings } from './types';

export const GUEST_USER: User = {
  id: 'guest_' + Math.random().toString(36).substr(2, 9),
  name: 'Khách ẩn danh',
  avatar: 'https://api.dicebear.com/7.x/identicon/svg?seed=guest&backgroundColor=f0f0f0',
  role: UserRole.READER,
  isAnonymous: true,
  favorites: [],
  readingHistory: []
};

export const MOCK_USER: User = GUEST_USER;

export const INITIAL_SITE_SETTINGS: SiteSettings = {
  siteName: 'THE KONBINI',
  logoUrl: ''
};

export const MOCK_USERS_LIST: User[] = [
  {
    id: 'admin_01',
    name: 'The Konbini Admin',
    avatar: 'https://api.dicebear.com/7.x/identicon/svg?seed=admin',
    role: UserRole.ADMIN,
    isAnonymous: false,
    favorites: [],
    readingHistory: []
  }
];

export const INITIAL_CONTENT: ContentItem[] = [
  {
    id: '1',
    title: 'Thợ Săn Bóng Đêm',
    description: 'Trong một thế giới nơi bóng tối nuốt chửng ánh sáng, một thợ săn đơn độc đứng lên chống lại định mệnh.',
    type: ContentType.COMIC,
    coverUrl: 'https://picsum.photos/seed/comic1/600/800',
    author: 'The Konbini Studio',
    status: 'Hoàn thành',
    views: 12500,
    likes: [],
    createdAt: '2023-10-01',
    tags: ['Hành động', 'Giả tưởng'],
    chapters: [
      {
        id: 'c1-1',
        title: 'Chương 1: Sự khởi đầu',
        pages: ['https://picsum.photos/seed/page1/800/1200'],
        createdAt: '2023-10-01'
      }
    ]
  },
  {
    id: '2',
    title: 'Bí Mật Của Gió',
    description: 'Câu chuyện tình yêu nhẹ nhàng giữa lòng thành phố nhộn nhịp.',
    type: ContentType.NOVEL,
    coverUrl: 'https://picsum.photos/seed/novel1/600/800',
    author: 'The Konbini Writers',
    status: 'Đang cập nhật',
    views: 5400,
    likes: [],
    createdAt: '2023-10-05',
    tags: ['Lãng mạn', 'Đời thường'],
    chapters: [
      {
        id: 'c2-1',
        title: 'Chương 1: Cơn gió lạ',
        content: 'Buổi chiều hôm ấy, bầu trời Hà Nội trong vắt...',
        createdAt: '2023-10-05'
      }
    ]
  }
];
