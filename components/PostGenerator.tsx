import React, { useState, useRef } from 'react';
import { generateSocialPosts, generateAIImage } from '../services/geminiService';
import { savePost, getCompanyProfile } from '../services/storageService';
import { GeneratedContent, Platform, PostStatus } from '../types';
import { 
  Send, 
  Calendar, 
  Save, 
  RefreshCw, 
  Wand2, 
  Image as ImageIcon, 
  Upload, 
  X,
  CheckCircle2,
  AlertCircle,
  Linkedin,
  Twitter,
  Instagram,
  Facebook
} from 'lucide-react';

type ImageSource = 'none' | 'local' | 'ai';

const PostGenerator: React.FC = () => {
  // Config State
  const [topic, setTopic] = useState('');
  const [selectedPlatforms, setSelectedPlatforms] = useState<Platform[]>([Platform.Twitter, Platform.LinkedIn]);
  const [imageSource, setImageSource] = useState<ImageSource>('none');
  const [localImage, setLocalImage] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [imageStyle, setImageStyle] = useState('Fotorealista');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Process State
  const [loading, setLoading] = useState(false);
  const [generatingImage, setGeneratingImage] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null);
  
  // Editor State
  const [activeTab, setActiveTab] = useState<Platform | null>(null);
  const [editedContent, setEditedContent] = useState<Record<string, string>>({});
  const [scheduledDate, setScheduledDate] = useState('');
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

  const PLATFORMS_CONFIG = [
    { id: Platform.Twitter, icon: Twitter, color: 'text-sky-500', limit: 280 },
    { id: Platform.LinkedIn, icon: Linkedin, color: 'text-blue-700', limit: 3000 },
    { id: Platform.Instagram, icon: Instagram, color: 'text-pink-600', limit: 2200 },
    { id: Platform.Facebook, icon: Facebook, color: 'text-blue-600', limit: 63206 },
  ];

  const togglePlatform = (platform: Platform) => {
    if (selectedPlatforms.includes(platform)) {
      setSelectedPlatforms(prev => prev.filter(p => p !== platform));
    } else {
      setSelectedPlatforms(prev => [...prev, platform]);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLocalImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    const profile = getCompanyProfile();
    if (!profile) {
      setMessage({ type: 'error', text: 'Configura tu perfil de empresa primero.' });
      return;
    }
    if (!topic.trim()) return;
    if (selectedPlatforms.length === 0) {
      setMessage({ type: 'error', text: 'Selecciona al menos una red social.' });
      return;
    }

    setLoading(true);
    setMessage(null);
    setGeneratedContent(null);
    setEditedContent({});

    try {
      // 1. Generate Text
      const textResult = await generateSocialPosts(topic, profile, selectedPlatforms);
      
      if (textResult) {
        setGeneratedContent(textResult);
        // Initialize edited content with generated result
        const initialEdits: Record<string, string> = {};
        selectedPlatforms.forEach(p => {
          const key = p.toLowerCase() as keyof GeneratedContent;
          if (textResult[key]) initialEdits[p] = textResult[key];
        });
        setEditedContent(initialEdits);
        setActiveTab(selectedPlatforms[0]);
      }

      // 2. Generate Image if selected
      if (imageSource === 'ai') {
        setGeneratingImage(true);
        // Combine topic + style for prompt
        const imgPrompt = `${topic}. Estilo: ${imageStyle}`;
        const imgResult = await generateAIImage(imgPrompt, imageStyle);
        if (imgResult) {
            setGeneratedImage(imgResult);
        }
        setGeneratingImage(false);
      }

    } catch (error) {
      console.error(error);
      setMessage({ type: 'error', text: 'Error en la generación. Intenta de nuevo.' });
    } finally {
      setLoading(false);
      setGeneratingImage(false);
    }
  };

  const handleSave = (status: PostStatus) => {
    const profile = getCompanyProfile();
    if (!profile || !activeTab) return;

    const content = editedContent[activeTab];
    const finalImage = imageSource === 'local' ? localImage : imageSource === 'ai' ? generatedImage : undefined;

    savePost({
      userId: profile.userId,
      content: content,
      platform: activeTab,
      status: status,
      scheduledDate: status === PostStatus.Scheduled ? scheduledDate : undefined,
      mediaUrl: finalImage || undefined
    });

    setMessage({ 
      type: 'success', 
      text: status === PostStatus.Published ? 'Publicado correctamente' : 'Guardado correctamente' 
    });
    
    // Optional: Clear saved item from list or mark as done visualy (not implemented for simplicity)
  };

  const getCharCountColor = (current: number, max: number) => {
    const ratio = current / max;
    if (ratio > 1) return 'text-red-600 font-bold';
    if (ratio > 0.9) return 'text-orange-500';
    return 'text-gray-400';
  };

  return (
    <div className="max-w-5xl mx-auto pb-12 space-y-8 animate-fade-in">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="text-3xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
          <div className="bg-indigo-600 p-2 rounded-lg">
             <Wand2 className="text-white" size={24} />
          </div>
          Generador Inteligente
        </h2>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN: CONFIGURATION */}
        <div className="lg:col-span-1 space-y-6">
            
            {/* Topic Input */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-5 transition-colors">
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                    Tema o Idea Principal
                </label>
                <textarea
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none resize-none transition-all placeholder-gray-400"
                    rows={4}
                    placeholder="Ej: Lanzamiento de nueva colección de verano con 20% de descuento..."
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                />
            </div>

            {/* Platform Selector */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-5 transition-colors">
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">
                    Canales de Destino
                </label>
                <div className="grid grid-cols-2 gap-3">
                    {PLATFORMS_CONFIG.map((p) => {
                        const Icon = p.icon;
                        const isSelected = selectedPlatforms.includes(p.id);
                        return (
                            <button
                                key={p.id}
                                onClick={() => togglePlatform(p.id)}
                                className={`flex items-center space-x-2 p-3 rounded-lg border transition-all ${
                                    isSelected 
                                    ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300' 
                                    : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 text-gray-600 dark:text-gray-400'
                                }`}
                            >
                                <Icon size={18} className={isSelected ? 'text-indigo-600 dark:text-indigo-400' : ''} />
                                <span className="text-sm font-medium">{p.id}</span>
                            </button>
                        )
                    })}
                </div>
            </div>

            {/* Media Selector */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-5 transition-colors">
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">
                    Multimedia
                </label>
                
                <div className="flex bg-gray-100 dark:bg-gray-700 p-1 rounded-lg mb-4">
                    {(['none', 'local', 'ai'] as ImageSource[]).map((type) => (
                         <button
                            key={type}
                            onClick={() => setImageSource(type)}
                            className={`flex-1 py-1.5 text-xs font-medium rounded-md capitalize transition-all ${
                                imageSource === type 
                                ? 'bg-white dark:bg-gray-600 text-indigo-600 dark:text-white shadow-sm' 
                                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                            }`}
                         >
                            {type === 'none' ? 'Sin Imagen' : type === 'local' ? 'Subir' : 'Generar IA'}
                         </button>
                    ))}
                </div>

                {imageSource === 'local' && (
                    <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                        <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
                        {localImage ? (
                            <div className="relative group">
                                <img src={localImage} alt="Preview" className="w-full h-32 object-cover rounded-lg" />
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-lg">
                                    <span className="text-white text-xs">Cambiar</span>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                <Upload className="mx-auto text-gray-400" size={24} />
                                <p className="text-xs text-gray-500 dark:text-gray-400">Click para subir (JPG, PNG)</p>
                            </div>
                        )}
                    </div>
                )}

                {imageSource === 'ai' && (
                    <div className="space-y-3">
                        <div>
                             <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Estilo Visual</label>
                             <select 
                                value={imageStyle}
                                onChange={(e) => setImageStyle(e.target.value)}
                                className="w-full p-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                             >
                                <option>Fotorealista</option>
                                <option>Ilustración 3D</option>
                                <option>Minimalista</option>
                                <option>Cyberpunk</option>
                                <option>Pop Art</option>
                             </select>
                        </div>
                        {generatedImage && (
                             <img src={generatedImage} alt="AI Generated" className="w-full h-32 object-cover rounded-lg shadow-sm border border-gray-200 dark:border-gray-600" />
                        )}
                    </div>
                )}
            </div>

            <button
                onClick={handleGenerate}
                disabled={loading || !topic}
                className={`w-full py-4 px-4 rounded-xl text-white font-bold text-lg flex items-center justify-center space-x-2 transition-all transform active:scale-95 ${
                loading || !topic 
                    ? 'bg-indigo-300 dark:bg-indigo-900/50 cursor-not-allowed' 
                    : 'bg-indigo-600 hover:bg-indigo-700 shadow-lg hover:shadow-indigo-500/30'
                }`}
            >
                {loading ? <RefreshCw className="animate-spin" /> : <Wand2 />}
                <span>{loading ? 'Trabajando...' : 'Generar Campaña'}</span>
            </button>

            {message && (
                <div className={`p-3 rounded-lg text-sm flex items-start gap-2 ${
                message.type === 'success' 
                    ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-300' 
                    : 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300'
                }`}>
                    {message.type === 'success' ? <CheckCircle2 size={16} className="mt-0.5" /> : <AlertCircle size={16} className="mt-0.5" />}
                    {message.text}
                </div>
            )}
        </div>

        {/* RIGHT COLUMN: PREVIEW & EDITOR */}
        <div className="lg:col-span-2">
            {!generatedContent && !loading ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-12 bg-gray-50 dark:bg-gray-800/50 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700 text-gray-400 dark:text-gray-500">
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-full shadow-sm mb-4">
                        <Wand2 size={32} className="text-indigo-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-600 dark:text-gray-300">Listo para crear</h3>
                    <p className="max-w-xs mx-auto mt-2 text-sm">Configura tu campaña a la izquierda y presiona Generar para ver la magia.</p>
                </div>
            ) : (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden flex flex-col h-full transition-colors">
                    
                    {/* Tabs */}
                    <div className="flex border-b border-gray-100 dark:border-gray-700 overflow-x-auto no-scrollbar">
                        {selectedPlatforms.map(p => {
                             const config = PLATFORMS_CONFIG.find(c => c.id === p);
                             const Icon = config?.icon || AlertCircle;
                             return (
                                <button
                                    key={p}
                                    onClick={() => setActiveTab(p)}
                                    className={`flex items-center space-x-2 px-6 py-4 font-medium whitespace-nowrap transition-colors border-b-2 ${
                                        activeTab === p 
                                        ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-900/20' 
                                        : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                                    }`}
                                >
                                    <Icon size={18} />
                                    <span>{p}</span>
                                </button>
                             )
                        })}
                    </div>

                    {/* Editor Area */}
                    {activeTab && (
                        <div className="flex-1 p-6 space-y-6">
                            
                            {/* Text Editor */}
                            <div className="space-y-2">
                                <div className="flex justify-between items-center text-sm">
                                    <label className="font-medium text-gray-700 dark:text-gray-300">Contenido del Post</label>
                                    <span className={`text-xs ${
                                        getCharCountColor(editedContent[activeTab]?.length || 0, PLATFORMS_CONFIG.find(c => c.id === activeTab)?.limit || 1000)
                                    }`}>
                                        {editedContent[activeTab]?.length || 0} / {PLATFORMS_CONFIG.find(c => c.id === activeTab)?.limit}
                                    </span>
                                </div>
                                <textarea
                                    value={editedContent[activeTab] || ''}
                                    onChange={(e) => setEditedContent(prev => ({...prev, [activeTab]: e.target.value}))}
                                    className="w-full h-48 p-4 text-base border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white resize-none transition-colors"
                                    placeholder="El contenido generado aparecerá aquí..."
                                />
                            </div>

                            {/* Image Preview in Editor */}
                            {(imageSource !== 'none' || generatingImage) && (
                                <div className="border border-gray-200 dark:border-gray-600 rounded-xl p-4 bg-gray-50 dark:bg-gray-700/30">
                                    <label className="font-medium text-gray-700 dark:text-gray-300 text-sm mb-3 block">Multimedia Adjunta</label>
                                    
                                    {generatingImage ? (
                                        <div className="flex items-center justify-center h-48 bg-gray-100 dark:bg-gray-700 rounded-lg animate-pulse">
                                            <div className="text-center">
                                                <ImageIcon className="mx-auto text-gray-400 mb-2" size={32} />
                                                <p className="text-sm text-gray-500">Creando imagen con IA...</p>
                                            </div>
                                        </div>
                                    ) : (imageSource === 'local' && localImage) || (imageSource === 'ai' && generatedImage) ? (
                                        <div className="relative aspect-video rounded-lg overflow-hidden shadow-sm">
                                            <img 
                                                src={imageSource === 'local' ? localImage! : generatedImage!} 
                                                alt="Post attachment" 
                                                className="w-full h-full object-cover"
                                            />
                                            <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded backdrop-blur-sm">
                                                {imageSource === 'ai' ? 'Generada por IA' : 'Imagen Local'}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="h-24 flex items-center justify-center border border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-400 text-sm">
                                            No hay imagen seleccionada
                                        </div>
                                    )}
                                </div>
                            )}
                            
                            {/* Scheduling & Actions */}
                            <div className="border-t border-gray-100 dark:border-gray-700 pt-6">
                                <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                                    <div className="w-full sm:w-auto flex items-center bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2">
                                        <Calendar size={18} className="text-gray-500 dark:text-gray-400 mr-2" />
                                        <input 
                                            type="datetime-local"
                                            className="bg-transparent text-sm text-gray-700 dark:text-white outline-none"
                                            value={scheduledDate}
                                            onChange={(e) => setScheduledDate(e.target.value)}
                                        />
                                    </div>

                                    <div className="flex gap-3 w-full sm:w-auto">
                                        <button 
                                            onClick={() => handleSave(PostStatus.Draft)}
                                            className="flex-1 sm:flex-none flex items-center justify-center space-x-2 py-2.5 px-5 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 font-medium transition-colors"
                                        >
                                            <Save size={18} />
                                            <span>Borrador</span>
                                        </button>
                                        
                                        {scheduledDate ? (
                                            <button 
                                                onClick={() => handleSave(PostStatus.Scheduled)}
                                                className="flex-1 sm:flex-none flex items-center justify-center space-x-2 py-2.5 px-5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium shadow-sm transition-colors"
                                            >
                                                <Calendar size={18} />
                                                <span>Programar</span>
                                            </button>
                                        ) : (
                                            <button 
                                                onClick={() => handleSave(PostStatus.Published)}
                                                className="flex-1 sm:flex-none flex items-center justify-center space-x-2 py-2.5 px-5 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium shadow-sm transition-colors"
                                            >
                                                <Send size={18} />
                                                <span>Publicar</span>
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>

                        </div>
                    )}
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default PostGenerator;