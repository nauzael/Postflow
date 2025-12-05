export enum Platform {
  Twitter = 'Twitter',
  LinkedIn = 'LinkedIn',
  Instagram = 'Instagram',
  Facebook = 'Facebook'
}

export enum PostStatus {
  Draft = 'draft',
  Scheduled = 'scheduled',
  Published = 'published'
}

export interface User {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
}

export interface CompanyProfile {
  userId: string;
  name: string;
  industry: string;
  tone: string; // e.g., "Professional", "Casual", "Witty"
  description: string;
  keywords: string[];
}

export interface SocialConnection {
  platform: Platform;
  isConnected: boolean;
  credentials: Record<string, string>; // e.g., { apiKey: '...', apiSecret: '...' }
}

export interface SocialPost {
  id: string;
  userId: string;
  content: string;
  platform: Platform;
  status: PostStatus;
  scheduledDate?: string; // ISO string
  createdAt: string;
  mediaUrl?: string; // Placeholder for image
  analytics?: PostAnalytics;
}

export interface PostAnalytics {
  postId: string;
  likes: number;
  shares: number;
  comments: number;
  impressions: number;
  engagementRate: number;
}

export interface GeneratedContent {
  twitter: string;
  linkedin: string;
  instagram: string;
  facebook: string;
}