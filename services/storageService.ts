import { CompanyProfile, SocialPost, User, PostStatus, Platform, SocialConnection } from "../types";
import { useState, useEffect } from 'react';

// Keys
const USER_KEY = 'postflow_user';
const COMPANY_KEY = 'postflow_company';
const POSTS_KEY = 'postflow_posts';
const SOCIAL_CONFIG_KEY = 'postflow_social_config';
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

// Social Connections (API Keys)
export const saveSocialConnection = (connection: SocialConnection) => {
    const connections = getSocialConnections();
    // Update or add
    const index = connections.findIndex(c => c.platform === connection.platform);
    if (index !== -1) {
        connections[index] = connection;
    } else {
        connections.push(connection);
    }
    localStorage.setItem(SOCIAL_CONFIG_KEY, JSON.stringify(connections));
    notifyListeners();
};

export const getSocialConnections = (): SocialConnection[] => {
    const stored = localStorage.getItem(SOCIAL_CONFIG_KEY);
    return stored ? JSON.parse(stored) : [];
};

export const getSocialConnection = (platform: Platform): SocialConnection | undefined => {
    return getSocialConnections().find(c => c.platform === platform);
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
  
  const currentPosts = getPosts();
  
  // Always ensure we have the sample posts for demo visualization
  const demoId1 = 'demo-post-1';
  const demoId2 = 'demo-rich-post-2';

  if (!currentPosts.find(p => p.id === demoId1)) {
      const samplePost: SocialPost = {
          id: demoId1,
          userId,
          content: "¡Estamos emocionados de lanzar nuestra nueva feature de IA! 🚀\n\nEsto cambiará la forma en que trabajas. #TechNova #AI",
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
      currentPosts.push(samplePost);
      changed = true;
  }

  // Add a rich post to test new UI features (Images, Line breaks, Dark mode contrast)
  if (!currentPosts.find(p => p.id === demoId2)) {
      const richPost: SocialPost = {
        id: demoId2,
        userId,
        content: `🚀 Transformando el futuro digital.

¿Sabías que el 80% de las empresas que adoptan IA duplican su productividad en 6 meses? No se trata solo de tecnología, se trata de *visión*.

En TechNova, estamos liderando este cambio con herramientas que se adaptan a ti.

💡 ¿Estás listo para el siguiente nivel?

#Innovation #FutureOfWork #AI #TechTrends #BusinessGrowth`,
        platform: Platform.LinkedIn,
        status: PostStatus.Published,
        scheduledDate: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        mediaUrl: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop&q=60",
        analytics: {
            postId: generateId(),
            likes: 850,
            shares: 120,
            comments: 65,
            impressions: 12500,
            engagementRate: 6.8
        }
      };
      currentPosts.push(richPost);
      changed = true;
  }

  if (changed) {
      localStorage.setItem(POSTS_KEY, JSON.stringify(currentPosts));
      notifyListeners();
  }
};

// React Hook for subscription
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