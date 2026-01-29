import React, { useState, useEffect } from 'react';
import { Activity, ActivityType, Material } from '../types';
import { X, Wand2, CheckSquare, MapPin, Truck, ShieldAlert, DollarSign, Users, Save, CheckCircle, Circle, LayoutDashboard, BrainCircuit, Hand, Clock, Timer, Phone, Link as LinkIcon, FileText, Gavel } from 'lucide-react';

interface Props {
  activity: Activity;
  onClose: () => void;
  onSave: (updated: Activity) => void;
}

const STAFF_LIST = ["Sébastien Johnson", "Laurie Bray Pratte", "Charles Frenette", "Mikael Delage", "Patrick Delage", "Ann-Sushi (Stagiaire)"];

const ActivityModal: React.FC<Props> = ({ activity: initialActivity, onClose, onSave }) => {
  const [activity, setActivity] = useState<Activity>(initialActivity);
  const [activeTab, setActiveTab] = useState<'checklist' | 'pedagogy' | 'logistics' | 'materials' | 'risk' | 'staff' | 'budget'>('checklist');

  // Calculate score dynamically based on RMJQ standards
  const calculateReadiness = () => {
    let score = 0;
    let totalChecks = 0;
    const checks: { label: string; met: boolean; tab: string }[] = [];

    const addCheck = (label: string, condition: boolean, tab: any) => {
      totalChecks++;
      if (condition) score++;
      checks.push({ label, met: condition, tab });
    };

    // RMJQ Core: Sens & Pédagogie
    addCheck("Objectifs (Critique/Actif/Responsable)", activity.objectives.length > 0, 'pedagogy');
    addCheck("Implication des jeunes définie", activity.youthInvolvement?.tasks?.length > 0, 'pedagogy');
    addCheck("Critères d'évaluation définis", activity.evaluationCriteria?.length > 0, 'pedagogy');

    // Logistics & Safety
    addCheck("Horaires définis", !!activity.startTime && !!activity.endTime, 'logistics');
    addCheck("Lieu et transport validés", !!activity.logistics.venueName && (!activity.logistics.transportRequired || !!activity.logistics.transportMode), 'logistics');
    addCheck("Heures transport définies", !activity.logistics.transportRequired || (!!activity.logistics.departureTime && !!activity.logistics.returnTime), 'logistics');
    addCheck("Matériel listé", activity.materials.length > 0, 'materials'); 
    
    // Staffing & Relations
    addCheck("Adultes significatifs désignés", !!activity.staffing.leadStaff, 'staff');
    addCheck("Ratio d'encadrement respecté", !!activity.staffing.requiredRatio, 'staff');

    // Risk
    addCheck("Risques & Code de vie", activity.riskManagement.safetyProtocols.length > 0, 'risk');
    addCheck("Contact d'urgence", !!activity.riskManagement.emergencyContact, 'risk');
    // Check for compliance if rules exist
    if (activity.riskManagement.complianceRequirements && activity.riskManagement.complianceRequirements.length > 0) {
        addCheck("Obligations administratives validées", true, 'risk');
    }

    return {
      percentage: totalChecks === 0 ? 0 : Math.round((score / totalChecks) * 100),
      checks
    };
  };

  const readiness = calculateReadiness();

  useEffect(() => {
    setActivity(prev => ({ ...prev, preparationScore: readiness.percentage }));
  }, [JSON.stringify(activity)]);

  // --- UI HELPERS ---
  const inputClass = "w-full bg-mdj-black border border-white/10 rounded-lg p-2 text-white focus:ring-1 focus:ring-mdj-cyan focus:border-mdj-cyan placeholder-gray-600 transition-all";
  const labelClass = "text-xs font-bold text-mdj-cyan uppercase tracking-wider mb-1 block";

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-mdj-dark border border-white/10 rounded-3xl w-full max-w-6xl max-h-[95vh] shadow-[0_0_50px_rgba(0,0,0,0.5)] flex flex-col relative overflow-hidden">
        
        {/* Glow effect */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-mdj-cyan via-mdj-magenta to-mdj-orange"></div>

        {/* Header */}
        <div className="p-6 border-b border-white/10 flex justify-between items-start bg-mdj-dark">
          <div className="flex-1 mr-6">
            <div className="flex items-center gap-4 mb-2 w-full">
               <input 
                 className="text-3xl font-display font-bold text-white bg-transparent border-b border-transparent hover:border-white/20 focus:border-mdj-cyan focus:ring-0 px-0 w-full leading-tight placeholder-gray-600 transition-colors"
                 value={activity.title}
                 onChange={(e) => setActivity({...activity, title: e.target.value})}
                 placeholder="Titre de l'activité"
               />
               
               <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border shrink-0 ${readiness.percentage >= 80 ? 'bg-mdj-cyan/10 text-mdj-cyan border-mdj-cyan/50' : 'bg-mdj-orange/10 text-mdj-orange border-mdj-orange/50'}`}>
                 {readiness.percentage}% Prêt
               </span>
            </div>
            <div className="flex flex-wrap gap-4 text-sm text-gray-400 items-center">
              <div className="flex items-center gap-1 group">
                <CheckSquare className="w-4 h-4 text-mdj-cyan group-hover:text-white transition-colors"/>
                <select 
                  className="bg-transparent border-none text-gray-400 hover:text-white focus:ring-0 p-0 text-sm cursor-pointer transition-colors max-w-[200px] truncate"
                  value={activity.type}
                  onChange={(e) => setActivity({...activity, type: e.target.value as ActivityType})}
                >
                  {Object.values(ActivityType).map(t => (
                    <option key={t} value={t} className="bg-mdj-dark text-white">{t}</option>
                  ))}
                </select>
              </div>
              
              <span className="text-white/20">•</span>
              
              <div className="flex items-center hover:text-white transition-colors">
                <input 
                  type="date"
                  className="bg-transparent border-none text-gray-400 hover:text-white focus:ring-0 p-0 text-sm font-sans cursor-pointer uppercase tracking-wide"
                  value={activity.date}
                  onChange={(e) => setActivity({...activity, date: e.target.value})}
                />
              </div>

              <span className="text-white/20">•</span>
              
              <span className="flex items-center gap-1 font-bold text-white bg-white/5 px-2 py-0.5 rounded border border-white/10">
                <Clock className="w-3 h-3 text-mdj-magenta"/> {activity.startTime} - {activity.endTime}
              </span>
            </div>
          </div>
          <div className="flex gap-3 shrink-0">
            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full text-gray-400 hover:text-white transition-colors">
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar / Tabs */}
          <div className="w-64 bg-mdj-black/50 border-r border-white/10 flex flex-col overflow-y-auto shrink-0">
             <nav className="p-4 space-y-1">
               {[
                { id: 'checklist', label: 'Contrôle & Qualité', icon: LayoutDashboard },
                { id: 'pedagogy', label: 'Par et Pour les Jeunes', icon: Hand },
                { id: 'logistics', label: 'Logistique & Transport', icon: MapPin },
                { id: 'materials', label: 'Matériel', icon: Truck },
                { id: 'risk', label: 'Conformité & Risques', icon: ShieldAlert },
                { id: 'staff', label: 'Équipe & Adultes', icon: Users },
                { id: 'budget', label: 'Budget', icon: DollarSign },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all border border-transparent ${
                    activeTab === tab.id 
                      ? 'bg-mdj-cyan/10 text-mdj-cyan border-mdj-cyan/20 shadow-[0_0_10px_rgba(0,255,255,0.1)]' 
                      : 'text-gray-400 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? 'text-mdj-cyan' : 'text-gray-500'}`} />
                  {tab.label}
                </button>
              ))}
             </nav>
             
             {/* RMJQ Reminder */}
             <div className="mt-auto p-6 bg-gradient-to-t from-mdj-cyan/10 to-transparent border-t border-white/5">
               <h4 className="text-xs font-bold text-mdj-cyan uppercase mb-2">Mission La Piaule</h4>
               <p className="text-xs text-gray-400 leading-relaxed font-light">
                 Un milieu de vie animé, une zone safe pour devenir <strong className="text-white">Critique, Actif et Responsable</strong>.
               </p>
             </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 overflow-y-auto bg-mdj-dark p-8 custom-scrollbar">
            
            {activeTab === 'checklist' && (
              <div className="space-y-8 max-w-4xl mx-auto animate-in fade-in duration-300">
                <div className="flex justify-between items-center">
                  <h3 className="font-display font-bold text-white text-xl">Liste de vérification RMJQ</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                   <div className="col-span-2 bg-mdj-black/30 p-6 rounded-2xl border border-white/10 shadow-lg">
                      <div className="grid grid-cols-1 gap-3">
                        {readiness.checks.map((check, idx) => (
                          <button 
                            key={idx}
                            onClick={() => setActiveTab(check.tab as any)}
                            className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-colors group text-left border border-white/5 hover:border-white/10"
                          >
                            <div className="flex items-center gap-4">
                              {check.met ? (
                                <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center text-green-400 shadow-[0_0_5px_rgba(74,222,128,0.3)]"><CheckCircle className="w-4 h-4" /></div>
                              ) : (
                                <div className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center text-gray-500 group-hover:bg-mdj-cyan/10 group-hover:text-mdj-cyan"><Circle className="w-4 h-4" /></div>
                              )}
                              <span className={check.met ? "text-white font-medium" : "text-gray-400 group-hover:text-mdj-cyan transition-colors"}>
                                {check.label}
                              </span>
                            </div>
                            <span className="text-xs text-gray-600 font-mono group-hover:text-white transition-colors">Go &rarr;</span>
                          </button>
                        ))}
                      </div>
                   </div>
                   
                   <div className="space-y-6">
                      <div className="bg-gradient-to-br from-mdj-cyan to-blue-600 rounded-2xl p-6 text-black text-center shadow-[0_0_20px_rgba(0,255,255,0.3)]">
                        <div className="text-5xl font-black mb-1 tracking-tighter">{readiness.percentage}%</div>
                        <div className="text-black/60 text-sm font-bold uppercase tracking-widest">Niveau de préparation</div>
                      </div>
                      
                      <div className="bg-mdj-black/30 rounded-2xl p-6 border border-white/10">
                        <h4 className="font-bold text-white mb-3 text-sm flex items-center gap-2"><BrainCircuit className="w-4 h-4 text-mdj-magenta"/> Dimensions</h4>
                        <div className="flex flex-wrap gap-2">
                          {activity.rmjqDimensions?.length > 0 ? activity.rmjqDimensions.map((dim, i) => (
                            <span key={i} className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs font-semibold text-mdj-cyan shadow-sm">
                              {dim}
                            </span>
                          )) : (
                            <span className="text-xs text-gray-500 italic">Aucune dimension RMJQ définie</span>
                          )}
                        </div>
                      </div>
                   </div>
                </div>
              </div>
            )}

            {activeTab === 'pedagogy' && (
              <div className="space-y-8 max-w-4xl mx-auto animate-in fade-in duration-300">
                {/* Description */}
                <div className="bg-mdj-black/30 p-6 rounded-2xl border border-white/10 shadow-sm relative overflow-hidden group">
                  <div className="absolute top-0 left-0 w-1 h-full bg-mdj-cyan shadow-[0_0_10px_#00FFFF]"></div>
                  <label className="block text-sm font-bold text-gray-400 mb-2 uppercase tracking-wide">Description de l'activité</label>
                  <textarea 
                    className="w-full p-0 border-none resize-none focus:ring-0 text-white text-lg leading-relaxed placeholder-gray-600 bg-transparent"
                    value={activity.description}
                    onChange={e => setActivity({...activity, description: e.target.value})}
                    placeholder="Décrivez le déroulement de l'activité..."
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Objectifs RMJQ */}
                  <div className="bg-mdj-black/30 rounded-2xl border border-white/10 shadow-sm overflow-hidden">
                    <div className="bg-white/5 px-6 py-4 border-b border-white/10">
                      <h3 className="font-bold text-white flex items-center gap-2">
                        <BrainCircuit className="w-5 h-5 text-mdj-magenta"/> Objectifs Pédagogiques
                      </h3>
                      <p className="text-xs text-gray-500 mt-1">Viser : Critique, Actif, Responsable</p>
                    </div>
                    <div className="p-6 space-y-3">
                      {activity.objectives.map((obj, i) => (
                        <div key={i} className="flex gap-2 items-start">
                          <div className="mt-2 w-1.5 h-1.5 rounded-full bg-mdj-magenta shrink-0 shadow-[0_0_5px_#FF00FF]"></div>
                          <input 
                            className="flex-1 border-b border-white/10 focus:border-mdj-magenta focus:ring-0 p-1 text-sm bg-transparent text-gray-300 focus:text-white transition-colors" 
                            value={obj} 
                            onChange={(e) => {
                              const newObjs = [...activity.objectives];
                              newObjs[i] = e.target.value;
                              setActivity({...activity, objectives: newObjs});
                            }} 
                          />
                          <button onClick={() => {
                             const newObjs = activity.objectives.filter((_, idx) => idx !== i);
                             setActivity({...activity, objectives: newObjs});
                          }} className="text-gray-500 hover:text-red-500"><X className="w-4 h-4"/></button>
                        </div>
                      ))}
                      <button 
                        onClick={() => setActivity({...activity, objectives: [...activity.objectives, ""]})}
                        className="text-sm text-mdj-magenta font-medium hover:underline mt-2 inline-block hover:text-white transition-colors"
                      >+ Ajouter un objectif</button>
                    </div>
                  </div>

                  {/* Par et Pour les jeunes */}
                  <div className="bg-mdj-black/30 rounded-2xl border border-white/10 shadow-sm overflow-hidden">
                    <div className="bg-white/5 px-6 py-4 border-b border-white/10">
                      <h3 className="font-bold text-white flex items-center gap-2">
                        <Hand className="w-5 h-5 text-mdj-cyan"/> Implication des Jeunes
                      </h3>
                      <p className="text-xs text-mdj-cyan/80 mt-1">Approche "Par et Pour"</p>
                    </div>
                    <div className="p-6 space-y-4">
                      <div>
                        <label className={labelClass}>Niveau d'implication</label>
                        <select 
                          className={inputClass}
                          value={activity.youthInvolvement?.level || 'Participation'}
                          onChange={e => setActivity({...activity, youthInvolvement: { ...activity.youthInvolvement, level: e.target.value as any }})}
                        >
                          <option value="Participation">Participation (Simple)</option>
                          <option value="Consultation">Consultation (Donnent leur avis)</option>
                          <option value="Organisation">Organisation (Co-organisateurs)</option>
                          <option value="Animation">Animation (Leader / Animent)</option>
                        </select>
                      </div>
                      <div>
                        <label className={labelClass}>Tâches déléguées aux jeunes</label>
                        <ul className="space-y-2">
                          {(activity.youthInvolvement?.tasks || []).map((task, i) => (
                            <li key={i} className="flex gap-2 text-sm text-gray-300 bg-white/5 border border-white/5 p-2 rounded-lg">
                              <span className="text-mdj-cyan">•</span> {task}
                              <button className="ml-auto text-gray-500 hover:text-red-500" onClick={() => {
                                const newTasks = activity.youthInvolvement.tasks.filter((_, idx) => idx !== i);
                                setActivity({...activity, youthInvolvement: {...activity.youthInvolvement, tasks: newTasks}});
                              }}><X className="w-3 h-3"/></button>
                            </li>
                          ))}
                        </ul>
                        <button 
                          onClick={() => {
                            const val = prompt("Nouvelle tâche pour les jeunes:");
                            if (val) {
                              const currentTasks = activity.youthInvolvement?.tasks || [];
                              setActivity({...activity, youthInvolvement: { ...activity.youthInvolvement, tasks: [...currentTasks, val] }});
                            }
                          }}
                          className="text-xs bg-mdj-cyan/20 text-mdj-cyan px-3 py-1.5 rounded-full mt-3 hover:bg-mdj-cyan hover:text-black transition-all font-bold"
                        >
                          + Ajouter une responsabilité
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Evaluation */}
                <div className="bg-mdj-black/30 p-6 rounded-2xl border border-white/10 shadow-sm">
                  <label className="block text-sm font-bold text-white mb-2">Critères d'évaluation (Bilan)</label>
                  <p className="text-xs text-gray-500 mb-3">Comment saurons-nous si l'activité a été un succès éducatif ?</p>
                  <div className="space-y-2">
                    {(activity.evaluationCriteria || []).map((crit, i) => (
                      <div key={i} className="flex gap-2">
                         <input 
                            className="flex-1 p-2 border border-white/10 rounded-lg text-sm bg-mdj-black text-white focus:border-mdj-yellow focus:ring-1 focus:ring-mdj-yellow placeholder-gray-600" 
                            value={crit} 
                            onChange={(e) => {
                              const newCrits = [...(activity.evaluationCriteria || [])];
                              newCrits[i] = e.target.value;
                              setActivity({...activity, evaluationCriteria: newCrits});
                            }} 
                          />
                          <button onClick={() => {
                             const newCrits = activity.evaluationCriteria.filter((_, idx) => idx !== i);
                             setActivity({...activity, evaluationCriteria: newCrits});
                          }} className="text-gray-500 hover:text-red-500"><X className="w-4 h-4"/></button>
                      </div>
                    ))}
                    <button 
                      onClick={() => setActivity({...activity, evaluationCriteria: [...(activity.evaluationCriteria || []), ""]})}
                      className="text-sm text-mdj-yellow font-medium hover:underline hover:text-white transition-colors"
                    >+ Ajouter un critère</button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'logistics' && (
              <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-300">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div className="bg-mdj-black/30 p-6 rounded-2xl border border-white/10 shadow-sm">
                      <h3 className="font-bold text-white mb-4 flex items-center gap-2"><Clock className="w-5 h-5 text-mdj-cyan"/> Horaires de l'activité</h3>
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <label className={labelClass}>Heure de début</label>
                          <input type="time" className={inputClass} value={activity.startTime} onChange={e => setActivity({...activity, startTime: e.target.value})} />
                        </div>
                        <div>
                          <label className={labelClass}>Heure de fin</label>
                          <input type="time" className={inputClass} value={activity.endTime} onChange={e => setActivity({...activity, endTime: e.target.value})} />
                        </div>
                      </div>
                      
                      <hr className="border-white/5 my-4"/>

                      <h3 className="font-bold text-white mb-4 flex items-center gap-2"><MapPin className="w-5 h-5 text-mdj-cyan"/> Lieu & Rendez-vous</h3>
                      <div className="space-y-4">
                        <div>
                          <label className={labelClass}>Nom du lieu (Requis)</label>
                          <input 
                            className={inputClass}
                            value={activity.logistics.venueName} 
                            onChange={e => setActivity({...activity, logistics: {...activity.logistics, venueName: e.target.value}})} 
                            placeholder="Ex: Musée POP, Maïkan Aventure..."
                          />
                        </div>
                        <div>
                          <label className={labelClass}>Adresse complète</label>
                          <input className={inputClass} value={activity.logistics.address} onChange={e => setActivity({...activity, logistics: {...activity.logistics, address: e.target.value}})} />
                        </div>
                        <div>
                          <label className={labelClass}>Coordonnées</label>
                          <div className="space-y-2">
                             <div className="flex gap-2 items-center">
                               <Phone className="w-4 h-4 text-gray-500" />
                               <input 
                                 className={inputClass} 
                                 placeholder="Téléphone"
                                 value={activity.logistics.phoneNumber || ''} 
                                 onChange={e => setActivity({...activity, logistics: {...activity.logistics, phoneNumber: e.target.value}})} 
                               />
                             </div>
                             <div className="flex gap-2 items-center">
                               <LinkIcon className="w-4 h-4 text-gray-500" />
                               <input 
                                 className={inputClass} 
                                 placeholder="Site Web"
                                 value={activity.logistics.website || ''} 
                                 onChange={e => setActivity({...activity, logistics: {...activity.logistics, website: e.target.value}})} 
                               />
                             </div>
                          </div>
                        </div>
                        <div>
                          <label className={labelClass}>Point de rassemblement</label>
                          <input className={inputClass} value={activity.logistics.meetingPoint} onChange={e => setActivity({...activity, logistics: {...activity.logistics, meetingPoint: e.target.value}})} />
                        </div>
                      </div>
                   </div>

                   <div className="bg-mdj-black/30 p-6 rounded-2xl border border-white/10 shadow-sm">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-white flex items-center gap-2"><Truck className="w-5 h-5 text-mdj-cyan"/> Transport</h3>
                        <label className="flex items-center gap-2 cursor-pointer bg-white/5 px-3 py-1 rounded-full border border-white/10 hover:bg-white/10 transition-all">
                          <input type="checkbox" className="rounded text-mdj-cyan bg-transparent border-gray-500 focus:ring-mdj-cyan" checked={activity.logistics.transportRequired} onChange={e => setActivity({...activity, logistics: {...activity.logistics, transportRequired: e.target.checked}})} />
                          <span className="text-sm font-medium text-white">Requis</span>
                        </label>
                      </div>
                      
                      {activity.logistics.transportRequired ? (
                        <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                           <div className="bg-mdj-cyan/5 p-4 rounded-xl border border-mdj-cyan/20">
                              <h4 className="flex items-center gap-2 text-sm font-bold text-mdj-cyan mb-3"><Timer className="w-4 h-4"/> Horaire du transport</h4>
                              <div className="grid grid-cols-2 gap-4">
                                 <div>
                                  <label className="text-[10px] font-bold text-mdj-cyan/70 uppercase">Départ (Aller)</label>
                                  <input 
                                    type="time" 
                                    className="w-full mt-1 p-2 border border-mdj-cyan/30 rounded bg-mdj-black text-white focus:ring-mdj-cyan focus:border-mdj-cyan" 
                                    value={activity.logistics.departureTime || ''} 
                                    onChange={e => setActivity({...activity, logistics: {...activity.logistics, departureTime: e.target.value}})} 
                                  />
                                  <span className="text-[10px] text-gray-500">Présence</span>
                                </div>
                                <div>
                                  <label className="text-[10px] font-bold text-mdj-cyan/70 uppercase">Retour (Arrivée)</label>
                                  <input 
                                    type="time" 
                                    className="w-full mt-1 p-2 border border-mdj-cyan/30 rounded bg-mdj-black text-white focus:ring-mdj-cyan focus:border-mdj-cyan" 
                                    value={activity.logistics.returnTime || ''} 
                                    onChange={e => setActivity({...activity, logistics: {...activity.logistics, returnTime: e.target.value}})} 
                                  />
                                  <span className="text-[10px] text-gray-500">MDJ</span>
                                </div>
                              </div>
                           </div>
                           
                           <hr className="border-white/5"/>

                           <div>
                            <label className={labelClass}>Mode de transport</label>
                            <select className={inputClass} value={activity.logistics.transportMode} onChange={e => setActivity({...activity, logistics: {...activity.logistics, transportMode: e.target.value}})}>
                              <option value="">Sélectionner...</option>
                              <option>Véhicules des intervenants</option>
                              <option>À pied</option>
                            </select>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                             <div>
                              <label className={labelClass}>Distance (km)</label>
                              <input className={inputClass} value={activity.logistics.distance} onChange={e => setActivity({...activity, logistics: {...activity.logistics, distance: e.target.value}})} />
                            </div>
                            <div>
                              <label className={labelClass}>Durée trajet</label>
                              <input className={inputClass} value={activity.logistics.travelTime} onChange={e => setActivity({...activity, logistics: {...activity.logistics, travelTime: e.target.value}})} />
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="text-gray-500 italic text-center py-4 text-sm bg-white/5 rounded-xl border border-white/5">Aucun transport nécessaire.</div>
                      )}
                   </div>
                 </div>
                 <div className="bg-mdj-black/30 p-6 rounded-2xl border border-white/10 shadow-sm">
                    <label className="block text-sm font-semibold text-gray-300 mb-2">Plan B (Météo ou imprévu)</label>
                    <textarea 
                      className="w-full p-3 border border-white/10 bg-mdj-black rounded-xl focus:ring-1 focus:ring-mdj-cyan text-white min-h-[80px]"
                      value={activity.backupPlan}
                      onChange={e => setActivity({...activity, backupPlan: e.target.value})}
                      placeholder="Solution de repli..."
                    />
                  </div>
              </div>
            )}

            {activeTab === 'materials' && (
              <div className="bg-mdj-black/30 p-6 rounded-2xl border border-white/10 shadow-sm max-w-4xl mx-auto animate-in fade-in duration-300">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-xs font-bold text-gray-500 uppercase border-b border-white/10 tracking-wider">
                      <th className="pb-3 w-10">État</th>
                      <th className="pb-3">Matériel</th>
                      <th className="pb-3 w-24">Quantité</th>
                      <th className="pb-3">Provenance (Responsable)</th>
                      <th className="pb-3 w-10"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {activity.materials.map((mat, idx) => (
                      <tr key={idx} className="group hover:bg-white/5 transition-colors">
                        <td className="py-3">
                          <input 
                            type="checkbox" 
                            checked={mat.acquired} 
                            onChange={(e) => {
                              const newMat = [...activity.materials];
                              newMat[idx].acquired = e.target.checked;
                              setActivity({...activity, materials: newMat});
                            }}
                            className="rounded text-green-500 focus:ring-green-500 w-5 h-5 cursor-pointer border-gray-500 bg-transparent" 
                          />
                        </td>
                        <td className="py-3"><input className="w-full bg-transparent border-none focus:ring-0 p-1 text-white placeholder-gray-600" value={mat.item} onChange={(e) => {
                            const newMat = [...activity.materials];
                            newMat[idx].item = e.target.value;
                            setActivity({...activity, materials: newMat});
                        }} placeholder="Nom de l'item..." /></td>
                        <td className="py-3"><input className="w-full bg-transparent border-none focus:ring-0 p-1 text-white placeholder-gray-600" value={mat.quantity} onChange={(e) => {
                            const newMat = [...activity.materials];
                            newMat[idx].quantity = e.target.value;
                            setActivity({...activity, materials: newMat});
                        }} placeholder="Qte" /></td>
                        <td className="py-3"><input className="w-full bg-transparent border-none focus:ring-0 p-1 text-white placeholder-gray-600" value={mat.supplier} onChange={(e) => {
                            const newMat = [...activity.materials];
                            newMat[idx].supplier = e.target.value;
                            setActivity({...activity, materials: newMat});
                        }} placeholder="Maison, Achat, Emprunt..." /></td>
                        <td className="py-3 text-right">
                           <button onClick={() => {
                              const newMat = activity.materials.filter((_, i) => i !== idx);
                              setActivity({...activity, materials: newMat});
                           }} className="text-gray-500 hover:text-red-500 transition-colors"><X className="w-4 h-4"/></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <button 
                  onClick={() => setActivity({...activity, materials: [...activity.materials, { item: '', quantity: '', supplier: '', acquired: false }]})}
                  className="mt-6 text-sm bg-white/5 text-gray-300 px-4 py-2 rounded-xl hover:bg-white/10 font-bold flex items-center gap-2 transition-colors border border-white/10"
                >
                  <Wand2 className="w-3 h-3" /> Ajouter un article
                </button>
              </div>
            )}

            {activeTab === 'risk' && (
               <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-300">
                 
                 {/* Nouveau bloc Conformité / Règlements */}
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-mdj-black/30 p-6 rounded-2xl border border-white/10 shadow-sm">
                       <h3 className="flex items-center gap-2 font-bold text-white mb-4">
                           <Gavel className="w-5 h-5 text-mdj-magenta"/> Règlements du Site
                       </h3>
                       <div className="space-y-2">
                           {(activity.riskManagement.siteRules || []).map((rule, idx) => (
                               <div key={idx} className="flex gap-2 items-start text-sm text-gray-300">
                                   <span className="text-mdj-magenta">•</span>
                                   <input 
                                     className="flex-1 bg-transparent border-b border-transparent focus:border-white/30 p-0"
                                     value={rule}
                                     onChange={e => {
                                        const newRules = [...(activity.riskManagement.siteRules || [])];
                                        newRules[idx] = e.target.value;
                                        setActivity({...activity, riskManagement: {...activity.riskManagement, siteRules: newRules}});
                                     }}
                                   />
                                    <button className="text-gray-500 hover:text-red-500" onClick={() => {
                                      const newRules = (activity.riskManagement.siteRules || []).filter((_, i) => i !== idx);
                                      setActivity({...activity, riskManagement: {...activity.riskManagement, siteRules: newRules}});
                                    }}><X className="w-3 h-3"/></button>
                               </div>
                           ))}
                           <button 
                             onClick={() => setActivity({...activity, riskManagement: {...activity.riskManagement, siteRules: [...(activity.riskManagement.siteRules || []), ""]}})}
                             className="text-xs text-mdj-magenta font-bold hover:underline"
                           >+ Ajouter un règlement</button>
                       </div>
                    </div>

                    <div className="bg-mdj-black/30 p-6 rounded-2xl border border-white/10 shadow-sm">
                       <h3 className="flex items-center gap-2 font-bold text-white mb-4">
                           <FileText className="w-5 h-5 text-mdj-cyan"/> Obligations Administratives
                       </h3>
                       <div className="space-y-2">
                           {(activity.riskManagement.complianceRequirements || []).map((req, idx) => (
                               <div key={idx} className="flex gap-2 items-start text-sm text-gray-300">
                                   <span className="text-mdj-cyan">→</span>
                                   <input 
                                     className="flex-1 bg-transparent border-b border-transparent focus:border-white/30 p-0"
                                     value={req}
                                     onChange={e => {
                                        const newReqs = [...(activity.riskManagement.complianceRequirements || [])];
                                        newReqs[idx] = e.target.value;
                                        setActivity({...activity, riskManagement: {...activity.riskManagement, complianceRequirements: newReqs}});
                                     }}
                                   />
                                   <button className="text-gray-500 hover:text-red-500" onClick={() => {
                                      const newReqs = (activity.riskManagement.complianceRequirements || []).filter((_, i) => i !== idx);
                                      setActivity({...activity, riskManagement: {...activity.riskManagement, complianceRequirements: newReqs}});
                                    }}><X className="w-3 h-3"/></button>
                               </div>
                           ))}
                           <button 
                             onClick={() => setActivity({...activity, riskManagement: {...activity.riskManagement, complianceRequirements: [...(activity.riskManagement.complianceRequirements || []), ""]}})}
                             className="text-xs text-mdj-cyan font-bold hover:underline"
                           >+ Ajouter une obligation (Décharge/Formulaire)</button>
                       </div>
                    </div>
                 </div>

                 <div className="bg-mdj-orange/10 p-6 rounded-2xl border border-mdj-orange/20 shadow-sm">
                   <h3 className="flex items-center gap-2 font-bold text-mdj-orange mb-4"><ShieldAlert className="w-5 h-5"/> Analyse de Risques</h3>
                   <div className="flex flex-wrap gap-2">
                     {activity.riskManagement.hazards.map((hazard, idx) => (
                       <span key={idx} className="bg-mdj-black px-3 py-1.5 rounded-lg text-sm text-white border border-mdj-orange/30 shadow-sm flex items-center gap-2">
                         {hazard}
                         <X className="w-3 h-3 cursor-pointer hover:text-mdj-orange" onClick={() => {
                            const newHazards = activity.riskManagement.hazards.filter((_, i) => i !== idx);
                            setActivity({...activity, riskManagement: {...activity.riskManagement, hazards: newHazards}});
                         }}/>
                       </span>
                     ))}
                     <button 
                      onClick={() => {
                        const val = prompt("Nouveau risque identifié:");
                        if(val) setActivity({...activity, riskManagement: {...activity.riskManagement, hazards: [...activity.riskManagement.hazards, val]}})
                      }}
                      className="px-3 py-1.5 rounded-lg text-sm border border-mdj-orange/50 border-dashed text-mdj-orange hover:bg-mdj-orange/10 bg-transparent font-bold">
                       + Ajouter
                     </button>
                   </div>
                 </div>

                 <div className="bg-mdj-black/30 p-6 rounded-2xl border border-white/10 shadow-sm">
                      <label className="block text-sm font-bold text-white mb-4">Protocoles de sécurité & Code de vie</label>
                      <div className="space-y-3">
                        {activity.riskManagement.safetyProtocols.map((proto, idx) => (
                          <div key={idx} className="flex gap-3 items-start group">
                            <CheckSquare className="w-5 h-5 text-green-400 shrink-0 mt-0.5"/>
                            <input 
                              className="flex-1 border-b border-transparent focus:border-white/30 focus:ring-0 p-0 text-gray-300 bg-transparent" 
                              value={proto}
                              onChange={e => {
                                const newProtos = [...activity.riskManagement.safetyProtocols];
                                newProtos[idx] = e.target.value;
                                setActivity({...activity, riskManagement: {...activity.riskManagement, safetyProtocols: newProtos}});
                              }}
                            />
                            <button onClick={() => {
                               const newProtos = activity.riskManagement.safetyProtocols.filter((_, i) => i !== idx);
                               setActivity({...activity, riskManagement: {...activity.riskManagement, safetyProtocols: newProtos}});
                            }} className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-red-500"><X className="w-4 h-4"/></button>
                          </div>
                        ))}
                        <button 
                          onClick={() => setActivity({...activity, riskManagement: {...activity.riskManagement, safetyProtocols: [...activity.riskManagement.safetyProtocols, "Respect du Code de vie (Tolérance Zéro)"]}})}
                          className="text-sm text-mdj-cyan pl-8 hover:underline font-bold"
                        >+ Ajouter une mesure</button>
                      </div>
                   </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div className="bg-mdj-black/30 p-6 rounded-2xl border border-white/10 shadow-sm">
                      <label className={labelClass}>Assurances & Autorisations</label>
                      <textarea 
                        className="w-full p-3 border border-white/10 bg-mdj-black rounded-lg text-sm text-white placeholder-gray-600"
                        value={activity.riskManagement.requiredInsurance}
                        onChange={e => setActivity({...activity, riskManagement: {...activity.riskManagement, requiredInsurance: e.target.value}})}
                        placeholder="Formulaires de consentement, Assurances spéciales..."
                        rows={3}
                      />
                   </div>
                   <div className="bg-mdj-black/30 p-6 rounded-2xl border border-white/10 shadow-sm">
                      <label className={labelClass}>Contact d'urgence</label>
                      <input 
                        className={inputClass}
                        value={activity.riskManagement.emergencyContact}
                        onChange={e => setActivity({...activity, riskManagement: {...activity.riskManagement, emergencyContact: e.target.value}})}
                        placeholder="Patrick Delage (DG)"
                      />
                   </div>
                 </div>
               </div>
            )}

            {activeTab === 'budget' && (
              <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-300">
                <div className="grid grid-cols-2 gap-6">
                  <div className="bg-mdj-black/30 p-6 rounded-2xl text-center border border-white/10 shadow-sm">
                    <span className="block text-xs font-bold text-gray-500 uppercase mb-1">Coût Estimé</span>
                    <span className="text-4xl font-bold text-mdj-cyan font-mono">{activity.budget.estimatedCost.toFixed(2)}$</span>
                  </div>
                   <div className="bg-mdj-black/30 p-6 rounded-2xl text-center border border-white/10 shadow-sm">
                    <span className="block text-xs font-bold text-gray-500 uppercase mb-1">Coût Réel</span>
                    <span className={`text-4xl font-bold font-mono ${activity.budget.actualCost > activity.budget.estimatedCost ? 'text-red-500' : 'text-green-400'}`}>
                      {activity.budget.actualCost.toFixed(2)}$
                    </span>
                  </div>
                </div>

                <div className="bg-mdj-black/30 p-6 rounded-2xl border border-white/10 shadow-sm">
                  <h3 className="font-bold text-white mb-4 flex items-center gap-2"><DollarSign className="w-5 h-5 text-mdj-yellow"/> Postes budgétaires</h3>
                  <div className="space-y-2">
                    {activity.budget.items.map((item, idx) => (
                       <div key={idx} className="flex justify-between items-center py-3 px-4 bg-white/5 rounded-xl border border-white/5 group hover:bg-white/10 transition-colors">
                         <input 
                           className="flex-1 border-none focus:ring-0 p-0 text-white bg-transparent font-medium" 
                           value={item.description}
                           onChange={e => {
                             const newItems = [...activity.budget.items];
                             newItems[idx].description = e.target.value;
                             setActivity({...activity, budget: {...activity.budget, items: newItems}});
                           }}
                         />
                         <div className="flex items-center gap-3">
                           <div className="relative">
                             <input 
                               type="number"
                               className="w-24 text-right border-none focus:ring-0 p-0 font-mono text-mdj-cyan bg-transparent font-bold" 
                               value={item.amount}
                               onChange={e => {
                                 const newItems = [...activity.budget.items];
                                 newItems[idx].amount = parseFloat(e.target.value) || 0;
                                 const newTotal = newItems.reduce((acc, curr) => acc + curr.amount, 0);
                                 setActivity({...activity, budget: {...activity.budget, estimatedCost: newTotal, items: newItems}});
                               }}
                             />
                             <span className="absolute right-[-15px] top-0 text-gray-500">$</span>
                           </div>
                           <button onClick={() => {
                              const newItems = activity.budget.items.filter((_, i) => i !== idx);
                              const newTotal = newItems.reduce((acc, curr) => acc + curr.amount, 0);
                              setActivity({...activity, budget: {...activity.budget, estimatedCost: newTotal, items: newItems}});
                           }} className="text-gray-500 hover:text-red-500 opacity-0 group-hover:opacity-100"><X className="w-4 h-4"/></button>
                         </div>
                       </div>
                    ))}
                  </div>
                  <button 
                    onClick={() => setActivity({...activity, budget: {...activity.budget, items: [...activity.budget.items, { description: 'Nouvel item', amount: 0 }]}})}
                    className="mt-4 text-sm text-mdj-yellow font-bold hover:underline pl-1"
                  >+ Ajouter un poste</button>
                </div>
              </div>
            )}

            {activeTab === 'staff' && (
               <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-300">
                 <div className="bg-mdj-black/30 p-6 rounded-2xl border border-white/10 shadow-sm">
                   <h3 className="font-bold text-white mb-6">Équipe d'animation & Encadrement</h3>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div>
                        <label className={labelClass}>Adulte Significatif (Lead)</label>
                        <input 
                          list="staffList"
                          className="w-full p-3 border border-mdj-cyan/30 rounded-xl font-bold text-mdj-cyan bg-mdj-cyan/10 focus:ring-mdj-cyan focus:border-mdj-cyan" 
                          value={activity.staffing.leadStaff} 
                          onChange={e => setActivity({...activity, staffing: {...activity.staffing, leadStaff: e.target.value}})} 
                        />
                        <datalist id="staffList">
                          {STAFF_LIST.map(staff => <option key={staff} value={staff} />)}
                        </datalist>
                        <p className="text-xs text-gray-500 mt-1">Responsable du lien de confiance</p>
                      </div>
                      <div>
                        <label className={labelClass}>Ratio requis</label>
                        <input className={inputClass} value={activity.staffing.requiredRatio} onChange={e => setActivity({...activity, staffing: {...activity.staffing, requiredRatio: e.target.value}})} />
                        <p className="text-xs text-gray-500 mt-1">Selon normes RMJQ</p>
                      </div>
                   </div>
                   <div className="mt-8">
                      <label className={labelClass}>Personnel de soutien</label>
                      <div className="flex flex-wrap gap-2">
                         {activity.staffing.supportStaff.map((staff, idx) => (
                           <span key={idx} className="bg-white/10 pl-3 pr-2 py-1.5 rounded-lg text-sm text-white flex items-center gap-2 border border-white/10">
                             {staff}
                             <X className="w-3.5 h-3.5 cursor-pointer text-gray-400 hover:text-red-500" onClick={() => {
                               const newStaff = activity.staffing.supportStaff.filter((_, i) => i !== idx);
                               setActivity({...activity, staffing: {...activity.staffing, supportStaff: newStaff}});
                             }}/>
                           </span>
                         ))}
                         <button 
                            onClick={() => {
                              const val = prompt("Nom du staff:");
                              if(val) setActivity({...activity, staffing: {...activity.staffing, supportStaff: [...activity.staffing.supportStaff, val]}});
                            }}
                            className="text-sm text-mdj-cyan hover:bg-mdj-cyan/10 px-4 py-1.5 rounded-lg border border-mdj-cyan/30 border-dashed transition-colors font-bold"
                         >+ Ajouter</button>
                      </div>
                   </div>
                   <div className="mt-8 p-4 bg-mdj-yellow/5 rounded-xl border border-mdj-yellow/20">
                      <label className="text-xs font-bold text-mdj-yellow uppercase mb-1 block">Qualifications requises</label>
                      <input 
                        className="w-full bg-transparent border-none p-0 text-sm text-white focus:ring-0 placeholder-gray-500" 
                        value={activity.staffing.specialQualifications || ""}
                        onChange={e => setActivity({...activity, staffing: {...activity.staffing, specialQualifications: e.target.value}})}
                        placeholder="Ex: RCR, Permis de conduire classe 4B..."
                      />
                   </div>
                 </div>
               </div>
            )}

          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 flex justify-between items-center bg-mdj-dark">
          <div className="text-xs text-gray-500 pl-2">
            MDJ L'Escale Jeunesse - La Piaule
          </div>
          <div className="flex gap-3">
            <button onClick={onClose} className="px-6 py-2.5 rounded-xl text-gray-400 hover:bg-white/5 hover:text-white font-bold transition-all">Annuler</button>
            <button 
              onClick={() => onSave(activity)}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-mdj-cyan to-blue-600 text-black hover:to-blue-500 font-bold shadow-[0_0_20px_rgba(0,255,255,0.3)] hover:shadow-[0_0_30px_rgba(0,255,255,0.5)] transition-all"
            >
              <Save className="w-4 h-4" /> Enregistrer le plan
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActivityModal;