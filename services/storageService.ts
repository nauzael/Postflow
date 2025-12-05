import { CompanyProfile, SocialPost, User, PostStatus, Platform } from "../types";

// Keys
const USER_KEY = 'postflow_user';
const COMPANY_KEY = 'postflow_company';
const POSTS_KEY = 'postflow_posts';
const EVENT_NAME = 'postflow-storage-update';

// Mock Data Generators
const generateId = () => Math.random().toString(36).substr(2, 9);

// Helper to notify listeners
const notifyListeners = () => {
  window.dispatchEvent(new Event(EVENT_NAME));
};

// User Auth Simulation
export const mockLogin = async (email: string): Promise<User> => {
  const user: User = {
    uid: generateId(),
    email,
    displayName: email.split('@')[0],
    photoURL: `https://ui-avatars.com/api/?name=${email}&background=4f46e5&color=fff`
  };
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  notifyListeners();
  return user;
};

export const getCurrentUser = (): User | null => {
  const stored = localStorage.getItem(USER_KEY);
  return stored ? JSON.parse(stored) : null;
};

export const logout = () => {
  localStorage.removeItem(USER_KEY);
  notifyListeners();
};

// Company Profile
export const saveCompanyProfile = (profile: CompanyProfile) => {
  localStorage.setItem(COMPANY_KEY, JSON.stringify(profile));
  notifyListeners();
};

export const getCompanyProfile = (): CompanyProfile | null => {
  const stored = localStorage.getItem(COMPANY_KEY);
  return stored ? JSON.parse(stored) : null;
};

// Posts CRUD
export const savePost = (post: Omit<SocialPost, 'id' | 'createdAt'>) => {
  const posts = getPosts();
  const newPost: SocialPost = {
    ...post,
    id: generateId(),
    createdAt: new Date().toISOString(),
    // Mock analytics for demo purposes if published
    analytics: post.status === PostStatus.Published ? {
      postId: generateId(),
      likes: Math.floor(Math.random() * 500),
      shares: Math.floor(Math.random() * 100),
      comments: Math.floor(Math.random() * 50),
      impressions: Math.floor(Math.random() * 5000),
      engagementRate: parseFloat((Math.random() * 5).toFixed(2))
    } : undefined
  };
  posts.push(newPost);
  localStorage.setItem(POSTS_KEY, JSON.stringify(posts));
  notifyListeners();
  return newPost;
};

export const updatePost = (post: SocialPost) => {
  const posts = getPosts();
  const index = posts.findIndex(p => p.id === post.id);
  if (index !== -1) {
    posts[index] = post;
    localStorage.setItem(POSTS_KEY, JSON.stringify(posts));
    notifyListeners();
  }
};

export const getPosts = (): SocialPost[] => {
  const stored = localStorage.getItem(POSTS_KEY);
  return stored ? JSON.parse(stored) : [];
};

export const deletePost = (id: string) => {
  const posts = getPosts().filter(p => p.id !== id);
  localStorage.setItem(POSTS_KEY, JSON.stringify(posts));
  notifyListeners();
};

// Seed initial data if empty
export const seedData = (userId: string) => {
  let changed = false;
  if (!getCompanyProfile()) {
    localStorage.setItem(COMPANY_KEY, JSON.stringify({
      userId,
      name: "TechNova",
      industry: "Tecnología",
      tone: "Innovador y Profesional",
      description: "Líderes en soluciones SaaS para el futuro del trabajo.",
      keywords: ["SaaS", "AI", "Futuro"]
    }));
    changed = true;
  }
  if (getPosts().length === 0) {
      const samplePost: SocialPost = {
          id: generateId(),
          userId,
          content: "¡Estamos emocionados de lanzar nuestra nueva feature de IA! #TechNova #AI",
          platform: Platform.Twitter,
          status: PostStatus.Published,
          scheduledDate: new Date(Date.now() - 86400000).toISOString(),
          createdAt: new Date().toISOString(),
          analytics: {
            postId: generateId(),
            likes: 120,
            shares: 45,
            comments: 12,
            impressions: 1200,
            engagementRate: 3.5
          }
      };
      localStorage.setItem(POSTS_KEY, JSON.stringify([samplePost]));
      changed = true;
  }
  if (changed) notifyListeners();
};

// React Hook for subscription
import { useState, useEffect } from 'react';

export const usePosts = () => {
  const [posts, setPosts] = useState<SocialPost[]>(getPosts());

  useEffect(() => {
    const handleUpdate = () => setPosts(getPosts());
    window.addEventListener(EVENT_NAME, handleUpdate);
    // Initial fetch to ensure sync
    handleUpdate(); 
    return () => window.removeEventListener(EVENT_NAME, handleUpdate);
  }, []);

  return posts;
};