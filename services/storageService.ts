import { CompanyProfile, SocialPost, User, PostStatus, Platform } from "../types";

// Keys
const USER_KEY = 'postflow_user';
const COMPANY_KEY = 'postflow_company';
const POSTS_KEY = 'postflow_posts';

// Mock Data Generators
const generateId = () => Math.random().toString(36).substr(2, 9);

// User Auth Simulation
export const mockLogin = async (email: string): Promise<User> => {
  const user: User = {
    uid: generateId(),
    email,
    displayName: email.split('@')[0],
    photoURL: `https://ui-avatars.com/api/?name=${email}&background=4f46e5&color=fff`
  };
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  return user;
};

export const getCurrentUser = (): User | null => {
  const stored = localStorage.getItem(USER_KEY);
  return stored ? JSON.parse(stored) : null;
};

export const logout = () => {
  localStorage.removeItem(USER_KEY);
};

// Company Profile
export const saveCompanyProfile = (profile: CompanyProfile) => {
  localStorage.setItem(COMPANY_KEY, JSON.stringify(profile));
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
  return newPost;
};

export const updatePost = (post: SocialPost) => {
  const posts = getPosts();
  const index = posts.findIndex(p => p.id === post.id);
  if (index !== -1) {
    posts[index] = post;
    localStorage.setItem(POSTS_KEY, JSON.stringify(posts));
  }
};

export const getPosts = (): SocialPost[] => {
  const stored = localStorage.getItem(POSTS_KEY);
  return stored ? JSON.parse(stored) : [];
};

export const deletePost = (id: string) => {
  const posts = getPosts().filter(p => p.id !== id);
  localStorage.setItem(POSTS_KEY, JSON.stringify(posts));
};

// Seed initial data if empty
export const seedData = (userId: string) => {
  if (!getCompanyProfile()) {
    saveCompanyProfile({
      userId,
      name: "TechNova",
      industry: "Tecnología",
      tone: "Innovador y Profesional",
      description: "Líderes en soluciones SaaS para el futuro del trabajo.",
      keywords: ["SaaS", "AI", "Futuro"]
    });
  }
  if (getPosts().length === 0) {
      // Add some sample posts
      savePost({
          userId,
          content: "¡Estamos emocionados de lanzar nuestra nueva feature de IA! #TechNova #AI",
          platform: Platform.Twitter,
          status: PostStatus.Published,
          scheduledDate: new Date(Date.now() - 86400000).toISOString()
      });
  }
};