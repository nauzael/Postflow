import React, { useState } from 'react';
import { usePosts, deletePost } from '../services/storageService';
import { PostStatus, SocialPost } from '../types';
import { Trash2, CheckCircle, Clock, FileText, Eye, X, BarChart2, Calendar, Share2, MessageCircle, Heart, ThumbsUp } from 'lucide-react';

const Dashboard: React.FC = () => {
  const posts = usePosts();
  const [filter, setFilter] = useState<PostStatus | 'all'>('all');
  const [selectedPost, setSelectedPost] = useState<SocialPost | null>(null);

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if(confirm('¿Borrar este post?')) {
        deletePost(id);
        if (selectedPost?.id === id) setSelectedPost(null);
    }
  }

  const filteredPosts = posts.filter(post => {
      if (filter === 'all') return true;
      return post.status === filter;
  }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const StatusBadge = ({ status }: { status: PostStatus }) => {
    const styles = {
      [PostStatus.Published]: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border-green-200 dark:border-green-800",
      [PostStatus.Scheduled]: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-800",
      [PostStatus.Draft]: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600"
    };
    const Icons = {
        [PostStatus.Published]: CheckCircle,
        [PostStatus.Scheduled]: Clock,
        [PostStatus.Draft]: FileText
    }
    const Icon = Icons[status];
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[status]} gap-1`}>
        <Icon size={12} />
        {status === PostStatus.Published ? 'PUBLICADO' : status === PostStatus.Scheduled ? 'PROGRAMADO' : 'BORRADOR'}
      </span>
    );
  };

  const FilterTab = ({ label, value, icon: Icon }: { label: string, value: PostStatus | 'all', icon?: any }) => (
      <button
        onClick={() => setFilter(value)}
        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
            filter === value 
            ? 'bg-indigo-600 text-white shadow-md' 
            : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 border border-transparent'
        }`}
      >
        {Icon && <Icon size={16} />}
        {label}
      </button>
  );

  return (
    <div className="space-y-6 animate-fade-in relative">
      
      {/* Header & Filters */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Panel de Gestión</h2>
        <div className="flex flex-wrap gap-2 p-1 bg-gray-100 dark:bg-gray-800/50 rounded-xl">
            <FilterTab label="Todos" value="all" />
            <FilterTab label="Publicados" value={PostStatus.Published} icon={CheckCircle} />
            <FilterTab label="Programados" value={PostStatus.Scheduled} icon={Clock} />
            <FilterTab label="Borradores" value={PostStatus.Draft} icon={FileText} />
        </div>
      </div>

      {/* Grid */}
      {filteredPosts.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm transition-colors flex flex-col items-center justify-center">
          <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-full mb-4">
             <FileText size={32} className="text-gray-400" />
          </div>
          <p className="text-lg text-gray-600 dark:text-gray-300 font-medium">No se encontraron publicaciones</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Intenta cambiar el filtro o crea un nuevo post.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredPosts.map((post) => (
            <div 
                key={post.id} 
                onClick={() => setSelectedPost(post)}
                className="group bg-white dark:bg-gray-800 rounded-xl p-0 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-lg dark:hover:border-indigo-500/30 hover:border-indigo-200 transition-all flex flex-col h-full cursor-pointer overflow-hidden relative"
            >
              {/* Image Preview (Thumbnail) */}
              {post.mediaUrl && (
                  <div className="h-32 w-full overflow-hidden bg-gray-100 dark:bg-gray-900">
                      <img src={post.mediaUrl} alt="Post media" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
              )}
              
              <div className="p-5 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-3">
                  <span className={`px-2 py-1 rounded-md text-xs font-bold uppercase tracking-wider
                    ${post.platform === 'Twitter' ? 'bg-sky-50 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300' : 
                      post.platform === 'LinkedIn' ? 'bg-blue-50 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' : 
                      post.platform === 'Instagram' ? 'bg-pink-50 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300' :
                      'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300'}`}>
                    {post.platform}
                  </span>
                  <StatusBadge status={post.status} />
                </div>
                
                <p className="text-gray-700 dark:text-gray-300 text-sm line-clamp-3 mb-4 whitespace-pre-line flex-1">
                    {post.content || <span className="italic text-gray-400">Sin contenido de texto...</span>}
                </p>
                
                <div className="border-t border-gray-100 dark:border-gray-700 pt-4 flex justify-between items-center text-xs text-gray-500 dark:text-gray-400">
                  <span className="flex items-center gap-1">
                      <Calendar size={12} />
                      {new Date(post.scheduledDate || post.createdAt).toLocaleDateString()}
                  </span>
                  
                  <div className="flex items-center gap-2">
                    <button 
                        className="text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 p-1.5 rounded-full transition-colors"
                        title="Ver detalles"
                    >
                        <Eye size={16} />
                    </button>
                    <button 
                        onClick={(e) => handleDelete(post.id, e)} 
                        className="text-gray-400 hover:text-red-500 dark:hover:text-red-400 p-1.5 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                        title="Eliminar"
                    >
                        <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* POST DETAILS MODAL */}
      {selectedPost && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setSelectedPost(null)}>
              <div 
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto overflow-x-hidden relative flex flex-col animate-in zoom-in-95 duration-200" 
                onClick={e => e.stopPropagation()}
              >
                  {/* Modal Header */}
                  <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 p-4 flex justify-between items-center z-10">
                      <div>
                          <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                              {selectedPost.platform} Post
                          </h3>
                          <p className="text-xs text-gray-500">ID: {selectedPost.id}</p>
                      </div>
                      <button 
                        onClick={() => setSelectedPost(null)}
                        className="p-2 bg-gray-100 dark:bg-gray-700 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                      >
                          <X size={20} className="text-gray-600 dark:text-gray-300" />
                      </button>
                  </div>

                  {/* Modal Content */}
                  <div className="p-6 space-y-6">
                      
                      {/* Status Bar */}
                      <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-700/30 p-3 rounded-lg">
                          <div className="flex items-center gap-3">
                              <StatusBadge status={selectedPost.status} />
                              <span className="text-sm text-gray-500 dark:text-gray-400 border-l border-gray-300 dark:border-gray-600 pl-3">
                                {selectedPost.status === PostStatus.Scheduled 
                                    ? `Programado para: ${new Date(selectedPost.scheduledDate!).toLocaleString()}`
                                    : `Creado el: ${new Date(selectedPost.createdAt).toLocaleString()}`
                                }
                              </span>
                          </div>
                      </div>

                      {/* Main Content */}
                      <div className="flex flex-col gap-6">
                          {selectedPost.mediaUrl && (
                              <div className="w-full rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-black/20">
                                  <img src={selectedPost.mediaUrl} alt="Post content" className="w-full h-auto max-h-96 object-contain mx-auto" />
                              </div>
                          )}
                          
                          <div className="bg-gray-50 dark:bg-gray-900/50 p-6 rounded-xl border border-gray-100 dark:border-gray-700">
                              <h4 className="text-xs font-bold text-gray-400 uppercase mb-2">Contenido del Texto</h4>
                              <p className="text-gray-800 dark:text-gray-200 whitespace-pre-line leading-relaxed text-sm md:text-base">
                                  {selectedPost.content}
                              </p>
                          </div>
                      </div>

                      {/* Analytics Section (Only for Published) */}
                      {selectedPost.status === PostStatus.Published && selectedPost.analytics && (
                          <div className="border-t border-gray-100 dark:border-gray-700 pt-6">
                              <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                  <BarChart2 size={18} className="text-indigo-600" />
                                  Métricas de Impacto
                              </h4>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl text-center">
                                      <Eye size={20} className="mx-auto text-blue-600 dark:text-blue-400 mb-2" />
                                      <div className="text-2xl font-bold text-gray-900 dark:text-white">{selectedPost.analytics.impressions}</div>
                                      <div className="text-xs text-gray-500 dark:text-gray-400">Impresiones</div>
                                  </div>
                                  <div className="bg-pink-50 dark:bg-pink-900/20 p-4 rounded-xl text-center">
                                      <Heart size={20} className="mx-auto text-pink-600 dark:text-pink-400 mb-2" />
                                      <div className="text-2xl font-bold text-gray-900 dark:text-white">{selectedPost.analytics.likes}</div>
                                      <div className="text-xs text-gray-500 dark:text-gray-400">Likes</div>
                                  </div>
                                  <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-xl text-center">
                                      <MessageCircle size={20} className="mx-auto text-green-600 dark:text-green-400 mb-2" />
                                      <div className="text-2xl font-bold text-gray-900 dark:text-white">{selectedPost.analytics.comments}</div>
                                      <div className="text-xs text-gray-500 dark:text-gray-400">Comentarios</div>
                                  </div>
                                  <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-xl text-center">
                                      <Share2 size={20} className="mx-auto text-purple-600 dark:text-purple-400 mb-2" />
                                      <div className="text-2xl font-bold text-gray-900 dark:text-white">{selectedPost.analytics.shares}</div>
                                      <div className="text-xs text-gray-500 dark:text-gray-400">Compartidos</div>
                                  </div>
                              </div>
                          </div>
                      )}
                  </div>
                  
                  {/* Modal Footer */}
                  <div className="sticky bottom-0 bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700 p-4 flex justify-end gap-3 z-10">
                       <button 
                        onClick={(e) => handleDelete(selectedPost.id, e as any)}
                        className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors text-sm font-medium"
                       >
                           <Trash2 size={16} /> Eliminar
                       </button>
                       <button 
                        onClick={() => setSelectedPost(null)}
                        className="px-6 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors text-sm font-medium"
                       >
                           Cerrar
                       </button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default Dashboard;