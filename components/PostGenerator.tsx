import React, { useState } from 'react';
import { generateSocialPosts } from '../services/geminiService';
import { savePost, getCompanyProfile } from '../services/storageService';
import { GeneratedContent, Platform, PostStatus } from '../types';
import { Send, Calendar, Save, RefreshCw, Wand2, Check } from 'lucide-react';

const PostGenerator: React.FC = () => {
  const [topic, setTopic] = useState('');
  const [loading, setLoading] = useState(false);
  const [generated, setGenerated] = useState<GeneratedContent | null>(null);
  const [selectedPlatform, setSelectedPlatform] = useState<keyof GeneratedContent>('twitter');
  const [editedContent, setEditedContent] = useState('');
  const [scheduledDate, setScheduledDate] = useState('');
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

  const handleGenerate = async () => {
    const profile = getCompanyProfile();
    if (!profile) {
      setMessage({ type: 'error', text: 'Por favor completa el perfil de empresa primero.' });
      return;
    }
    if (!topic.trim()) return;

    setLoading(true);
    setMessage(null);
    try {
      const result = await generateSocialPosts(topic, profile);
      setGenerated(result);
      if (result) {
        setEditedContent(result[selectedPlatform]);
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error generando contenido. Verifica tu API Key o intenta de nuevo.' });
    } finally {
      setLoading(false);
    }
  };

  const handlePlatformChange = (platform: keyof GeneratedContent) => {
    setSelectedPlatform(platform);
    if (generated) {
      setEditedContent(generated[platform]);
    }
  };

  const handleSave = (status: PostStatus) => {
    const profile = getCompanyProfile();
    if (!profile) return;

    let platformEnum = Platform.Twitter;
    if (selectedPlatform === 'linkedin') platformEnum = Platform.LinkedIn;
    if (selectedPlatform === 'instagram') platformEnum = Platform.Instagram;
    if (selectedPlatform === 'facebook') platformEnum = Platform.Facebook;

    savePost({
      userId: profile.userId,
      content: editedContent,
      platform: platformEnum,
      status: status,
      scheduledDate: status === PostStatus.Scheduled ? scheduledDate : undefined,
    });

    setMessage({ 
      type: 'success', 
      text: status === PostStatus.Published 
        ? '¡Post publicado exitosamente!' 
        : status === PostStatus.Scheduled ? 'Post programado en el calendario.' : 'Borrador guardado.' 
    });
    
    // Reset if published/scheduled
    if (status !== PostStatus.Draft) {
      setGenerated(null);
      setTopic('');
      setEditedContent('');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Wand2 className="text-indigo-600" />
          Generador de Contenido IA
        </h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              ¿Sobre qué quieres publicar hoy?
            </label>
            <textarea
              className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all resize-none"
              rows={3}
              placeholder="Ej: Lanzamiento de nuestro nuevo producto SaaS de gestión de tiempo..."
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
            />
          </div>
          
          <button
            onClick={handleGenerate}
            disabled={loading || !topic}
            className={`w-full py-3 px-4 rounded-lg text-white font-medium flex items-center justify-center space-x-2 transition-all ${
              loading || !topic 
                ? 'bg-indigo-300 cursor-not-allowed' 
                : 'bg-indigo-600 hover:bg-indigo-700 shadow-md hover:shadow-lg'
            }`}
          >
            {loading ? (
              <RefreshCw className="animate-spin" />
            ) : (
              <Wand2 size={20} />
            )}
            <span>{loading ? 'Generando magia...' : 'Generar Ideas'}</span>
          </button>
        </div>
      </div>

      {message && (
        <div className={`p-4 rounded-lg ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
          {message.text}
        </div>
      )}

      {generated && (
        <div className="grid md:grid-cols-3 gap-6 animate-fade-in">
          {/* Platform Selection */}
          <div className="md:col-span-1 space-y-2">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Plataformas</h3>
            {(Object.keys(generated) as Array<keyof GeneratedContent>).map((platform) => (
              <button
                key={platform}
                onClick={() => handlePlatformChange(platform)}
                className={`w-full text-left px-4 py-3 rounded-lg capitalize font-medium transition-colors flex items-center justify-between ${
                  selectedPlatform === platform
                    ? 'bg-white border-l-4 border-indigo-600 shadow-sm text-indigo-700'
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                }`}
              >
                <span>{platform}</span>
                {selectedPlatform === platform && <Check size={16} />}
              </button>
            ))}
          </div>

          {/* Editor & Preview */}
          <div className="md:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
              <span className="font-semibold text-gray-700 capitalize">{selectedPlatform} Preview</span>
              <span className="text-xs text-gray-400">{editedContent.length} caracteres</span>
            </div>
            
            <div className="p-4">
              <textarea
                value={editedContent}
                onChange={(e) => setEditedContent(e.target.value)}
                className="w-full h-48 p-3 border-0 focus:ring-0 text-gray-800 bg-transparent resize-none text-lg"
                placeholder="El contenido generado aparecerá aquí..."
              />
            </div>

            <div className="p-4 bg-gray-50 border-t border-gray-100 space-y-4">
              <div className="flex items-center space-x-2">
                <Calendar size={18} className="text-gray-500" />
                <input 
                  type="datetime-local" 
                  className="bg-white border border-gray-300 text-gray-700 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5"
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={() => handleSave(PostStatus.Draft)}
                  className="flex items-center justify-center space-x-2 py-2 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
                >
                  <Save size={18} />
                  <span>Guardar Borrador</span>
                </button>
                {scheduledDate ? (
                   <button 
                   onClick={() => handleSave(PostStatus.Scheduled)}
                   className="flex items-center justify-center space-x-2 py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium shadow-sm"
                 >
                   <Calendar size={18} />
                   <span>Programar</span>
                 </button>
                ) : (
                  <button 
                    onClick={() => handleSave(PostStatus.Published)}
                    className="flex items-center justify-center space-x-2 py-2 px-4 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium shadow-sm"
                  >
                    <Send size={18} />
                    <span>Publicar Ahora</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PostGenerator;