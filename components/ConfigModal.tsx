import React, { useState } from 'react';
import { X, Save, ShieldCheck, HelpCircle, ExternalLink, AlertTriangle, Lock, Copy } from 'lucide-react';
import { FirebaseConfig } from '../services/firebaseService';

interface Props {
  onSave: (config: FirebaseConfig) => void;
  onClose: () => void;
}

const ConfigModal: React.FC<Props> = ({ onSave, onClose }) => {
  const [jsonConfig, setJsonConfig] = useState('');
  const [error, setError] = useState('');
  const currentDomain = window.location.hostname;

  const handleSave = () => {
    try {
      // Nettoyage de l'entrée si l'utilisateur colle tout le code JS au lieu du JSON
      let cleanJson = jsonConfig.trim();
      
      // Enlever "const firebaseConfig =" ou "export const ..."
      if (cleanJson.includes('=')) {
        cleanJson = cleanJson.substring(cleanJson.indexOf('=') + 1).trim();
      }
      // Enlever le point-virgule final
      if (cleanJson.endsWith(';')) {
        cleanJson = cleanJson.slice(0, -1);
      }

      // Si l'objet n'a pas d'accolades, on les ajoute
      if (!cleanJson.startsWith('{') && !cleanJson.endsWith('}')) {
        cleanJson = `{${cleanJson}}`;
      }
      
      // Tentative de correction des clés non citées (ex: apiKey: "..." -> "apiKey": "...")
      // IMPORTANT: On utilise une regex qui cible les clés précédées par { ou , 
      // pour éviter de remplacer des bouts de chaînes comme "1:" dans l'appId.
      cleanJson = cleanJson.replace(/([{,]\s*)([a-zA-Z0-9_]+)(\s*:)/g, '$1"$2"$3');
      
      // Enlever les virgules traînantes (trailing commas) qui brisent JSON.parse
      cleanJson = cleanJson.replace(/,(\s*})/g, '$1');
      
      const config = JSON.parse(cleanJson);
      
      // Validation basique
      if (!config.apiKey || !config.projectId) {
        throw new Error("Configuration incomplète (apiKey ou projectId manquant)");
      }

      onSave(config);
    } catch (e) {
      console.error(e);
      setError("Format invalide. Assurez-vous de copier l'objet complet { ... }.");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[60] p-4">
      <div className="bg-mdj-dark border border-white/10 rounded-3xl w-full max-w-4xl shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]">
        
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-mdj-cyan via-mdj-magenta to-mdj-orange"></div>

        <div className="p-6 overflow-y-auto custom-scrollbar">
          <div className="flex justify-between items-start mb-6">
            <div>
                <h2 className="text-2xl font-display font-bold text-white flex items-center gap-2">
                    <ShieldCheck className="w-6 h-6 text-mdj-cyan"/> Configuration Firebase & Sécurité
                </h2>
                <p className="text-sm text-gray-400 mt-1">Connecter la base de données et sécuriser l'accès pour @mdjescalejeunesse.ca</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full text-gray-400 hover:text-white transition-colors">
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              
              {/* Colonne Gauche : Instructions Configuration */}
              <div className="space-y-4">
                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                    <h3 className="font-bold text-white mb-2 flex items-center gap-2 text-sm"><HelpCircle className="w-4 h-4 text-mdj-cyan"/> 1. Obtenir les clés</h3>
                    <ol className="list-decimal pl-4 space-y-2 text-gray-300 text-xs">
                        <li>Allez sur la <a href="https://console.firebase.google.com/" target="_blank" rel="noreferrer" className="text-mdj-cyan underline font-bold hover:text-white inline-flex items-center gap-1">Console Firebase <ExternalLink className="w-3 h-3"/></a>.</li>
                        <li>Créez un projet (ex: "Planificateur-MDJ").</li>
                        <li>Menu <strong>Création</strong> > <strong>Authentication</strong> > Activer <strong>Google</strong>.</li>
                        <li>Menu <strong>Création</strong> > <strong>Firestore Database</strong> > Créer > Mode Test.</li>
                        <li>Paramètres (⚙️) > Général > Ajouter une application Web (<strong>&lt;/&gt;</strong>).</li>
                        <li>Copiez le contenu de <code>firebaseConfig</code> ci-dessous.</li>
                    </ol>
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-bold text-mdj-cyan uppercase">Collez la configuration ici</label>
                  <textarea 
                    className="w-full h-40 bg-mdj-black border border-white/10 rounded-xl p-4 text-xs font-mono text-white focus:ring-1 focus:ring-mdj-cyan focus:border-mdj-cyan placeholder-gray-600 leading-relaxed"
                    placeholder={`{
  apiKey: "AIzaSyD...",
  authDomain: "votre-projet.firebaseapp.com",
  projectId: "votre-projet",
  storageBucket: "votre-projet.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:..."
}`}
                    value={jsonConfig}
                    onChange={(e) => {
                        setJsonConfig(e.target.value);
                        setError('');
                    }}
                  />
                  {error && <div className="bg-red-500/20 text-red-400 text-xs p-3 rounded-lg border border-red-500/30 flex items-center gap-2"><AlertTriangle className="w-4 h-4"/> {error}</div>}
                </div>
              </div>

              {/* Colonne Droite : Règles de Sécurité & Domaines */}
              <div className="space-y-4">
                  {/* Section Domaines Autorisés avec mise en évidence */}
                  <div className="bg-mdj-orange/10 rounded-xl p-4 border border-mdj-orange/30 relative overflow-hidden group hover:bg-mdj-orange/20 transition-colors">
                     <h3 className="font-bold text-mdj-orange mb-2 flex items-center gap-2 text-sm relative z-10">
                       <AlertTriangle className="w-4 h-4"/> 2. Domaines Autorisés
                     </h3>
                     <p className="text-xs text-gray-300 mb-3 relative z-10 leading-relaxed">
                         Si vous avez l'erreur <span className="font-mono text-red-400 bg-red-500/10 px-1 rounded border border-red-500/20 whitespace-nowrap">auth/unauthorized-domain</span>, vous <strong>devez</strong> ajouter ce domaine dans la console Firebase :
                     </p>
                     
                     <div className="flex items-center gap-2 bg-black/50 p-3 rounded border border-white/10 text-white mb-3 relative z-10">
                         <code className="text-xs font-mono flex-1 truncate">{currentDomain}</code>
                         <button onClick={() => navigator.clipboard.writeText(currentDomain)} className="text-mdj-cyan hover:text-white p-1" title="Copier">
                             <Copy className="w-4 h-4" />
                         </button>
                     </div>

                     <ul className="list-disc pl-4 space-y-1 text-gray-400 text-[10px] relative z-10">
                         <li>Menu <strong>Authentication</strong> &rarr; Onglet <strong>Settings</strong></li>
                         <li>Menu <strong>Authorized Domains</strong> &rarr; Bouton <strong>Add Domain</strong></li>
                     </ul>
                  </div>

                  <div className="bg-green-500/5 rounded-xl p-4 border border-green-500/20">
                      <h3 className="font-bold text-green-400 mb-2 flex items-center gap-2 text-sm"><Lock className="w-4 h-4"/> 3. Sécuriser les données (Règles Firestore)</h3>
                      <p className="text-xs text-gray-300 mb-2">
                          Copiez ce code dans l'onglet <strong>Firestore Database</strong> > <strong>Règles</strong> pour restreindre l'accès :
                      </p>
                      <div className="relative group">
                          <pre className="bg-mdj-black p-3 rounded-lg border border-white/10 text-[10px] text-green-300 font-mono overflow-x-auto whitespace-pre-wrap">
{`rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      // Autoriser lecture/écriture UNIQUEMENT si connecté
      // ET si l'email appartient au domaine de l'organisation
      allow read, write: if request.auth != null && 
        request.auth.token.email.matches('.*@mdjescalejeunesse[.]ca');
    }
  }
}`}
                          </pre>
                      </div>
                  </div>
              </div>
          </div>

          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-white/10">
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