import React from 'react';
import { usePosts } from '../services/storageService';
import { PostStatus } from '../types';
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

interface AnalyticsProps {
  isDarkMode?: boolean;
}

const Analytics: React.FC<AnalyticsProps> = ({ isDarkMode = false }) => {
    const posts = usePosts().filter(p => p.status === PostStatus.Published && p.analytics);
    
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
    const CHART_TEXT_COLOR = isDarkMode ? '#9CA3AF' : '#4B5563'; // gray-400 vs gray-600
    const TOOLTIP_STYLE = { 
      borderRadius: '8px', 
      border: isDarkMode ? '1px solid #374151' : 'none', 
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      backgroundColor: isDarkMode ? '#1F2937' : '#FFFFFF',
      color: isDarkMode ? '#F3F4F6' : '#111827'
    };

    if (posts.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-64 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 transition-colors">
          <p className="text-gray-500 dark:text-gray-400">No hay datos suficientes. Publica algunos posts para ver las estadísticas.</p>
        </div>
      );
    }

    return (
        <div className="space-y-6 animate-fade-in">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Estadísticas de Impacto</h2>
            
            <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 transition-colors">
                    <h3 className="text-lg font-semibold mb-4 text-gray-700 dark:text-gray-200">Impresiones por Post</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDarkMode ? "#374151" : "#e5e7eb"} />
                                <XAxis dataKey="name" hide />
                                <YAxis tick={{ fill: CHART_TEXT_COLOR }} />
                                <Tooltip 
                                  contentStyle={TOOLTIP_STYLE}
                                  itemStyle={{ color: isDarkMode ? '#E5E7EB' : '#374151' }}
                                />
                                <Bar dataKey="impact" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 transition-colors">
                    <h3 className="text-lg font-semibold mb-4 text-gray-700 dark:text-gray-200">Distribución por Plataforma</h3>
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
                                <Tooltip contentStyle={TOOLTIP_STYLE} itemStyle={{ color: isDarkMode ? '#E5E7EB' : '#374151' }} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="flex justify-center gap-4 mt-2 flex-wrap">
                        {platformData.map((entry, index) => (
                            <div key={entry.name} className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                                <span className="w-2 h-2 rounded-full mr-1" style={{backgroundColor: COLORS[index % COLORS.length]}}></span>
                                {entry.name}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

             <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden transition-colors">
                <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700">
                    <h3 className="font-semibold text-gray-700 dark:text-gray-200">Detalle de Rendimiento</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                        <thead className="text-xs text-gray-700 dark:text-gray-300 uppercase bg-gray-50 dark:bg-gray-750">
                            <tr>
                                <th className="px-6 py-3">Plataforma</th>
                                <th className="px-6 py-3">Impresiones</th>
                                <th className="px-6 py-3">Likes</th>
                                <th className="px-6 py-3">Engagement</th>
                            </tr>
                        </thead>
                        <tbody>
                            {posts.map(post => (
                                <tr key={post.id} className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{post.platform}</td>
                                    <td className="px-6 py-4">{post.analytics?.impressions}</td>
                                    <td className="px-6 py-4">{post.analytics?.likes}</td>
                                    <td className="px-6 py-4 text-green-600 dark:text-green-400 font-bold">{post.analytics?.engagementRate}%</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
             </div>
        </div>
    );
};

export default Analytics;