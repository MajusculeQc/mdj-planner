import React, { useState } from 'react';
import {
    Users,
    Clock,
    Sparkles,
    Shield,
    Plus,
    Minus,
    X,
    AlertTriangle,
    Target,
    ChevronLeft,
    Save,
    Eye,
    Printer,
    History as HistoryIcon
} from 'lucide-react';
import { Activity } from '../../types';
import { cn } from '../../lib/utils';
import { TEAM_DIRECTORY, getEmployeeName } from '../../lib/constants';
import { useMembers } from '../../hooks/useMembers';
import { ActivityTypeEnum } from '../../lib/schemas';
import { AIIntelligenceService } from '../../services/aiIntelligenceService';
import AICorrectButton from '../ui/AICorrectButton';

interface JournalDeBordTabProps {
    activity: Activity;
    updateActivity: (updates: Partial<Activity>) => void;
    userEmail: string | null;
}

// ═══════════════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════

const GROUP_CLIMATE_OPTIONS = [
    { label: 'Calme / Relaxe', icon: '😌' },
    { label: 'Amusante / Joyeuse', icon: '😄' },
    { label: 'Énergique / Mouvementée', icon: '⚡' },
    { label: 'Instructive / Curieuse', icon: '🧠' },
    { label: 'Coopérative / Artistique', icon: '🎨' },
    { label: 'Coopérative / Collaborative', icon: '🤝' },
    { label: 'Chaotique / Désorganisée', icon: '🌀' },
    { label: 'Lourde / Tendue', icon: '😰' },
    { label: 'Émotive / Sensible', icon: '💗' },
    { label: 'Fatiguée / Lente', icon: '😴' },
];

const RMJQ_VOLETS = ActivityTypeEnum.options;

const STAFF_NAMES = Object.keys(TEAM_DIRECTORY);

// ═══════════════════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

const JournalDeBordTab: React.FC<JournalDeBordTabProps> = ({ activity, updateActivity, userEmail }) => {
    const [searchMember, setSearchMember] = useState('');
    const [showMemberSelect, setShowMemberSelect] = useState(false);
    const [newNoteOpen, setNewNoteOpen] = useState(false);
    const [otherStaff, setOtherStaff] = useState('');
    const [isRefining, setIsRefining] = useState(false);
    const { members } = useMembers(userEmail);

    // --- Author Tracking & Staff Sync ---
    // Automatically add the current user and the lead staff to the present staff list
    React.useEffect(() => {
        let currentStaff = [...(activity.staffing?.supportStaff || [])];
        let changed = false;

        // 1. Add current user if they are an employee
        if (userEmail) {
            const userName = getEmployeeName(userEmail);
            if (userName && userName !== userEmail) {
                const fullName = Object.keys(TEAM_DIRECTORY).find(k => TEAM_DIRECTORY[k] === userEmail) || userName;
                if (!currentStaff.includes(fullName)) {
                    currentStaff.push(fullName);
                    changed = true;
                }
            }
        }

        // 2. Add lead staff if not present
        if (activity.staffing?.leadStaff && !currentStaff.includes(activity.staffing.leadStaff)) {
            currentStaff.push(activity.staffing.leadStaff);
            changed = true;
        }

        if (changed) {
            updateActivity({ staffing: { ...activity.staffing, supportStaff: currentStaff } });
        }
    }, [userEmail, activity.staffing?.leadStaff]);

    const calculateAge = (birthDate: string) => {
        const today = new Date();
        const birth = new Date(birthDate);
        let age = today.getFullYear() - birth.getFullYear();
        const m = today.getMonth() - birth.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
            age--;
        }
        return age;
    };

    const handleAIRefine = async () => {
        if (!activity.description?.trim()) return;
        setIsRefining(true);
        try {
            const refined = await AIIntelligenceService.refineJDBNotes(activity.description, activity.title);
            if (refined) {
                updateActivity({ description: refined });
            }
        } catch (error) {
            console.error(error);
            alert("Erreur lors du raffinement IA.");
        } finally {
            setIsRefining(false);
        }
    };

    // --- Update Helpers ---
    const updateStats = (updates: Partial<typeof activity.stats>) => {
        updateActivity({ stats: { ...activity.stats, ...updates } });
    };
    const updateClinical = (updates: Partial<typeof activity.clinicalObservations>) => {
        updateActivity({ clinicalObservations: { ...activity.clinicalObservations, ...updates } });
    };

    const addSpecificMember = (names: string[]) => {
        const current = activity.stats.participantsList || [];
        updateStats({ participantsList: [...current, ...names.filter(n => !current.includes(n))] });
    };
    const handleRemoveParticipant = (index: number) => {
        const current = [...(activity.stats.participantsList || [])];
        current.splice(index, 1);
        updateStats({ participantsList: current });
    };

    const totalParticipants = (activity.stats.participantsList || []).length ||
        (activity.stats.presentMale + activity.stats.presentFemale + activity.stats.presentNonBinary);

    const filteredMembers = members.filter(m => {
        const fullName = `${m.firstName} ${m.lastName}`.toLowerCase();
        return fullName.includes(searchMember.toLowerCase()) || m.code?.toLowerCase().includes(searchMember.toLowerCase());
    });

    // --- Staff presence helpers ---
    const presentStaff = activity.staffing?.supportStaff || [];
    const toggleStaff = (name: string) => {
        const current = [...presentStaff];
        const idx = current.indexOf(name);
        if (idx >= 0) current.splice(idx, 1);
        else current.push(name);
        updateActivity({ staffing: { ...activity.staffing, supportStaff: current } });
    };

    // --- Climate checkboxes ---
    const groupClimate = activity.clinicalObservations?.groupClimate || [];
    const toggleClimate = (label: string) => {
        const current = [...groupClimate];
        const idx = current.indexOf(label);
        if (idx >= 0) current.splice(idx, 1);
        else current.push(label);
        updateClinical({ groupClimate: current });
    };

    // --- RMJQ volet checkboxes ---
    const selectedVolets = activity.rmjqDimensions || [];
    const toggleVolet = (volet: string) => {
        const current = [...selectedVolets];
        const idx = current.indexOf(volet);
        if (idx >= 0) current.splice(idx, 1);
        else current.push(volet);
        updateActivity({ rmjqDimensions: current });
    };

    // --- Intervention notes ---
    const interventionNotes = activity.clinicalObservations?.interventionNotes || [];
    const addInterventionNote = () => {
        const newNote = {
            id: `note-${Date.now()}-${Math.random().toString(36).slice(2)}`,
            youthName: '',
            type: 'Écoute active' as const,
            description: '',
            isConfidential: true,
        };
        updateClinical({ interventionNotes: [...interventionNotes, newNote] });
        setNewNoteOpen(true);
    };
    const updateNote = (id: string, updates: any) => {
        updateClinical({
            interventionNotes: interventionNotes.map(n => n.id === id ? { ...n, ...updates } : n)
        });
    };
    const removeNote = (id: string) => {
        updateClinical({ interventionNotes: interventionNotes.filter(n => n.id !== id) });
    };

    // --- Significant exchanges counter ---
    const significantExchanges = activity.clinicalObservations?.significantExchanges || 0;

    // --- Print JDB ---
    const handlePrintJDB = () => {
        const printWindow = window.open('', '_blank');
        if (!printWindow) {
            alert("Veuillez autoriser les pop-ups pour imprimer.");
            return;
        }

        const presentStaff = activity.staffing?.supportStaff || [];
        const groupClimate = activity.clinicalObservations?.groupClimate || [];
        const selectedVolets = activity.rmjqDimensions || [];
        const interventionNotes = activity.clinicalObservations?.interventionNotes || [];
        const totalParticipants = (activity.stats.participantsList || []).length ||
            (activity.stats.presentMale + activity.stats.presentFemale + activity.stats.presentNonBinary);

        const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>JOURNAL DE BORD : ${activity.date}</title>
        <style>
          @page { size: 8.5in 11in; margin: 0.5in; }
          body { font-family: 'Helvetica Neue', Arial, sans-serif; color: #1a202c; line-height: 1.3; margin: 0; padding: 0; -webkit-print-color-adjust: exact; }
          
          .header { background-color: #4f46e5; color: white; padding: 15px 20px; border-radius: 6px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
          .header h1 { margin: 0; font-size: 18px; text-transform: uppercase; letter-spacing: 1px; }
          .header-meta { margin-top: 5px; opacity: 0.9; font-size: 12px; }

          .section { border: 1px solid #e2e8f0; border-radius: 6px; padding: 15px; background: #fff; margin-bottom: 15px; break-inside: avoid; }
          .section-title { font-size: 11px; font-weight: 800; text-transform: uppercase; color: #6366f1; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; margin-bottom: 12px; display: flex; align-items: center; gap: 6px; }
          
          .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
          .row { display: flex; justify-content: space-between; margin-bottom: 4px; font-size: 11px; }
          .label { font-weight: 700; color: #4a5568; }
          .value { text-align: right; color: #000; }

          .badge-container { display: flex; flex-wrap: wrap; gap: 4px; margin-top: 5px; }
          .badge { background: #f3f4f6; color: #374151; padding: 2px 6px; border-radius: 4px; font-size: 9px; font-weight: 700; border: 1px solid #e5e7eb; }
          
          .description { background: #f9fafb; padding: 10px; border-radius: 4px; font-size: 11px; color: #374151; border-left: 3px solid #6366f1; margin-top: 5px; white-space: pre-wrap; }
          
          .intervention { background: #fff1f2; border: 1px solid #fecaca; padding: 10px; border-radius: 4px; margin-bottom: 8px; font-size: 11px; }
          .intervention-header { display: flex; justify-content: space-between; font-weight: 800; color: #e11d48; border-bottom: 1px solid #fecaca; margin-bottom: 5px; padding-bottom: 2px; }

          .footer { text-align: center; font-size: 9px; color: #9ca3af; margin-top: 20px; border-top: 1px solid #e5e7eb; padding-top: 10px; }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <h1>JOURNAL DE BORD - MDJ ESCALE JEUNESSE</h1>
            <div class="header-meta">
               Activité : ${activity.title} | Date : ${activity.date} | ${activity.startTime} - ${activity.endTime}
            </div>
          </div>
        </div>

        <div class="grid">
          <div>
            <div class="section">
              <div class="section-title">1 — ÉQUIPE PRÉSENTE</div>
              <div class="badge-container">
                ${presentStaff.length > 0 ? presentStaff.map(s => `<span class="badge">${s}</span>`).join('') : '<span style="font-style:italic; font-size:10px;">Aucun intervenant listé</span>'}
              </div>
            </div>

            <div class="section">
              <div class="section-title">2 — FRÉQUENTATION</div>
              <div class="row"><span class="label">Total des présences:</span> <span class="value" style="font-weight:900;">${totalParticipants}</span></div>
              <div class="row"><span class="label">Garçons:</span> <span class="value">${activity.stats.presentMale}</span></div>
              <div class="row"><span class="label">Filles:</span> <span class="value">${activity.stats.presentFemale}</span></div>
              <div class="row"><span class="label">Divers / NB:</span> <span class="value">${activity.stats.presentNonBinary}</span></div>
              <div class="row"><span class="label">Nouveaux membres:</span> <span class="value" style="color:#059669; font-weight:700;">${activity.stats.newMembers}</span></div>
              
              <div style="margin-top:10px; padding-top:8px; border-top:1px dashed #e5e7eb;">
                <span class="label" style="font-size:9px;">LISTE DES JEUNES :</span>
                <div style="font-size:10px; color:#4b5563; margin-top:4px;">
                  ${(activity.stats.participantsList || []).join(', ') || 'Aucun jeune identifié.'}
                </div>
              </div>
            </div>
          </div>

          <div>
             <div class="section">
              <div class="section-title">3 — ANIMATION & ACTIVITÉS</div>
              <div class="badge-container">
                ${(activity.types || []).map(t => `<span class="badge" style="background:#fff7ed; color:#c2410c; border-color:#fed7aa;">${t}</span>`).join('')}
              </div>
              <div style="margin-top:10px;">
                <span class="label" style="font-size:9px;">DESCRIPTION / DÉROULEMENT :</span>
                <div class="description" style="border-left-color:#f97316;">${activity.description || 'Aucune description planifiée.'}</div>
              </div>
            </div>
          </div>
        </div>

        <div class="section">
          <div class="section-title">4 — CLIMAT & DYNAMIQUE</div>
          <div class="badge-container">
            ${groupClimate.map(c => `<span class="badge" style="background:#f5f3ff; color:#6d28d9; border-color:#ddd6fe;">${c}</span>`).join('')}
          </div>
          <div class="grid" style="margin-top:12px;">
             <div>
                <span class="label" style="font-size:9px;">QUALITÉ DES RELATIONS :</span>
                <div style="font-size:11px; font-weight:700; margin-top:2px;">${activity.clinicalObservations?.relationshipQuality || 'Non spécifiée'}</div>
             </div>
             <div>
                <span class="label" style="font-size:9px;">SUIVIS PRÉVUS :</span>
                <div style="font-size:11px; color:#e11d48; font-weight:700; margin-top:2px;">${activity.clinicalObservations?.followUpPlanning || 'Aucun'}</div>
             </div>
          </div>
          <div style="margin-top:10px;">
            <span class="label" style="font-size:9px;">NOTES DE DYNAMIQUE :</span>
            <div class="description" style="border-left-color:#8b5cf6;">${activity.clinicalObservations?.groupDynamicsNotes || 'Aucune note complémentaire.'}</div>
          </div>
        </div>

        <div class="section" style="border-color:#fecaca;">
          <div class="section-title" style="color:#e11d48; border-bottom-color:#fecaca;">5 — INTERVENTIONS & ÉCHANGES (CONFIDENTIEL)</div>
          <div class="row" style="margin-bottom:10px;">
            <span class="label">Échanges significatifs (courts):</span> 
            <span class="value" style="font-weight:900;">${significantExchanges}</span>
          </div>
          
          ${interventionNotes.length > 0 ? interventionNotes.map(n => `
            <div class="intervention">
              <div class="intervention-header">
                <span>${n.type}</span>
                <span>${n.youthName || 'Anonyme'}</span>
              </div>
              <div style="white-space:pre-wrap;">${n.description}</div>
            </div>
          `).join('') : '<div style="font-style:italic; font-size:10px; color:#9ca3af;">Aucune note d\'intervention détaillée.</div>'}
        </div>

        <div class="footer">
          Document généré le ${new Date().toLocaleString('fr-CA')} | MDJ Planner © 2026
        </div>
      </body>
      </html>
    `;

        printWindow.document.write(htmlContent);
        printWindow.document.close();
        setTimeout(() => {
            printWindow.print();
        }, 500);
    };

    // ═══════════════════════════════════════════════════════════════════════
    // RENDER
    // ═══════════════════════════════════════════════════════════════════════

    const sectionCard = "bg-white dark:bg-white/5 rounded-3xl p-6 border border-slate-200 dark:border-white/10 shadow-sm";
    const sectionTitle = "text-sm font-black uppercase tracking-widest mb-5 flex items-center gap-3";
    const inputBase = "w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 font-bold outline-none focus:border-indigo-500 transition-colors text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500";

    return (
        <div className="space-y-8 max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">

            {/* ═══════════════════════════════════════════════════════════════ */}
            {/* HEADER & PRINT                                              */}
            {/* ═══════════════════════════════════════════════════════════════ */}
            <div className="flex flex-col sm:flex-row justify-between items-center bg-white dark:bg-white/5 p-4 rounded-3xl border border-slate-200 dark:border-white/10 shadow-sm gap-4">
                <div className="flex items-center gap-3 text-slate-400">
                    <HistoryIcon className="w-5 h-5" />
                    <span className="text-xs font-bold uppercase tracking-widest text-slate-500">Journal de bord du {activity.date}</span>
                </div>
                <button
                    onClick={handlePrintJDB}
                    className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl shadow-lg shadow-indigo-500/20 transition-all font-black text-xs uppercase tracking-widest group"
                >
                    <Printer className="w-4 h-4 group-hover:scale-110 transition-transform" />
                    Imprimer / PDF
                </button>
            </div>

            {/* ═══════════════════════════════════════════════════════════════ */}
            {/* SECTION 1 — INFORMATIONS GÉNÉRALES                           */}
            {/* ═══════════════════════════════════════════════════════════════ */}
            <div className={sectionCard}>
                <h3 className={cn(sectionTitle, "text-slate-700 dark:text-white")}>
                    <span className="flex items-center justify-center w-8 h-8 rounded-xl bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-sm font-black">1</span>
                    Informations Générales
                </h3>

                <div className="space-y-6">
                    {/* Date */}
                    <div>
                        <label className="text-[10px] font-bold text-slate-400 dark:text-gray-400 uppercase tracking-widest mb-2 block">Date du rapport</label>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => {
                                    const d = new Date(activity.date);
                                    d.setDate(d.getDate() - 1);
                                    updateActivity({ date: d.toISOString().split('T')[0] });
                                }}
                                className="p-2 hover:bg-slate-100 dark:hover:bg-white/10 rounded-xl transition-colors"
                            >
                                <ChevronLeft className="w-5 h-5" />
                            </button>
                            <input
                                type="date"
                                value={activity.date}
                                onChange={e => updateActivity({ date: e.target.value })}
                                className={cn(inputBase, "flex-1 text-center")}
                            />
                            <button
                                onClick={() => {
                                    const d = new Date(activity.date);
                                    d.setDate(d.getDate() + 1);
                                    updateActivity({ date: d.toISOString().split('T')[0] });
                                }}
                                className="p-2 hover:bg-slate-100 dark:hover:bg-white/10 rounded-xl transition-colors rotate-180"
                            >
                                <ChevronLeft className="w-5 h-5" />
                            </button>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-1 italic text-center">Changer la date chargera automatiquement le journal correspondant.</p>
                    </div>

                    {/* Opening / Closing Hours */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-[10px] font-bold text-slate-400 dark:text-gray-400 uppercase tracking-widest mb-2 block">Heure d'ouverture</label>
                            <div className="relative">
                                <input
                                    type="time"
                                    value={activity.startTime}
                                    onChange={e => updateActivity({ startTime: e.target.value })}
                                    className={cn(inputBase)}
                                />
                                <Clock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                            </div>
                        </div>
                        <div>
                            <label className="text-[10px] font-bold text-slate-400 dark:text-gray-400 uppercase tracking-widest mb-2 block">Heure de fermeture</label>
                            <div className="relative">
                                <input
                                    type="time"
                                    value={activity.endTime}
                                    onChange={e => updateActivity({ endTime: e.target.value })}
                                    className={cn(inputBase)}
                                />
                                <Clock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                            </div>
                        </div>
                    </div>

                    {/* Animation Type & Staff Present */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div>
                            <label className="text-[10px] font-bold text-slate-400 dark:text-gray-400 uppercase tracking-widest mb-2 block">Type d'animation</label>
                            <select
                                value={activity.staffing?.animationType || 'Interne'}
                                onChange={e => updateActivity({ staffing: { ...activity.staffing, animationType: e.target.value as any } })}
                                className={cn(inputBase, "text-xs font-bold")}
                            >
                                <option value="Interne">Animation Interne (Équipe MDJ)</option>
                                <option value="Partenaire">Animation Partenaire (Externe)</option>
                                <option value="Mixte">Animation Mixte (Co-animation)</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-[10px] font-bold text-slate-400 dark:text-gray-400 uppercase tracking-widest mb-3 block">Intervenants présents</label>
                            <div className="flex flex-col gap-3">
                                <select
                                    onChange={(e) => {
                                        const name = e.target.value;
                                        if (name && !presentStaff.includes(name)) {
                                            toggleStaff(name);
                                        }
                                        e.target.value = "";
                                    }}
                                    className={cn(inputBase, "text-xs font-normal")}
                                >
                                    <option value="" className="text-slate-900">Ajouter un intervenant...</option>
                                    {STAFF_NAMES.filter(n => !presentStaff.includes(n)).map(name => (
                                        <option key={name} value={name} className="text-slate-900">{name}</option>
                                    ))}
                                </select>

                                <div className="flex flex-wrap gap-2">
                                    {presentStaff.map(name => (
                                        <div key={name} className="flex items-center gap-1.5 bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 text-indigo-700 dark:text-indigo-300 px-3 py-1.5 rounded-xl text-xs font-bold uppercase animate-in zoom-in-95 group">
                                            {name}
                                            <button onClick={() => toggleStaff(name)} className="text-indigo-400 hover:text-red-500 transition-colors">
                                                <X className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Other staff */}
                            <div className="flex items-center gap-2 mt-3">
                                <input
                                    type="text"
                                    value={otherStaff}
                                    onChange={e => setOtherStaff(e.target.value)}
                                    placeholder="Autre intervenant / Stagiaire..."
                                    className={cn(inputBase, "text-xs font-normal flex-1")}
                                    onKeyDown={e => {
                                        if (e.key === 'Enter' && otherStaff.trim()) {
                                            toggleStaff(otherStaff.trim());
                                            setOtherStaff('');
                                        }
                                    }}
                                />
                                <button
                                    onClick={() => {
                                        if (otherStaff.trim()) {
                                            toggleStaff(otherStaff.trim());
                                            setOtherStaff('');
                                        }
                                    }}
                                    className="p-2 bg-slate-100 dark:bg-white/10 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 rounded-xl transition-colors"
                                >
                                    <Plus className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ═══════════════════════════════════════════════════════════════ */}
            {/* SECTION 2 — FRÉQUENTATION                                     */}
            {/* ═══════════════════════════════════════════════════════════════ */}
            <div className={sectionCard}>
                <div className="flex items-center justify-between mb-5">
                    <h3 className={cn(sectionTitle, "text-slate-700 dark:text-white mb-0")}>
                        <span className="flex items-center justify-center w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-sm font-black">2</span>
                        Fréquentation
                    </h3>
                    <span className="px-3 py-1 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-black rounded-full uppercase">
                        {totalParticipants} Présents
                    </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Left: Manual count + search */}
                    <div className="space-y-4">
                        <div>
                            <label className="text-[10px] font-bold text-slate-400 dark:text-gray-400 uppercase mb-1 block">Nombre total (Manuel/Import)</label>
                            <input
                                type="number" min="0"
                                placeholder="Calcul automatique..."
                                className={cn(inputBase, "text-sm font-normal")}
                                value={(activity.stats.presentMale + activity.stats.presentFemale + activity.stats.presentNonBinary) || ''}
                                readOnly
                            />
                            <p className="text-[10px] text-slate-400 mt-1 italic">Laissez vide pour utiliser le compte de la liste.</p>
                        </div>

                        {/* Member search */}
                        <div className="flex items-center gap-2">
                            <input
                                type="text"
                                placeholder="Rechercher un jeune..."
                                value={searchMember}
                                onChange={e => { setSearchMember(e.target.value); setShowMemberSelect(true); }}
                                onFocus={() => setShowMemberSelect(true)}
                                className={cn(inputBase, "text-xs font-normal flex-1")}
                            />
                            <button
                                onClick={() => setShowMemberSelect(!showMemberSelect)}
                                className="p-2 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-200 rounded-xl transition-colors"
                            >
                                <Plus className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Dropdown results */}
                        {showMemberSelect && (
                            <div className="border border-slate-200 dark:border-white/10 rounded-xl max-h-40 overflow-y-auto bg-white dark:bg-gray-900 shadow-lg">
                                {filteredMembers.map(m => {
                                    const displayName = `${m.firstName} ${m.lastName} (${m.code})`;
                                    const isSelected = (activity.stats.participantsList || []).includes(displayName);
                                    return (
                                        <button
                                            key={m.id}
                                            disabled={isSelected}
                                            onClick={() => { addSpecificMember([displayName]); setSearchMember(''); }}
                                            className={cn(
                                                "w-full text-left px-3 py-2 text-xs font-medium transition-colors flex justify-between border-b border-slate-100 dark:border-white/5 last:border-none",
                                                isSelected ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-400 cursor-not-allowed" : "hover:bg-indigo-50 dark:hover:bg-indigo-500/10 text-slate-700 dark:text-gray-300"
                                            )}
                                        >
                                            <span className="text-slate-900 dark:text-gray-200">{m.firstName} {m.lastName}</span>
                                            <span className="text-[9px] uppercase font-bold text-slate-400">{m.code}</span>
                                        </button>
                                    );
                                })}
                                {filteredMembers.length === 0 && (
                                    <div className="p-3 text-center">
                                        <p className="text-xs text-slate-400">Aucun membre trouvé.</p>
                                        {searchMember.trim() && (
                                            <button
                                                onClick={() => { addSpecificMember([searchMember.trim() + " (Visiteur)"]); setSearchMember(''); }}
                                                className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 mt-1 hover:underline"
                                            >
                                                + Ajouter "{searchMember}" comme visiteur
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Participant tags */}
                        <div className="min-h-[120px] bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-2xl p-3 overflow-y-auto">
                            <div className="flex flex-wrap gap-2">
                                {(activity.stats.participantsList || []).map((name, idx) => (
                                    <div key={idx} className="flex items-center gap-1 bg-indigo-500/10 border border-indigo-500/20 text-indigo-700 dark:text-indigo-300 px-2 py-1 rounded-lg text-xs font-medium group">
                                        {name}
                                        <button onClick={() => handleRemoveParticipant(idx)} className="text-indigo-400 hover:text-red-500 opacity-50 group-hover:opacity-100 transition-opacity">
                                            <X className="w-3 h-3" />
                                        </button>
                                    </div>
                                ))}
                                {(activity.stats.participantsList || []).length === 0 && (
                                    <p className="text-xs text-slate-400 italic text-center w-full py-8">Aucun jeune identifié.</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right: Gender breakdown */}
                    <div className="space-y-4">
                        <div className="grid grid-cols-4 gap-3">
                            {[
                                { label: 'Garçons', key: 'presentMale' as const, color: 'text-blue-600 dark:text-blue-400' },
                                { label: 'Filles', key: 'presentFemale' as const, color: 'text-pink-600 dark:text-pink-400' },
                                { label: 'Div./NB', key: 'presentNonBinary' as const, color: 'text-purple-600 dark:text-purple-400' },
                                { label: 'Nouveaux', key: 'newMembers' as const, color: 'text-emerald-600 dark:text-emerald-400' },
                            ].map(field => (
                                <div key={field.key} className="text-center space-y-1">
                                    <input
                                        type="number" min="0"
                                        value={activity.stats[field.key]}
                                        onChange={e => updateStats({ [field.key]: parseInt(e.target.value) || 0 })}
                                        className={cn("w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl px-2 py-3 text-center text-lg font-black outline-none focus:border-indigo-500", field.color)}
                                    />
                                    <p className="text-[9px] font-bold text-slate-400 dark:text-gray-400 uppercase">{field.label}</p>
                                </div>
                            ))}
                        </div>

                        {/* Age brackets */}
                        <div className="pt-4 border-t border-slate-100 dark:border-white/10">
                            <label className="text-[10px] font-bold text-slate-500 dark:text-gray-400 uppercase mb-2 block">Tranches d'âge (PSOC)</label>
                            <div className="grid grid-cols-3 gap-3">
                                {[
                                    { label: '12-14', key: 'age12_14' as const },
                                    { label: '15-17', key: 'age15_17' as const },
                                    { label: '18+', key: 'age18plus' as const },
                                ].map(field => (
                                    <div key={field.key} className="space-y-1">
                                        <label className="text-[10px] font-bold text-slate-400 dark:text-gray-400 uppercase">{field.label}</label>
                                        <input type="number" min="0" value={activity.stats[field.key] || 0} onChange={e => updateStats({ [field.key]: parseInt(e.target.value) || 0 })} className={cn(inputBase, "text-center text-sm")} />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ═══════════════════════════════════════════════════════════════ */}
            {/* SECTION 3 — ANIMATION & ACTIVITÉS (Issue de planification)   */}
            {/* ═══════════════════════════════════════════════════════════════ */}
            <div className={sectionCard}>
                <div className="flex items-center justify-between mb-4">
                    <h3 className={cn(sectionTitle, "text-slate-700 dark:text-white mb-0")}>
                        <span className="flex items-center justify-center w-8 h-8 rounded-xl bg-orange-100 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400 text-sm font-black">3</span>
                        Animation & Activités
                    </h3>
                    <span className="px-2 py-0.5 bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 text-[8px] font-black uppercase rounded-md tracking-tighter">
                        Planifié
                    </span>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="text-[10px] font-bold text-slate-400 dark:text-gray-400 uppercase tracking-widest mb-2 block">Types d'activités</label>
                        <div className="space-y-3">
                            <select
                                onChange={(e) => {
                                    const val = e.target.value;
                                    if (val) {
                                        const current = activity.types || [];
                                        if (!current.includes(val as any)) {
                                            updateActivity({ types: [...current, val as any] });
                                        }
                                    }
                                    e.target.value = "";
                                }}
                                className={cn(inputBase, "text-xs font-normal")}
                            >
                                <option value="" className="text-slate-900">Ajouter un type d'activité...</option>
                                {RMJQ_VOLETS.filter(v => !(activity.types || []).includes(v)).map(v => (
                                    <option key={v} value={v} className="text-slate-900">{v}</option>
                                ))}
                            </select>

                            <div className="flex flex-wrap gap-2">
                                {(activity.types || []).map(t => (
                                    <div key={t} className="flex items-center gap-1.5 bg-orange-50 dark:bg-orange-500/10 border border-orange-100 dark:border-orange-500/20 text-orange-700 dark:text-orange-400 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase group">
                                        {t}
                                        <button
                                            onClick={() => {
                                                const current = activity.types || [];
                                                updateActivity({ types: current.filter(item => item !== t) });
                                            }}
                                            className="text-orange-400 hover:text-red-500 transition-colors"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    </div>
                                ))}
                                {(activity.types || []).length === 0 && <span className="text-[10px] text-slate-400 italic">Aucun type sélectionné</span>}
                            </div>
                        </div>
                    </div>

                    <div>
                        <div className="flex justify-between items-center mb-2 px-1">
                            <label className="text-[10px] font-black text-slate-400 dark:text-gray-400 uppercase tracking-widest block">Description / Déroulement</label>
                            <div className="flex items-center gap-3">
                                <AICorrectButton 
                                    text={activity.description || ''} 
                                    onCorrect={corrected => updateActivity({ description: corrected })}
                                    variant="button"
                                    className="h-7"
                                />
                                <button
                                    onClick={handleAIRefine}
                                    disabled={isRefining || !activity.description?.trim()}
                                    className={cn(
                                        "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                                        isRefining
                                            ? "bg-slate-100 text-slate-400 animate-pulse cursor-wait"
                                            : "bg-orange-50 text-orange-600 hover:bg-orange-100 dark:bg-orange-500/10 dark:text-orange-400 dark:hover:bg-orange-500/20"
                                    )}
                                    title="Raffiner le texte avec l'IA"
                                >
                                    <Sparkles className={cn("w-3 h-3", isRefining && "animate-spin")} />
                                    {isRefining ? "Amélioration..." : "Magie IA"}
                                </button>
                            </div>
                        </div>
                        <textarea
                            value={activity.description || ''}
                            onChange={e => updateActivity({ description: e.target.value })}
                            rows={4}
                            className={cn(inputBase, "font-normal text-sm rounded-2xl")}
                            placeholder="Décrivez le déroulement de la soirée..."
                        />
                    </div>
                </div>
            </div>

            {/* ═══════════════════════════════════════════════════════════════ */}
            {/* SECTION 4 — CLIMAT & DYNAMIQUE DE GROUPE                      */}
            {/* ═══════════════════════════════════════════════════════════════ */}
            <div className={sectionCard}>
                <h3 className={cn(sectionTitle, "text-slate-700 dark:text-white")}>
                    <span className="flex items-center justify-center w-8 h-8 rounded-xl bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 text-sm font-black">4</span>
                    Climat & Dynamique de groupe
                </h3>

                <div className="space-y-6">
                    {/* Climate checkboxes */}
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <label className="text-[10px] font-bold text-slate-400 dark:text-gray-400 uppercase tracking-widest block">Climat général (Checklist rapide)</label>
                            <span className="text-[9px] font-black text-purple-500 uppercase">Multi-choix</span>
                        </div>
                        <div className="space-y-4">
                            <select
                                onChange={(e) => {
                                    const label = e.target.value;
                                    if (label && !groupClimate.includes(label)) {
                                        toggleClimate(label);
                                    }
                                    e.target.value = "";
                                }}
                                className={cn(inputBase, "text-xs font-normal")}
                            >
                                <option value="" className="text-slate-900">Ajouter un indicateur de climat...</option>
                                {GROUP_CLIMATE_OPTIONS.filter(o => !groupClimate.includes(o.label)).map(opt => (
                                    <option key={opt.label} value={opt.label} className="text-slate-900">{opt.icon} {opt.label}</option>
                                ))}
                            </select>

                            <div className="flex flex-wrap gap-2">
                                {groupClimate.map(label => {
                                    const opt = GROUP_CLIMATE_OPTIONS.find(o => o.label === label);
                                    return (
                                        <div key={label} className="flex items-center gap-1.5 bg-purple-50 dark:bg-purple-500/10 border border-purple-100 dark:border-purple-500/20 text-purple-700 dark:text-purple-400 px-3 py-1.5 rounded-xl text-xs font-bold uppercase animate-in zoom-in-95 group">
                                            <span className="text-sm">{opt?.icon}</span>
                                            {label}
                                            <button onClick={() => toggleClimate(label)} className="text-purple-400 hover:text-red-500 transition-colors">
                                                <X className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Additional Clinical Indicators (New) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-100 dark:border-white/10">
                        <div>
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">Qualité des relations</label>
                            <select
                                value={activity.clinicalObservations?.relationshipQuality || ""}
                                onChange={(e) => updateClinical({ relationshipQuality: e.target.value })}
                                className={cn(inputBase, "text-xs font-normal")}
                            >
                                <option value="" className="text-slate-900">Sélectionner la qualité...</option>
                                {['Excellente', 'Harmonieuse', 'Neutre', 'Tension passagère', 'Conflits ouverts'].map(q => (
                                    <option key={q} value={q} className="text-slate-900">{q}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">Besoins / Suivis</label>
                            <div className="space-y-4">
                                <select
                                    onChange={(e) => {
                                        const s = e.target.value;
                                        if (s) {
                                            const current = activity.clinicalObservations?.followUpPlanning || '';
                                            const isSelected = current.includes(s);
                                            if (!isSelected) {
                                                const updated = current ? `${current}, ${s}` : s;
                                                updateClinical({ followUpPlanning: updated });
                                            }
                                        }
                                        e.target.value = "";
                                    }}
                                    className={cn(inputBase, "text-xs font-normal")}
                                >
                                    <option value="" className="text-slate-900">Ajouter un suivi...</option>
                                    {['Aucun', 'Renforcer le cadre', 'Médiation groupe', 'Suivi individuel', 'Info parents']
                                        .filter(s => !(activity.clinicalObservations?.followUpPlanning || '').split(',').map(item => item.trim()).includes(s))
                                        .map(s => (
                                            <option key={s} value={s} className="text-slate-900">{s}</option>
                                        ))}
                                </select>

                                <div className="flex flex-wrap gap-2">
                                    {(activity.clinicalObservations?.followUpPlanning || '').split(',').map(s => s.trim()).filter(Boolean).map(s => (
                                        <div key={s} className="flex items-center gap-1.5 bg-rose-50 dark:bg-rose-500/10 border border-rose-100 dark:border-rose-500/20 text-rose-700 dark:text-rose-400 px-3 py-1.5 rounded-xl text-xs font-bold uppercase animate-in zoom-in-95 group">
                                            {s}
                                            <button
                                                onClick={() => {
                                                    const current = activity.clinicalObservations?.followUpPlanning || '';
                                                    const updated = current.split(',').map(item => item.trim()).filter(item => item !== s).join(', ');
                                                    updateClinical({ followUpPlanning: updated });
                                                }}
                                                className="text-rose-400 hover:text-red-500 transition-colors"
                                            >
                                                <X className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Dynamics notes */}
                    <div>
                        <div className="flex justify-between items-center mb-2 px-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Notes complémentaires sur la dynamique</label>
                            <AICorrectButton 
                                text={activity.clinicalObservations?.groupDynamicsNotes || ''} 
                                onCorrect={corrected => updateClinical({ groupDynamicsNotes: corrected })}
                                variant="button"
                                className="h-7"
                            />
                        </div>
                        <textarea
                            value={activity.clinicalObservations?.groupDynamicsNotes || ''}
                            onChange={e => updateClinical({ groupDynamicsNotes: e.target.value })}
                            rows={3}
                            className={cn(inputBase, "font-normal text-sm rounded-2xl")}
                            placeholder="Détaillez ici les faits marquants si nécessaire..."
                        />
                    </div>
                </div>
            </div>

            {/* ═══════════════════════════════════════════════════════════════ */}
            {/* SECTION 5 — INTERVENTIONS (Données protégées)                 */}
            {/* ═══════════════════════════════════════════════════════════════ */}
            <div className="bg-white dark:bg-gray-800/40 rounded-3xl p-6 border-2 border-rose-200 dark:border-rose-500/30 shadow-sm relative overflow-hidden transition-all">
                <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/5 rounded-bl-full" />

                <div className="flex items-center justify-between mb-5 relative z-10">
                    <h3 className={cn(sectionTitle, "text-slate-700 dark:text-rose-100 mb-0")}>
                        <span className="flex items-center justify-center w-8 h-8 rounded-xl bg-rose-100 dark:bg-rose-500/30 text-rose-600 dark:text-rose-300 text-sm font-black">5</span>
                        <Shield className="w-4 h-4 text-rose-500" />
                        Interventions (Données protégées)
                    </h3>
                    <span className="px-3 py-1 bg-rose-100 dark:bg-rose-500/30 text-rose-600 dark:text-rose-300 text-[10px] font-black rounded-full uppercase tracking-widest">
                        🔒 Accès Restreint
                    </span>
                </div>
            </div>

            <div className="space-y-6 relative z-10">
                {/* Member Datalist for easy selection - Filtered by Age (<= 18) */}
                <datalist id="member-names">
                    {members
                        .filter(m => calculateAge(m.birthDate) <= 18)
                        .map(m => (
                            <option key={m.id} value={`${m.firstName} ${m.lastName}`} />
                        ))}
                </datalist>

                {/* Significant exchanges counter */}
                {/* Significant exchanges counter */}
                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-rose-950/20 rounded-2xl border border-slate-200 dark:border-rose-500/20">
                    <div>
                        <p className="text-sm font-bold text-slate-700 dark:text-rose-100">Échanges significatifs</p>
                        <p className="text-[10px] text-slate-400 dark:text-rose-300/60">Interventions informelles ou courtes</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => updateClinical({ significantExchanges: Math.max(0, significantExchanges - 1) })}
                            className="w-10 h-10 flex items-center justify-center bg-white dark:bg-gray-800 border border-slate-200 dark:border-white/10 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors dark:text-white"
                        >
                            <Minus className="w-4 h-4" />
                        </button>
                        <span className="text-2xl font-black text-slate-800 dark:text-rose-200 min-w-[40px] text-center">{significantExchanges}</span>
                        <button
                            onClick={() => updateClinical({ significantExchanges: significantExchanges + 1 })}
                            className="w-10 h-10 flex items-center justify-center bg-white dark:bg-gray-800 border border-slate-200 dark:border-white/10 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors dark:text-white"
                        >
                            <Plus className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Intervention notes */}
                <div>
                    <div className="flex items-center justify-between mb-3">
                        <h4 className="text-xs font-black uppercase tracking-widest text-rose-600 dark:text-rose-400">
                            Notes d'intervention ({interventionNotes.length})
                        </h4>
                    </div>

                    {/* Existing notes */}
                    <div className="space-y-3 mb-4">
                        {interventionNotes.map(note => (
                            <div key={note.id} className="bg-rose-50/50 dark:bg-rose-950/20 border-2 border-rose-200 dark:border-rose-500/20 rounded-2xl p-4 space-y-3 shadow-sm">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
                                        <select
                                            value={note.type}
                                            onChange={e => updateNote(note.id, { type: e.target.value })}
                                            className="text-xs font-bold bg-white dark:bg-gray-900 text-slate-700 dark:text-rose-100 border border-slate-200 dark:border-rose-500/30 rounded-lg px-2 py-1 outline-none focus:border-rose-500 transition-colors"
                                        >
                                            {['Écoute active', 'Médiation', 'Référence externe', 'Suivi individuel', 'Gestion de crise', 'Autre'].map(t => (
                                                <option key={t} value={t} className="text-slate-900 dark:text-white bg-white dark:bg-gray-900">{t}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <button onClick={() => removeNote(note.id)} className="text-slate-400 hover:text-red-500 transition-colors p-1">
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                                <input
                                    type="text"
                                    list="member-names"
                                    value={note.youthName}
                                    onChange={e => updateNote(note.id, { youthName: e.target.value })}
                                    placeholder="Nom du jeune (Recherche ou manuel)"
                                    className="w-full bg-white dark:bg-gray-900/50 border border-slate-200 dark:border-rose-500/20 rounded-xl px-4 py-2 text-xs font-bold text-slate-900 dark:text-white outline-none focus:border-rose-500 placeholder-slate-400 dark:placeholder-rose-300/30 transition-all"
                                />
                                <div className="relative group">
                                    <textarea
                                        value={note.description}
                                        onChange={e => updateNote(note.id, { description: e.target.value })}
                                        rows={2}
                                        placeholder="Description factuelle de l'intervention..."
                                        className="w-full bg-white dark:bg-gray-900/50 border border-slate-200 dark:border-rose-500/20 rounded-xl px-4 py-2 text-xs text-slate-900 dark:text-white outline-none focus:border-rose-500 placeholder-slate-400 dark:placeholder-rose-300/30 transition-all"
                                    />
                                    <AICorrectButton 
                                        text={note.description} 
                                        onCorrect={corrected => updateNote(note.id, { description: corrected })}
                                        className="absolute right-2 top-2"
                                    />
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Add note button */}
                    <button
                        onClick={addInterventionNote}
                        className="w-full flex items-center justify-center gap-2 bg-white dark:bg-gray-800 border-2 border-dashed border-rose-300 dark:border-rose-500/30 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 py-3 rounded-xl text-xs font-bold uppercase transition-colors"
                    >
                        <Plus className="w-4 h-4" />
                        Ajouter une note
                    </button>
                </div>
            </div>

            {/* ═══════════════════════════════════════════════════════════════ */}
            {/* SECTION 6 — INDICATEURS COMMUNAUTAIRES (PSOC)                 */}
            {/* ═══════════════════════════════════════════════════════════════ */}
            <div className={sectionCard}>
                <h3 className={cn(sectionTitle, "text-slate-700 dark:text-white")}>
                    <span className="flex items-center justify-center w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 text-sm font-black">6</span>
                    Implication Communautaire (ACA)
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Bénévolat */}
                    <div className="space-y-4">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Valorisation du bénévolat</label>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="text-[9px] font-bold text-slate-400 uppercase">Heures (Adultes)</label>
                                <input
                                    type="number" min="0" step="0.5"
                                    value={activity.communityIndicators?.volunteerHours || 0}
                                    onChange={e => updateActivity({ communityIndicators: { ...activity.communityIndicators, volunteerHours: parseFloat(e.target.value) || 0 } })}
                                    className={cn(inputBase, "text-sm")}
                                />
                            </div>
                            <div>
                                <label className="text-[9px] font-bold text-slate-400 uppercase">Heures (Jeunes)</label>
                                <input
                                    type="number" min="0" step="0.5"
                                    value={activity.communityIndicators?.youthVolunteerHours || 0}
                                    onChange={e => updateActivity({ communityIndicators: { ...activity.communityIndicators, youthVolunteerHours: parseFloat(e.target.value) || 0 } })}
                                    className={cn(inputBase, "text-sm")}
                                />
                            </div>
                        </div>
                        <input
                            type="text"
                            placeholder="Partenariats actifs (noms des organismes)..."
                            value={activity.communityIndicators?.partnerships || ''}
                            onChange={e => updateActivity({ communityIndicators: { ...activity.communityIndicators, partnerships: e.target.value } })}
                            className={cn(inputBase, "text-xs")}
                        />
                    </div>

                    {/* Financement & Dons */}
                    <div className="space-y-4 p-4 bg-amber-50 dark:bg-amber-950/20 rounded-2xl border border-amber-100 dark:border-amber-500/20">
                        <div className="flex items-center gap-2 mb-2">
                            <input
                                type="checkbox"
                                checked={activity.communityIndicators?.isFundingActivity || false}
                                onChange={e => updateActivity({ communityIndicators: { ...activity.communityIndicators, isFundingActivity: e.target.checked } })}
                                className="w-4 h-4 rounded text-amber-600"
                            />
                            <label className="text-[10px] font-black text-amber-900 dark:text-amber-200 uppercase tracking-widest">Activité d'autofinancement</label>
                        </div>

                        {activity.communityIndicators?.isFundingActivity && (
                            <div className="animate-in fade-in slide-in-from-top-2">
                                <label className="text-[9px] font-bold text-amber-700 dark:text-amber-400 uppercase">Montant amassé ($)</label>
                                <input
                                    type="number" min="0"
                                    value={activity.communityIndicators?.fundingAmount || 0}
                                    onChange={e => updateActivity({ communityIndicators: { ...activity.communityIndicators, fundingAmount: parseFloat(e.target.value) || 0 } })}
                                    className={cn(inputBase, "bg-white dark:bg-gray-900 border-amber-200 text-sm")}
                                    placeholder="0.00"
                                />
                            </div>
                        )}

                        <div>
                            <label className="text-[9px] font-bold text-amber-700 dark:text-amber-400 uppercase">Dons matériels / Commandites</label>
                            <textarea
                                value={activity.communityIndicators?.materialDonations || ''}
                                onChange={e => updateActivity({ communityIndicators: { ...activity.communityIndicators, materialDonations: e.target.value } })}
                                rows={2}
                                className={cn(inputBase, "bg-white dark:bg-gray-900 border-amber-200 text-xs font-normal")}
                                placeholder="Jeux, nourriture, équipements reçus..."
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div >
    );
};

export default JournalDeBordTab;
