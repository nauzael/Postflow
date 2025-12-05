import React, { useState, useEffect } from 'react';
import { CompanyProfile } from '../types';
import { getCompanyProfile, getCurrentUser, saveCompanyProfile } from '../services/storageService';

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
    <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700 animate-fade-in transition-colors">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Perfil de Empresa</h2>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nombre de la Empresa</label>
          <input 
            type="text" 
            value={profile.name} 
            onChange={e => setProfile({...profile, name: e.target.value})}
            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all placeholder-gray-400 dark:placeholder-gray-500"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Industria</label>
            <input 
              type="text" 
              value={profile.industry} 
              onChange={e => setProfile({...profile, industry: e.target.value})}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all placeholder-gray-400 dark:placeholder-gray-500"
              placeholder="Ej. Tecnología, Moda..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tono de Voz</label>
            <select 
              value={profile.tone}
              onChange={e => setProfile({...profile, tone: e.target.value})}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
            >
              <option value="">Selecciona...</option>
              <option value="Profesional">Profesional</option>
              <option value="Amigable">Amigable</option>
              <option value="Humorístico">Humorístico</option>
              <option value="Inspirador">Inspirador</option>
              <option value="Autoritario">Autoritario</option>
            </select>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Descripción corta</label>
          <textarea 
            value={profile.description} 
            onChange={e => setProfile({...profile, description: e.target.value})}
            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all placeholder-gray-400 dark:placeholder-gray-500"
            rows={4}
            placeholder="Describe qué hace tu empresa y cuál es su misión..."
          />
        </div>
        <button 
          onClick={handleSave}
          className={`w-full py-3 rounded-lg font-medium text-white transition-all transform active:scale-95 ${
            saved ? 'bg-green-600 hover:bg-green-700' : 'bg-indigo-600 hover:bg-indigo-700'
          }`}
        >
          {saved ? '¡Guardado Exitosamente!' : 'Guardar Perfil'}
        </button>
      </div>
    </div>
  );
};

export default CompanySettings;