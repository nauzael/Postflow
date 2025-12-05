import React from 'react';
import { usePosts } from '../services/storageService';
import { PostStatus } from '../types';
import { Calendar as CalIcon } from 'lucide-react';

const CalendarView: React.FC = () => {
  const posts = usePosts();
  const scheduledPosts = posts
    .filter(p => p.status === PostStatus.Scheduled && p.scheduledDate)
    .sort((a, b) => new Date(a.scheduledDate!).getTime() - new Date(b.scheduledDate!).getTime());

  return (
    <div className="space-y-6 animate-fade-in">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Calendario Editorial</h2>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 transition-colors">
            {scheduledPosts.length === 0 ? (
                <div className="text-center py-12">
                    <div className="bg-indigo-50 dark:bg-indigo-900/30 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                         <CalIcon className="text-indigo-400" size={24} />
                    </div>
                    <p className="text-gray-500 dark:text-gray-400">No hay publicaciones programadas próximamente.</p>
                </div>
            ) : (
                <div className="relative border-l border-gray-200 dark:border-gray-700 ml-3 space-y-8 my-4">
                    {scheduledPosts.map((post) => (
                        <div key={post.id} className="mb-8 ml-6">
                            <span className="absolute flex items-center justify-center w-6 h-6 bg-indigo-100 dark:bg-indigo-900 rounded-full -left-3 ring-8 ring-white dark:ring-gray-800">
                                <CalIcon size={12} className="text-indigo-600 dark:text-indigo-300" />
                            </span>
                            <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex justify-between items-center mb-2">
                                    <time className="text-sm font-medium text-indigo-600 dark:text-indigo-400">
                                        {new Date(post.scheduledDate!).toLocaleString(undefined, { dateStyle: 'long', timeStyle: 'short' })}
                                    </time>
                                    <span className={`text-xs font-bold px-2 py-1 rounded border uppercase tracking-wide
                                        ${post.platform === 'Twitter' ? 'text-sky-600 border-sky-100 dark:text-sky-300 dark:border-sky-800 dark:bg-sky-900/20' : 
                                          post.platform === 'LinkedIn' ? 'text-blue-700 border-blue-100 dark:text-blue-300 dark:border-blue-800 dark:bg-blue-900/20' : 
                                          'text-pink-600 border-pink-100 dark:text-pink-300 dark:border-pink-800 dark:bg-pink-900/20'}`}>
                                        {post.platform}
                                    </span>
                                </div>
                                <p className="text-base text-gray-700 dark:text-gray-300 italic">"{post.content}"</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    </div>
  );
}

export default CalendarView;