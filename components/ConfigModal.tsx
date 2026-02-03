import React, { useState } from 'react';
import { X, Save, ShieldCheck, HelpCircle, ExternalLink, AlertTriangle } from 'lucide-react';
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
      // Nettoyage de l'entrée si l'utilisateur colle tout le code JS au lieu du JSON
      let cleanJson = jsonConfig;
      
      // Enlever "const firebaseConfig ="
      if (cleanJson.includes('=')) {
        cleanJson = cleanJson.substring(cleanJson.indexOf('=') + 1).trim();
      }
      // Enlever le point-virgule final
      if (cleanJson.endsWith(';')) {
        cleanJson = cleanJson.slice(0, -1);
      }
      
      // Tentative de correction des clés non citées (ex: apiKey: "..." -> "apiKey": "...")
      cleanJson = cleanJson.replace(/(['"])?([a-zA-Z0-9_]+)(['"])?:/g, '"$2": ');
      
      const config = JSON.parse(cleanJson);
      
      // Validation basique
      if (!config.apiKey || !config.projectId) {
        throw new Error("Configuration incomplète (apiKey ou projectId manquant)");
      }

      onSave(config);
    } catch (e) {
      console.error(e);
      setError("Format invalide. Assurez-vous de coller l'objet JSON qui commence par { et finit par }.");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[60] p-4">
      <div className="bg-mdj-dark border border-white/10 rounded-3xl w-full max-w-2xl shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]">
        
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-mdj-cyan via-mdj-magenta to-mdj-orange"></div>

        <div className="p-6 overflow-y-auto custom-scrollbar">
          <div className="flex justify-between items-start mb-6">
            <div>
                <h2 className="text-2xl font-display font-bold text-white flex items-center gap-2">
                    <ShieldCheck className="w-6 h-6 text-mdj-cyan"/> Configuration Firebase
                </h2>
                <p className="text-sm text-gray-400 mt-1">Synchronisation Cloud & Sécurité</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full text-gray-400 hover:text-white transition-colors">
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <h3 className="font-bold text-white mb-2 flex items-center gap-2"><HelpCircle className="w-4 h-4 text-mdj-cyan"/> Comment obtenir la clé ?</h3>
                  <ol className="list-decimal pl-4 space-y-2 text-gray-300 text-xs">
                      <li>Allez sur la <a href="https://console.firebase.google.com/" target="_blank" rel="noreferrer" className="text-mdj-cyan underline font-bold hover:text-white inline-flex items-center gap-1">Console Firebase <ExternalLink className="w-3 h-3"/></a>.</li>
                      <li>Créez un projet (ex: "Planificateur-MDJ").</li>
                      <li>Dans le menu <strong>Créer</strong>, activez <strong>Authentication</strong> (Fournisseur Google) et <strong>Firestore Database</strong>.</li>
                      <li>Allez dans les paramètres du projet (roue dentée ⚙️).</li>
                      <li>En bas, cliquez sur l'icône Web <strong>&lt;/&gt;</strong> pour créer une app.</li>
                      <li>Copiez le code entre les accolades <code>{`{ ... }`}</code>.</li>
                  </ol>
              </div>

              <div className="bg-mdj-orange/10 rounded-xl p-4 border border-mdj-orange/20">
                   <h3 className="font-bold text-mdj-orange mb-2 flex items-center gap-2"><AlertTriangle className="w-4 h-4"/> Important</h3>
                   <ul className="list-disc pl-4 space-y-2 text-gray-300 text-xs">
                       <li>Dans <strong>Authentication</strong> > <strong>Paramètres</strong> > <strong>Domaines autorisés</strong>, ajoutez l'adresse de ce site web.</li>
                       <li>Sans cela, la connexion Google sera bloquée par sécurité.</li>
                       <li>Dans <strong>Firestore</strong> > <strong>Règles</strong>, assurez-vous que la lecture/écriture est autorisée pour <code>request.auth != null</code>.</li>
                   </ul>
              </div>
          </div>

          <div className="space-y-2">
              <label className="block text-xs font-bold text-mdj-cyan uppercase">Collez votre configuration ici</label>
              <textarea 
                className="w-full h-40 bg-mdj-black border border-white/10 rounded-xl p-4 text-xs font-mono text-white focus:ring-1 focus:ring-mdj-cyan focus:border-mdj-cyan placeholder-gray-600 leading-relaxed"
                placeholder={`{
  "apiKey": "AIzaSyD...",
  "authDomain": "votre-projet.firebaseapp.com",
  "projectId": "votre-projet",
  "storageBucket": "votre-projet.appspot.com",
  "messagingSenderId": "123456789",
  "appId": "1:123456789:web:..."
}`}
                value={jsonConfig}
                onChange={(e) => {
                    setJsonConfig(e.target.value);
                    setError('');
                }}
              />
              {error && <div className="bg-red-500/20 text-red-400 text-xs p-3 rounded-lg border border-red-500/30 flex items-center gap-2"><AlertTriangle className="w-4 h-4"/> {error}</div>}
          </div>

          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-white/10">
            <button onClick={onClose} className="px-4 py-2 rounded-xl text-gray-400 hover:bg-white/5 font-bold transition-all">Annuler</button>
            <button 
              onClick={handleSave}
              className="flex items-center gap-2 px-6 py-2 rounded-xl bg-mdj-cyan text-mdj-black font-bold hover:bg-cyan-400 transition-all shadow-[0_0_15px_rgba(0,255,255,0.3)]"
            >
              <Save className="w-4 h-4" /> Sauvegarder
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfigModal;