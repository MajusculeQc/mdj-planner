import React, { useState } from 'react';
import { X, Save, ShieldCheck, HelpCircle } from 'lucide-react';
import { FirebaseConfig } from '../services/firebaseService';

interface Props {
  onSave: (config: FirebaseConfig) => void;
  onClose: () => void;
}

const ConfigModal: React.FC<Props> = ({ onSave, onClose }) => {
  const [jsonConfig, setJsonConfig] = useState('');
  const [error, setError] = useState('');

  const handleSave = () => {
    try {
      // Try to clean up input if user pasted "const firebaseConfig = { ... }"
      let cleanJson = jsonConfig;
      if (cleanJson.includes('=')) {
        cleanJson = cleanJson.substring(cleanJson.indexOf('=') + 1).trim();
      }
      if (cleanJson.endsWith(';')) {
        cleanJson = cleanJson.slice(0, -1);
      }
      
      // Fix unquoted keys if necessary (simple regex attempt, not perfect but helps)
      cleanJson = cleanJson.replace(/(['"])?([a-zA-Z0-9_]+)(['"])?:/g, '"$2": ');
      
      const config = JSON.parse(cleanJson);
      
      // Basic validation
      if (!config.apiKey || !config.projectId) {
        throw new Error("Configuration incomplète (apiKey ou projectId manquant)");
      }

      onSave(config);
    } catch (e) {
      setError("Format invalide. Assurez-vous de coller l'objet JSON (entre accolades {}).");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[60] p-4">
      <div className="bg-mdj-dark border border-white/10 rounded-3xl w-full max-w-lg shadow-2xl relative overflow-hidden">
        
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-mdj-cyan via-mdj-magenta to-mdj-orange"></div>

        <div className="p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
                <h2 className="text-2xl font-display font-bold text-white flex items-center gap-2">
                    <ShieldCheck className="w-6 h-6 text-mdj-cyan"/> Configuration Firebase
                </h2>
                <p className="text-sm text-gray-400 mt-1">Connexion à votre base de données</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full text-gray-400 hover:text-white transition-colors">
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="bg-white/5 rounded-xl p-4 mb-6 border border-white/10">
              <div className="flex items-start gap-3">
                  <HelpCircle className="w-5 h-5 text-mdj-cyan shrink-0 mt-0.5" />
                  <div className="text-sm text-gray-300 space-y-2">
                      <p>Pour synchroniser vos données en ligne, collez ici votre configuration Firebase.</p>
                      <ol className="list-decimal pl-4 space-y-1 text-gray-400 text-xs">
                          <li>Allez sur la console Firebase > Project Settings</li>
                          <li>Descendez à "Your apps"</li>
                          <li>Copiez le bloc <code>firebaseConfig</code></li>
                      </ol>
                  </div>
              </div>
          </div>

          <div className="space-y-4">
              <div>
                  <label className="block text-xs font-bold text-mdj-cyan uppercase mb-2">Objet de configuration (JSON)</label>
                  <textarea 
                    className="w-full h-48 bg-mdj-black border border-white/10 rounded-xl p-3 text-xs font-mono text-white focus:ring-1 focus:ring-mdj-cyan focus:border-mdj-cyan placeholder-gray-600"
                    placeholder={`{
  "apiKey": "...",
  "authDomain": "...",
  "projectId": "...",
  ...
}`}
                    value={jsonConfig}
                    onChange={(e) => {
                        setJsonConfig(e.target.value);
                        setError('');
                    }}
                  />
                  {error && <p className="text-red-500 text-xs mt-2 font-bold">{error}</p>}
              </div>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button onClick={onClose} className="px-4 py-2 rounded-xl text-gray-400 hover:bg-white/5 font-bold transition-all">Annuler</button>
            <button 
              onClick={handleSave}
              className="flex items-center gap-2 px-6 py-2 rounded-xl bg-mdj-cyan text-mdj-black font-bold hover:bg-cyan-400 transition-all shadow-[0_0_15px_rgba(0,255,255,0.3)]"
            >
              <Save className="w-4 h-4" /> Sauvegarder & Connecter
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfigModal;