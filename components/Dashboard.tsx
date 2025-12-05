import React from 'react';
import { usePosts, deletePost } from '../services/storageService';
import { PostStatus } from '../types';
import { Trash2, CheckCircle, Clock, FileText } from 'lucide-react';

const Dashboard: React.FC = () => {
  const posts = usePosts();

  const handleDelete = (id: string) => {
    if(confirm('¿Borrar este post?')) {
        deletePost(id);
    }
  }

  const StatusBadge = ({ status }: { status: PostStatus }) => {
    const styles = {
      [PostStatus.Published]: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      [PostStatus.Scheduled]: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
      [PostStatus.Draft]: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
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
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Publicaciones Recientes</h2>
      </div>

      {posts.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm transition-colors">
          <p className="text-gray-500 dark:text-gray-400">No hay publicaciones aún. Ve al Generador IA para comenzar.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <div key={post.id} className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md dark:hover:border-gray-600 transition-all flex flex-col justify-between h-full">
              <div>
                <div className="flex justify-between items-start mb-3">
                  <span className={`px-2 py-1 rounded text-xs font-bold uppercase 
                    ${post.platform === 'Twitter' ? 'bg-sky-100 text-sky-700 dark:bg-sky-900 dark:text-sky-200' : 
                      post.platform === 'LinkedIn' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' : 
                      'bg-pink-100 text-pink-700 dark:bg-pink-900 dark:text-pink-200'}`}>
                    {post.platform}
                  </span>
                  <StatusBadge status={post.status} />
                </div>
                <p className="text-gray-700 dark:text-gray-300 text-sm line-clamp-4 mb-4">{post.content}</p>
              </div>
              
              <div className="border-t border-gray-100 dark:border-gray-700 pt-3 flex justify-between items-center text-xs text-gray-500 dark:text-gray-400">
                <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                <button 
                  onClick={() => handleDelete(post.id)} 
                  className="text-gray-400 hover:text-red-500 dark:hover:text-red-400 p-1 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  aria-label="Delete post"
                >
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

export default Dashboard;