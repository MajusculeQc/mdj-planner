import React, { useState } from 'react';
import { MapPin, Phone, Globe, Truck, Car, Users, Clock, DollarSign, ExternalLink, BookOpen, Sparkles, Facebook, Plus, Mail, Lock } from 'lucide-react';
import { Activity, Logistics } from '../../types';
import { cn } from '../../lib/utils';
import { SUGGESTIONS, VENUES, ECOSYSTEME_PARTENAIRES, SERVICES_CIVIQUES, normalizeVenueName } from '../../lib/constants';
import { useCustomSuggestions } from '../../hooks/useCustomSuggestions';
import { useCustomPartners } from '../../hooks/useCustomPartners';
import { PartnerService } from '../../services/partnerService';
import AddPartnerModal from './AddPartnerModal';
import { AIIntelligenceService } from '../../services/aiIntelligenceService';

interface LogisticsTabProps {
    activity: Activity;
    updateLogistics: (updates: Partial<Logistics>) => void;
    updateActivity: (updates: Partial<Activity>) => void;
    readiness: any;
}

const LogisticsTab: React.FC<LogisticsTabProps> = ({ activity, updateLogistics, updateActivity, readiness }) => {
    const { logistics } = activity;
    const { customSuggestions } = useCustomSuggestions();
    const { customPartners, allVenues, refresh } = useCustomPartners();
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isRefining, setIsRefining] = useState(false);

    const handleAIRefine = async () => {
        if (!activity.description?.trim()) return;
        setIsRefining(true);
        try {
            const refined = await AIIntelligenceService.refineJDBNotes(activity.description, activity.title);
            if (refined) {
                updateActivity({ description: refined });
            }
        } catch (error) {
            console.error("AI refinement failed:", error);
        } finally {
            setIsRefining(false);
        }
    };

    const venueSuggestions = Array.from(new Set([
        ...SUGGESTIONS.venueName,
        ...(customSuggestions.venueName || [])
    ].map(normalizeVenueName)))
        .filter(v => v && v !== 'À déterminer' && v !== 'Trois-Rivières')
        .sort();

    const isWeekDay = () => {
        if (!activity.date) return false;
        const d = new Date(activity.date + 'T00:00:00');
        const day = d.getDay();
        return day >= 2 && day <= 5; // Mardi à Vendredi
    };

    const handleVenueSelect = (val: string) => {
        const venueData = allVenues[val as keyof typeof allVenues];
        if (venueData) {
            updateLogistics({
                venueName: venueData.name,
                address: venueData.address,
                phoneNumber: (venueData as any).phone || '',
                website: (venueData as any).website || null,
                facebook: (venueData as any).facebook || null,
                email: (venueData as any).email || null
            });
        } else {
            updateLogistics({ venueName: val });
        }
    };

    const handleSaveNewPartner = async (partner: any) => {
        await PartnerService.save(partner);
        await refresh();
        // Auto-select the newly created partner
        updateLogistics({
            venueName: partner.name,
            address: partner.address,
            phoneNumber: partner.phone || '',
            website: partner.website || null,
            facebook: partner.facebook || null,
            email: partner.email || null
        });
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
            {/* DESCRIPTION & AIDE AUX DEVOIRS */}
            <section className="bg-white dark:bg-white/5 rounded-3xl p-6 border border-slate-100 dark:border-white/10 shadow-sm transition-all hover:shadow-md">
                <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                    <div className="flex items-center gap-3 min-w-fit">
                        <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 text-indigo-600 dark:text-indigo-400">
                            <BookOpen className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 dark:text-white">Détails & Configuration</h3>
                            <p className="text-[10px] text-slate-400 dark:text-gray-500 font-bold uppercase tracking-widest mt-0.5">Description et options de la soirée</p>
                        </div>
                    </div>
                    <button
                        onClick={() => updateActivity({ hasHomeworkHelp: !activity.hasHomeworkHelp })}
                        className={cn(
                            "flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all shrink-0 ml-auto sm:ml-0",
                            activity.hasHomeworkHelp
                                ? "bg-cyan-500 text-white shadow-lg shadow-cyan-500/20 border border-cyan-400"
                                : "bg-slate-100 dark:bg-white/5 text-slate-400 border border-transparent hover:border-slate-300 dark:hover:border-white/20"
                        )}
                    >
                        <BookOpen className={cn("w-3.5 h-3.5", activity.hasHomeworkHelp ? "text-white" : "text-slate-400")} />
                        Aide aux devoirs
                    </button>
                    <button
                        onClick={() => updateActivity({ isMDJClosed: !activity.isMDJClosed })}
                        className={cn(
                            "flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all shrink-0 sm:ml-2",
                            activity.isMDJClosed
                                ? "bg-orange-500 text-white shadow-lg shadow-orange-500/20 border border-orange-400"
                                : "bg-slate-100 dark:bg-white/5 text-slate-400 border border-transparent hover:border-slate-300 dark:hover:border-white/20"
                        )}
                    >
                        <Lock className={cn("w-3.5 h-3.5", activity.isMDJClosed ? "text-white" : "text-slate-400")} />
                        MDJ Fermée
                    </button>
                </div>

                <div className="space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-2 px-1 mb-2">
                        <div className="flex flex-wrap items-center gap-2">
                            <label className="text-[10px] font-black text-slate-400 dark:text-gray-400 uppercase tracking-widest block">Intention Narrative & Déroulement</label>
                            {(activity.description || '').trim().length < 30 && <span className="px-1.5 py-0.5 rounded-md bg-red-500 text-white text-[7px] font-black uppercase animate-pulse whitespace-nowrap">MIN 30 CAR.</span>}
                        </div>
                        <button
                            onClick={handleAIRefine}
                            disabled={isRefining || !activity.description?.trim()}
                            className={cn(
                                "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ml-auto sm:ml-0",
                                isRefining
                                    ? "bg-slate-100 text-slate-400 animate-pulse cursor-wait"
                                    : "bg-indigo-50 text-indigo-600 hover:bg-indigo-100 dark:bg-indigo-500/10 dark:text-indigo-400 dark:hover:bg-indigo-500/20"
                            )}
                            title="Raffiner le texte avec l'IA"
                        >
                            <Sparkles className={cn("w-3 h-3", isRefining && "animate-spin")} />
                            {isRefining ? "Amélioration..." : "Magie IA"}
                        </button>
                    </div>
                    <textarea
                        value={activity.description}
                        onChange={(e) => updateActivity({ description: e.target.value })}
                        rows={3}
                        className={cn(
                            "w-full bg-slate-50 dark:bg-gray-800/50 border rounded-2xl px-5 py-4 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all",
                            ((activity.description || '').trim().length < 30 && !activity.isMDJClosed)
                                ? "border-red-500/30 bg-red-500/[0.01] shadow-[0_0_10px_rgba(239,68,68,0.05)]"
                                : "border-slate-200 dark:border-white/10"
                        )}
                        placeholder="Détaillez ici l'intention spécifique ou le déroulement de l'activité..."
                    />
                </div>
            </section>

            {/* VENUE SECTION */}
            <section className={cn(
                "bg-white dark:bg-white/5 rounded-3xl p-6 border transition-all hover:shadow-md relative overflow-hidden",
                (!logistics.venueName && !activity.isMDJClosed) ? "border-red-500/50 bg-red-500/[0.02] shadow-[0_0_20px_rgba(239,68,68,0.1)]" : "border-slate-100 dark:border-white/10 shadow-sm"
            )}>
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 text-indigo-600 dark:text-indigo-400">
                        <MapPin className="w-5 h-5" />
                    </div>
                    <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 dark:text-white">Lieu et Emplacement</h3>
                        {(!logistics.venueName && !activity.isMDJClosed) && <span className="px-2 py-0.5 rounded-md bg-red-500 text-white text-[8px] font-black uppercase animate-pulse shadow-lg shadow-red-500/20">REQUIS</span>}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* COLONNE GAUCHE : IDENTITÉ & LIEU */}
                    <div className="space-y-6">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-400 dark:text-gray-500 uppercase ml-1">Nom du lieu</label>
                            <div className="flex gap-2">
                                <select
                                    onChange={(e) => handleVenueSelect(e.target.value)}
                                    value={Object.values(allVenues).find(v => v.name === logistics.venueName) ? Object.keys(allVenues).find(k => allVenues[k as keyof typeof allVenues].name === logistics.venueName) : ""}
                                    className="flex-1 bg-slate-50 dark:bg-gray-800/50 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all appearance-none"
                                >
                                    <option value="" className="text-slate-900">Sélectionner un lieu...</option>

                                    {/* LIEU PAR DÉFAUT */}
                                    <option value="MDJ Escale Jeunesse - La Piaule" className="text-slate-900 font-bold">
                                        MDJ Escale Jeunesse - La Piaule (Défaut)
                                    </option>

                                    {/* ÉCOSYSTÈMES CATÉGORISÉS */}
                                    {Object.entries(ECOSYSTEME_PARTENAIRES).map(([category, partners]) => (
                                        <optgroup key={category} label={category}>
                                            {Object.keys(partners).map(p => (
                                                <option key={p} value={p}>
                                                    {p}
                                                </option>
                                            ))}
                                        </optgroup>
                                    ))}

                                    {/* PARTENAIRES PERSONNALISÉS (DYNAMIQUES) */}
                                    {customPartners.length > 0 && (
                                        <optgroup label="Partenaires Ajoutés">
                                            {customPartners.map(p => (
                                                <option key={p.id} value={p.name}>
                                                    {p.name}
                                                </option>
                                            ))}
                                        </optgroup>
                                    )}

                                    {/* AUTRES LIEUX ET SERVICES */}
                                    <optgroup label="Autres Lieux et Services">
                                        {Object.keys(SERVICES_CIVIQUES).map(s => (
                                            <option key={s} value={s}>
                                                {s}
                                            </option>
                                        ))}
                                    </optgroup>
                                </select>
                                <button
                                    type="button"
                                    onClick={() => setIsAddModalOpen(true)}
                                    className="p-2.5 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-500/10 transition-all active:scale-95"
                                    title="Ajouter un nouveau partenaire"
                                >
                                    <Plus className="w-5 h-5" />
                                </button>
                            </div>
                            <input
                                type="text"
                                value={logistics.venueName}
                                onChange={(e) => updateLogistics({ venueName: e.target.value })}
                                placeholder="Ou entrez un nom manuellement..."
                                className="w-full bg-slate-50 dark:bg-gray-800/50 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all mt-2"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-400 dark:text-gray-500 uppercase ml-1 flex items-center gap-1.5">
                                <MapPin className="w-3 h-3" /> Adresse complète
                            </label>
                            <textarea
                                value={logistics.address}
                                onChange={(e) => updateLogistics({ address: e.target.value })}
                                rows={3}
                                className="w-full bg-slate-50 dark:bg-gray-800/50 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                                placeholder="Adresse, Ville, Code Postal..."
                            />
                        </div>
                    </div>

                    {/* COLONNE DROITE : COORDONNÉES & LIENS */}
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-slate-400 dark:text-gray-500 uppercase ml-1 flex items-center gap-1.5">
                                    <Phone className="w-3 h-3" /> Téléphone
                                </label>
                                <input
                                    type="text"
                                    value={logistics.phoneNumber || ''}
                                    onChange={(e) => updateLogistics({ phoneNumber: e.target.value })}
                                    className="w-full bg-slate-50 dark:bg-gray-800/50 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                                    placeholder="Coordonnées..."
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-slate-400 dark:text-gray-500 uppercase ml-1 flex items-center gap-1.5">
                                    <Mail className="w-3 h-3" /> Courriel
                                </label>
                                <input
                                    type="email"
                                    value={logistics.email || ''}
                                    onChange={(e) => updateLogistics({ email: e.target.value })}
                                    className="w-full bg-slate-50 dark:bg-gray-800/50 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                                    placeholder="contact@..."
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-400 dark:text-gray-500 uppercase ml-1 flex items-center gap-1.5">
                                <Globe className="w-3 h-3" /> Site Web
                            </label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={logistics.website || ''}
                                    onChange={(e) => updateLogistics({ website: e.target.value })}
                                    className="flex-1 bg-slate-50 dark:bg-gray-800/50 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                                    placeholder="https://..."
                                />
                                {logistics.website && (
                                    <a href={logistics.website} target="_blank" rel="noopener noreferrer" className="p-2 bg-slate-100 dark:bg-white/5 rounded-xl hover:text-indigo-500 transition-all">
                                        <ExternalLink className="w-4 h-4" />
                                    </a>
                                )}
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-400 dark:text-gray-500 uppercase ml-1 flex items-center gap-1.5">
                                <Facebook className="w-3 h-3 text-blue-600" /> Page Facebook
                            </label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={logistics.facebook || ''}
                                    onChange={(e) => updateLogistics({ facebook: e.target.value })}
                                    className="flex-1 bg-slate-50 dark:bg-gray-800/50 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                                    placeholder="Lien social..."
                                />
                                {logistics.facebook && (
                                    <a href={logistics.facebook} target="_blank" rel="noopener noreferrer" className="p-2 bg-slate-100 dark:bg-white/5 rounded-xl hover:text-blue-600 transition-all">
                                        <Facebook className="w-4 h-4" />
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* TRANSPORT SECTION (REPLACKED INDIVIDUALLY) */}
            <section className={cn(
                "bg-white dark:bg-white/5 rounded-3xl p-6 border transition-all hover:shadow-md relative overflow-hidden",
                (logistics.transportRequired && !logistics.transportMode && !activity.isMDJClosed) ? "border-red-500/50 bg-red-500/[0.02] shadow-[0_0_20px_rgba(239,68,68,0.1)]" : "border-slate-100 dark:border-white/10 shadow-sm"
            )}>
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-cyan-50 dark:bg-cyan-500/10 border border-cyan-100 dark:border-cyan-500/20 text-cyan-600 dark:text-cyan-400">
                            <Truck className="w-5 h-5" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 dark:text-white">Transport et Déplacement</h3>
                                {(logistics.transportRequired && !logistics.transportMode && !activity.isMDJClosed) && <span className="px-2 py-0.5 rounded-md bg-red-500 text-white text-[8px] font-black uppercase animate-pulse shadow-lg shadow-red-500/20">REQUIS</span>}
                            </div>
                            <p className="text-[10px] text-slate-400 dark:text-gray-500 font-bold uppercase tracking-widest mt-0.5">L'activité nécessite un déplacement</p>
                        </div>
                    </div>
                    <button
                        onClick={() => updateLogistics({ transportRequired: !logistics.transportRequired })}
                        className={cn(
                            "relative inline-flex h-6 w-11 items-center rounded-full transition-colors outline-none",
                            logistics.transportRequired ? "bg-cyan-500" : "bg-slate-300 dark:bg-white/20"
                        )}
                    >
                        <span className={cn(
                            "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                            logistics.transportRequired ? "translate-x-6" : "translate-x-1"
                        )} />
                    </button>
                </div>

                {logistics.transportRequired && (
                    <div className="space-y-6 animate-in slide-in-from-top-4 duration-300">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-slate-400 dark:text-gray-500 uppercase ml-1 flex items-center gap-1.5">
                                    <Car className="w-3 h-3" /> Mode de transport
                                </label>
                                <div className="relative group">
                                    <select
                                        value={logistics.transportMode || ''}
                                        onChange={(e) => updateLogistics({ transportMode: e.target.value })}
                                        className="w-full bg-slate-50 dark:bg-gray-800/50 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-cyan-500/20 outline-none appearance-none transition-all"
                                    >
                                        <option value="">Sélectionner...</option>
                                        <option value="Autobus MDJ">Autobus MDJ</option>
                                        <option value="Autobus Ville">Autobus Ville</option>
                                        <option value="Marche">Marche</option>
                                        <option value="Vélo">Vélo</option>
                                        <option value="Covoiturage">Covoiturage</option>
                                    </select>
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-slate-400 dark:text-gray-500 uppercase ml-1 flex items-center gap-1.5">
                                    <Clock className="w-3 h-3" /> Départ
                                </label>
                                <input
                                    type="time"
                                    value={logistics.departureTime || ''}
                                    onChange={(e) => updateLogistics({ departureTime: e.target.value })}
                                    className="w-full bg-slate-50 dark:bg-gray-800/50 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2 text-sm text-slate-900 focus:ring-2 focus:ring-cyan-500/20 outline-none transition-all"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-slate-400 dark:text-gray-500 uppercase ml-1 flex items-center gap-1.5">
                                    <Clock className="w-3 h-3" /> Retour
                                </label>
                                <input
                                    type="time"
                                    value={logistics.returnTime || ''}
                                    onChange={(e) => updateLogistics({ returnTime: e.target.value })}
                                    className="w-full bg-slate-50 dark:bg-gray-800/50 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2 text-sm text-slate-900 focus:ring-2 focus:ring-cyan-500/20 outline-none transition-all"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-slate-400 dark:text-gray-500 uppercase ml-1 flex items-center gap-1.5">
                                    <MapPin className="w-3 h-3" /> Point de rdv
                                </label>
                                <input
                                    type="text"
                                    value={logistics.meetingPoint || ''}
                                    onChange={(e) => updateLogistics({ meetingPoint: e.target.value })}
                                    className="w-full bg-slate-50 dark:bg-gray-800/50 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2 text-sm text-slate-900 focus:ring-2 focus:ring-cyan-500/20 outline-none transition-all"
                                    placeholder="ex: Stationnement MDJ"
                                />
                            </div>
                        </div>
                    </div>
                )}
            </section>

            {/* COST SECTION */}
            <section className={cn(
                "bg-white dark:bg-white/5 rounded-3xl p-6 border transition-all hover:shadow-md relative overflow-hidden",
                ((logistics.costPerPerson === undefined || logistics.costPerPerson === null) && !logistics.isFree && !activity.isMDJClosed) ? "border-red-500/50 bg-red-500/[0.02] shadow-[0_0_20px_rgba(239,68,68,0.1)]" : "border-slate-100 dark:border-white/10 shadow-sm"
            )}>
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-green-50 dark:bg-green-500/10 border border-green-100 dark:border-green-500/20 text-green-600 dark:text-green-400">
                            <DollarSign className="w-5 h-5" />
                        </div>
                        <div className="flex items-center gap-2">
                            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 dark:text-white">Coût et Accessibilité</h3>
                            {(logistics.costPerPerson === undefined || logistics.costPerPerson === null) && !logistics.isFree && !activity.isMDJClosed && <span className="px-2 py-0.5 rounded-md bg-red-500 text-white text-[8px] font-black uppercase animate-pulse shadow-lg shadow-red-500/20">REQUIS</span>}
                        </div>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row gap-8 items-start">
                    <div className="flex-1 w-full space-y-4">
                        <div className="flex items-center gap-4">
                            <div className="flex-1 space-y-1.5">
                                <label className="text-[10px] font-bold text-slate-400 dark:text-gray-500 uppercase ml-1">Coût par personne ($)</label>
                                <div className="relative">
                                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input
                                        type="number"
                                        value={logistics.costPerPerson}
                                        onChange={(e) => updateLogistics({ costPerPerson: Number(e.target.value), isFree: Number(e.target.value) === 0 })}
                                        disabled={logistics.isFree}
                                        className={cn(
                                            "w-full bg-slate-50 dark:bg-gray-800/50 border border-slate-200 dark:border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm transition-all outline-none",
                                            logistics.isFree ? "opacity-30 cursor-not-allowed" : "text-slate-900 dark:text-white focus:ring-2 focus:ring-green-500/20"
                                        )}
                                        min="0"
                                        step="0.5"
                                    />
                                </div>
                            </div>
                            <div className="pt-6">
                                <button
                                    onClick={() => updateLogistics({ isFree: !logistics.isFree, costPerPerson: !logistics.isFree ? 0 : logistics.costPerPerson })}
                                    className={cn(
                                        "px-6 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all border flex items-center gap-2",
                                        logistics.isFree
                                            ? "bg-green-500 text-white border-green-400 shadow-lg shadow-green-500/20"
                                            : "bg-slate-100 dark:bg-white/5 text-slate-400 border-transparent"
                                    )}
                                >
                                    Gratuit
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="w-full md:w-72 p-6 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 rounded-2xl">
                        <div className="flex items-center gap-2 mb-4 text-slate-400 dark:text-gray-500">
                            <Users className="w-4 h-4" />
                            <span className="text-[10px] font-bold uppercase tracking-wider">Accessibilité</span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-gray-400 leading-relaxed italic">
                            Assurez-vous que le coût ne soit pas un frein à la participation. Prévoyez des modes de paiement flexibles ou des bourses.
                        </p>
                    </div>
                </div>
            </section>

            <AddPartnerModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onSave={handleSaveNewPartner}
            />
        </div>
    );
};

export default LogisticsTab;
