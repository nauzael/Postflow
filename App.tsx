import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import PostGenerator from './components/PostGenerator';
import { 
  mockLogin, 
  getCurrentUser, 
  logout, 
  getCompanyProfile, 
  saveCompanyProfile, 
  getPosts, 
  seedData,
  deletePost
} from './services/storageService';
import { User, CompanyProfile, PostStatus } from './types';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { Trash2, Edit2, Calendar as CalIcon, CheckCircle, Clock, FileText } from 'lucide-react';

// --- Auth Component ---
const AuthScreen: React.FC<{ onLogin: () => void }> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setTimeout(async () => {
      await mockLogin(email);
      onLogin();
    }, 800);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600 p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="bg-indigo-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-800">PostFlow AI</h1>
          <p className="text-gray-500 mt-2">Gestiona tus redes sociales con Inteligencia Artificial</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
              placeholder="tu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-3 rounded-lg font-bold hover:bg-indigo-700 transition-colors shadow-lg disabled:opacity-70"
          >
            {loading ? 'Entrando...' : 'Entrar / Registrarse'}
          </button>
        </form>
        <p className="mt-6 text-center text-xs text-gray-400">
          Demo Version • No password required
        </p>
      </div>
    </div>
  );
};

// --- Company Profile Component ---
const CompanySettings: React.FC = () => {
  const [profile, setProfile] = useState<CompanyProfile>({
    userId: '', name: '', industry: '', tone: '', description: '', keywords: []
  });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const existing = getCompanyProfile();
    if (existing) setProfile(existing);
    else {
      const user = getCurrentUser();
      if(user) setProfile(p => ({...p, userId: user.uid}));
    }
  }, []);

  const handleSave = () => {
    saveCompanyProfile(profile);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-sm p-6 border border-gray-100">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Perfil de Empresa</h2>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nombre de la Empresa</label>
          <input 
            type="text" 
            value={profile.name} 
            onChange={e => setProfile({...profile, name: e.target.value})}
            className="w-full p-2 border border-gray-300 rounded-md"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Industria</label>
            <input 
              type="text" 
              value={profile.industry} 
              onChange={e => setProfile({...profile, industry: e.target.value})}
              className="w-full p-2 border border-gray-300 rounded-md"
              placeholder="Ej. Tecnología, Moda..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tono de Voz</label>
            <select 
              value={profile.tone}
              onChange={e => setProfile({...profile, tone: e.target.value})}
              className="w-full p-2 border border-gray-300 rounded-md bg-white"
            >
              <option value="">Selecciona...</option>
              <option value="Profesional">Profesional</option>
              <option value="Amigable">Amigable</option>
              <option value="Humorístico">Humorístico</option>
              <option value="Inspirador">Inspirador</option>
            </select>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Descripción corta</label>
          <textarea 
            value={profile.description} 
            onChange={e => setProfile({...profile, description: e.target.value})}
            className="w-full p-2 border border-gray-300 rounded-md"
            rows={3}
            placeholder="¿Qué hace tu empresa?"
          />
        </div>
        <button 
          onClick={handleSave}
          className="w-full bg-indigo-600 text-white py-2 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
        >
          {saved ? '¡Guardado!' : 'Guardar Perfil'}
        </button>
      </div>
    </div>
  );
};

// --- Calendar/Dashboard Component ---
const Dashboard: React.FC<{ activeTab: string }> = ({ activeTab }) => {
  const [posts, setPosts] = useState(getPosts());

  useEffect(() => {
    // Refresh posts when entering dashboard
    setPosts(getPosts());
  }, [activeTab]);

  const handleDelete = (id: string) => {
    if(confirm('¿Borrar este post?')) {
        deletePost(id);
        setPosts(getPosts());
    }
  }

  const StatusBadge = ({ status }: { status: PostStatus }) => {
    const styles = {
      [PostStatus.Published]: "bg-green-100 text-green-800",
      [PostStatus.Scheduled]: "bg-blue-100 text-blue-800",
      [PostStatus.Draft]: "bg-gray-100 text-gray-800"
    };
    const Icons = {
        [PostStatus.Published]: CheckCircle,
        [PostStatus.Scheduled]: Clock,
        [PostStatus.Draft]: FileText
    }
    const Icon = Icons[status];
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status]} gap-1`}>
        <Icon size={12} />
        {status.toUpperCase()}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Publicaciones Recientes</h2>
      </div>

      {posts.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
          <p className="text-gray-500">No hay publicaciones aún.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <div key={post.id} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-3">
                  <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${post.platform === 'Twitter' ? 'bg-sky-100 text-sky-700' : post.platform === 'LinkedIn' ? 'bg-blue-100 text-blue-800' : 'bg-pink-100 text-pink-700'}`}>
                    {post.platform}
                  </span>
                  <StatusBadge status={post.status} />
                </div>
                <p className="text-gray-700 text-sm line-clamp-4 mb-4">{post.content}</p>
              </div>
              
              <div className="border-t border-gray-100 pt-3 flex justify-between items-center text-xs text-gray-500">
                <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                <button onClick={() => handleDelete(post.id)} className="text-red-400 hover:text-red-600 p-1">
                    <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// --- Analytics Component ---
const Analytics: React.FC = () => {
    const posts = getPosts().filter(p => p.status === PostStatus.Published && p.analytics);
    
    // Aggregate Data
    const data = posts.map(p => ({
        name: p.platform + ' ' + p.id.substring(0,3),
        impact: p.analytics?.impressions || 0,
        engagement: p.analytics?.engagementRate || 0
    }));

    const platformData = [
        { name: 'Twitter', value: posts.filter(p => p.platform === 'Twitter').length },
        { name: 'LinkedIn', value: posts.filter(p => p.platform === 'LinkedIn').length },
        { name: 'Instagram', value: posts.filter(p => p.platform === 'Instagram').length },
        { name: 'Facebook', value: posts.filter(p => p.platform === 'Facebook').length },
    ].filter(d => d.value > 0);

    const COLORS = ['#0EA5E9', '#0077B5', '#E1306C', '#4267B2'];

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">Estadísticas de Impacto</h2>
            
            <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-semibold mb-4 text-gray-700">Impresiones por Post</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="name" hide />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="impact" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-semibold mb-4 text-gray-700">Distribución por Plataforma</h3>
                    <div className="h-64">
                         <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={platformData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {platformData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="flex justify-center gap-4 mt-2">
                        {platformData.map((entry, index) => (
                            <div key={entry.name} className="flex items-center text-xs text-gray-500">
                                <span className="w-2 h-2 rounded-full mr-1" style={{backgroundColor: COLORS[index]}}></span>
                                {entry.name}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

             <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100">
                    <h3 className="font-semibold text-gray-700">Detalle de Rendimiento</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                            <tr>
                                <th className="px-6 py-3">Plataforma</th>
                                <th className="px-6 py-3">Impresiones</th>
                                <th className="px-6 py-3">Likes</th>
                                <th className="px-6 py-3">Engagement</th>
                            </tr>
                        </thead>
                        <tbody>
                            {posts.map(post => (
                                <tr key={post.id} className="bg-white border-b hover:bg-gray-50">
                                    <td className="px-6 py-4 font-medium text-gray-900">{post.platform}</td>
                                    <td className="px-6 py-4">{post.analytics?.impressions}</td>
                                    <td className="px-6 py-4">{post.analytics?.likes}</td>
                                    <td className="px-6 py-4 text-green-600 font-bold">{post.analytics?.engagementRate}%</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
             </div>
        </div>
    );
};

// --- Calendar View Component (Simple List sorted by date) ---
const CalendarView: React.FC = () => {
  const scheduledPosts = getPosts()
    .filter(p => p.status === PostStatus.Scheduled && p.scheduledDate)
    .sort((a, b) => new Date(a.scheduledDate!).getTime() - new Date(b.scheduledDate!).getTime());

  return (
    <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-800">Calendario Editorial</h2>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            {scheduledPosts.length === 0 ? (
                <div className="text-center py-8 text-gray-500">No hay publicaciones programadas.</div>
            ) : (
                <div className="relative border-l border-gray-200 ml-3 space-y-8">
                    {scheduledPosts.map((post) => (
                        <div key={post.id} className="mb-8 ml-6">
                            <span className="absolute flex items-center justify-center w-6 h-6 bg-indigo-100 rounded-full -left-3 ring-8 ring-white">
                                <CalIcon size={12} className="text-indigo-600" />
                            </span>
                            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 shadow-sm">
                                <div className="flex justify-between items-center mb-2">
                                    <time className="text-sm font-normal leading-none text-gray-400">
                                        {new Date(post.scheduledDate!).toLocaleString()}
                                    </time>
                                    <span className="text-xs font-bold px-2 py-1 bg-white rounded border border-gray-200">{post.platform}</span>
                                </div>
                                <p className="text-base font-normal text-gray-700">{post.content}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    </div>
  );
}

// --- Main App Component ---
const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
      seedData(currentUser.uid);
    }
  }, []);

  const handleLogin = () => {
    const currentUser = getCurrentUser();
    setUser(currentUser);
    if(currentUser) seedData(currentUser.uid);
  };

  const handleLogout = () => {
    logout();
    setUser(null);
  };

  if (!user) {
    return <AuthScreen onLogin={handleLogin} />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'generator': return <PostGenerator />;
      case 'profile': return <CompanySettings />;
      case 'analytics': return <Analytics />;
      case 'calendar': return <CalendarView />;
      case 'dashboard':
      default: return <Dashboard activeTab={activeTab} />;
    }
  };

  return (
    <Layout 
      activeTab={activeTab} 
      setActiveTab={setActiveTab} 
      user={user} 
      onLogout={handleLogout}
    >
      {renderContent()}
    </Layout>
  );
};

export default App;