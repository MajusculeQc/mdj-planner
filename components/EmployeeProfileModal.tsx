import React, { useState } from 'react';
import { X, User, Palette, CalendarDays, Plus, Trash2, Sun, Moon, Upload, Loader2 } from 'lucide-react';
import { UserProfile } from '../hooks/useUserProfile';
import { Activity } from '../types';
import { cn, isAbsence } from '../lib/utils';
import { EMPLOYEE_AVATARS } from '../lib/constants';
import { isSuperAdmin } from '../lib/auth-utils';
import { db, FirebaseService } from '../services/firebaseService';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { z } from 'zod';

const absenceSchema = z.object({
    startDate: z.string().min(1, "La date de début est requise"),
    endDate: z.string()
}).refine((data) => {
    if (data.endDate) {
        return new Date(data.endDate) >= new Date(data.startDate);
    }
    return true;
}, {
    message: "La date de fin ne peut pas être avant la date de début",
    path: ["endDate"]
});

interface Props {
    userEmail: string;
    userName: string;
    profile: UserProfile;
    updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
    absences: Activity[];
    onClose: () => void;
    onRefreshActivities?: () => void;
    initialTab?: 'avatar' | 'theme' | 'absences';
}

const PRESET_AVATARS = [
    'https://mdjescalejeunesse.ca/wp-content/uploads/2024/01/charles-avatar-l039escale-jeunesse-la-piaule.png',
    'https://mdjescalejeunesse.ca/wp-content/uploads/2024/01/laurie-avatar-l039escale-jeunesse-la-piaule.png',
    'https://mdjescalejeunesse.ca/wp-content/uploads/2024/01/mikael-avatar-l039escale-jeunesse-la-piaule.png',
    'https://mdjescalejeunesse.ca/wp-content/uploads/2024/01/ann-so-avatar-l039escale-jeunesse-la-piaule.png',
    'https://mdjescalejeunesse.ca/wp-content/uploads/2024/01/sebastien-avatar-l039escale-jeunesse-la-piaule.png',
    'https://mdjescalejeunesse.ca/wp-content/uploads/2024/01/pat-avatar-l039escale-jeunesse-la-piaule.png',
    'https://mdjescalejeunesse.ca/wp-content/uploads/2024/01/system-admin-mdj-l039escale-jeunesse-la-piaule.png'
];

export const EmployeeProfileModal: React.FC<Props> = ({ userEmail, userName, profile, updateProfile, absences, onClose, onRefreshActivities, initialTab }) => {
    const isSuper = isSuperAdmin(userEmail);
    const [activeTab, setActiveTab] = useState<'avatar' | 'theme' | 'absences'>(initialTab || 'avatar');
    const [customAvatar, setCustomAvatar] = useState(profile.avatarUrl || '');
    const [newAbsenceDate, setNewAbsenceDate] = useState('');
    const [newAbsenceEndDate, setNewAbsenceEndDate] = useState('');
    const [isAddingAbsence, setIsAddingAbsence] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

    // Filter absences strictly belonging to this user
    const userAbsences = absences.filter(a => isAbsence(a.title) && (
        a.title.toUpperCase().includes(userName.toUpperCase()) ||
        a.title.toUpperCase().includes(userName.toUpperCase().split(' ')[0])
    ));

    const handleUpdateTheme = async (theme: 'light' | 'dark') => {
        await updateProfile({ theme });
    };

    const handleSaveAvatar = async (url: string) => {
        await updateProfile({ avatarUrl: url });
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 2 * 1024 * 1024) {
            alert("Le fichier est trop volumineux (max 2 Mo).");
            return;
        }

        setIsUploading(true);
        try {
            const url = await FirebaseService.uploadAvatar(file, userEmail);
            await handleSaveAvatar(url);
        } catch (error: any) {
            console.error("Upload error:", error);
            alert(error.message || "Erreur lors du téléchargement de l'image.");
        } finally {
            setIsUploading(false);
        }
    };

    const handleCreateAbsence = async () => {
        try {
            absenceSchema.parse({ startDate: newAbsenceDate, endDate: newAbsenceEndDate });
        } catch (error: any) {
            if (error?.issues && error.issues.length > 0) {
                alert(error.issues[0].message);
            } else if (error?.errors && error.errors.length > 0) {
                alert(error.errors[0].message);
            } else {
                alert("Erreur de validation des dates.");
            }
            return;
        }

        setIsAddingAbsence(true);
        try {
            const startDate = new Date(newAbsenceDate);
            const endDate = newAbsenceEndDate ? new Date(newAbsenceEndDate) : startDate;

            const datesToProcess: string[] = [];
            let current = new Date(startDate);
            while (current <= endDate) {
                datesToProcess.push(current.toISOString().split('T')[0]);
                current.setDate(current.getDate() + 1);
            }

            // Check for duplicates
            const existingDates = new Set(userAbsences.map(a => a.date));
            const newDates = datesToProcess.filter(d => !existingDates.has(d));

            if (newDates.length === 0) {
                alert("Ces dates sont déjà enregistrées.");
                setIsAddingAbsence(false);
                return;
            }

            for (const date of newDates) {
                await addDoc(collection(db, 'activities'), {
                    title: `ABSENCE - ${userName}`,
                    date,
                    startTime: "00:00",
                    endTime: "23:59",
                    type: "Promotion, Concertation & Gestion",
                    description: "Journée de congé/vacances",
                    pedagogy: {
                        objectives: [],
                        rmjqDimensions: [],
                        psocTags: []
                    },
                    logistics: {
                        venueName: 'Absence',
                        address: '',
                        isFree: true,
                        transportRequired: false
                    },
                    riskManagement: {
                        hazards: [],
                        safetyProtocols: [],
                        emergencyContact: '',
                        siteRules: [],
                        complianceRequirements: []
                    },
                    staffing: {
                        leadStaff: userName,
                        supportStaff: [],
                        requiredRatio: ''
                    },
                    youthInvolvement: {
                        level: 'Participation',
                        tasks: []
                    },
                    materialReservations: [],
                    preparationScore: 100,
                    createdAt: serverTimestamp(),
                    createdByEmail: userEmail,
                });
            }

            // Send notification to team
            const dateStr = newDates.length === 1
                ? `le ${newDates[0]}`
                : `du ${newDates[0]} au ${newDates[newDates.length - 1]}`;

            await FirebaseService.sendMessage({
                senderId: 'SYSTEM',
                senderName: 'MDJ Planner',
                content: `📢 CONGÉ : ${userName.split(' ')[0]} sera absent(e) ${dateStr}.`,
                timestamp: new Date()
            });

            setNewAbsenceDate('');
            setNewAbsenceEndDate('');
            if (onRefreshActivities) onRefreshActivities();
        } catch (error) {
            console.error("Error creating absence:", error);
        } finally {
            setIsAddingAbsence(false);
        }
    };

    const handleDeleteAbsence = async (id: string) => {
        if (!window.confirm("Supprimer définitivement ce congé ?")) return;
        try {
            await FirebaseService.delete(id);
            if (onRefreshActivities) onRefreshActivities();
        } catch (error) {
            console.error("Error deleting absence:", error);
            alert("Erreur lors de la suppression.");
        }
    };


    return (
        <div className="modal-backdrop z-[100]">
            <div className="bg-gray-900 border border-white/10 rounded-3xl w-full max-w-2xl h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">

                {/* HEADER */}
                <div className="p-6 border-b border-white/10 flex items-center justify-between bg-gray-800/50">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-indigo-500/50 bg-gray-800 flex items-center justify-center shrink-0">
                            {profile.avatarUrl ? (
                                <img src={profile.avatarUrl} alt="Profil" className="w-full h-full object-cover" />
                            ) : (
                                <User className="w-8 h-8 text-gray-400" />
                            )}
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-white leading-tight">{userName}</h2>
                            <p className="text-gray-400 text-sm">{userEmail}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full text-gray-400 hover:text-white transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* TABS */}
                <div className="flex border-b border-white/10 bg-gray-900 overflow-x-auto custom-scrollbar shrink-0">
                    <button onClick={() => setActiveTab('avatar')} className={cn("flex items-center gap-2 px-6 py-4 font-bold text-sm tracking-wide transition-colors border-b-2 whitespace-nowrap", activeTab === 'avatar' ? "border-indigo-500 text-indigo-400 bg-indigo-500/5" : "border-transparent text-gray-500 hover:text-gray-300 hover:bg-white/5")}>
                        <User className="w-4 h-4" /> Avatar
                    </button>
                    <button onClick={() => setActiveTab('theme')} className={cn("flex items-center gap-2 px-6 py-4 font-bold text-sm tracking-wide transition-colors border-b-2 whitespace-nowrap", activeTab === 'theme' ? "border-cyan-500 text-cyan-400 bg-cyan-500/5" : "border-transparent text-gray-500 hover:text-gray-300 hover:bg-white/5")}>
                        <Palette className="w-4 h-4" /> Thème
                    </button>
                    <button onClick={() => setActiveTab('absences')} className={cn("flex items-center gap-2 px-6 py-4 font-bold text-sm tracking-wide transition-colors border-b-2 whitespace-nowrap", activeTab === 'absences' ? "border-orange-500 text-orange-400 bg-orange-500/5" : "border-transparent text-gray-500 hover:text-gray-300 hover:bg-white/5")}>
                        <CalendarDays className="w-4 h-4" /> Congés & Absences
                    </button>
                </div>

                {/* CONTENT */}
                <div className="flex-1 overflow-y-auto p-6 bg-gray-950/50 custom-scrollbar">

                    {/* AVATAR TAB */}
                    {activeTab === 'avatar' && (
                        <div className="space-y-6 animate-in fade-in">
                            <div>
                                <h3 className="text-white font-bold mb-4">Avatars Prédéfinis MDJ</h3>
                                <div className="grid grid-cols-4 sm:grid-cols-5 gap-4">
                                    {PRESET_AVATARS.filter(url =>
                                        isSuper || url === EMPLOYEE_AVATARS[userEmail as keyof typeof EMPLOYEE_AVATARS]
                                    ).map((url, i) => (
                                        <button
                                            key={i}
                                            onClick={() => handleSaveAvatar(url)}
                                            className={cn(
                                                "relative aspect-square rounded-2xl overflow-hidden border-2 transition-all group",
                                                profile.avatarUrl === url ? "border-indigo-500 scale-105 shadow-[0_0_15px_rgba(99,102,241,0.5)]" : "border-white/10 hover:border-white/30 hover:scale-105"
                                            )}
                                        >
                                            <img src={url} className="w-full h-full object-cover" alt={`Avatar ${i}`} />
                                            {profile.avatarUrl === url && (
                                                <div className="absolute inset-0 bg-indigo-500/20 flex items-center justify-center">
                                                    <div className="bg-indigo-500 text-white p-1 rounded-full"><User className="w-4 h-4" /></div>
                                                </div>
                                            )}
                                        </button>
                                    ))}

                                    {/* Upload Button */}
                                    <div className="relative aspect-square">
                                        <input
                                            type="file"
                                            id="avatar-upload"
                                            className="hidden"
                                            accept="image/*"
                                            onChange={handleFileUpload}
                                            disabled={isUploading}
                                        />
                                        <label
                                            htmlFor="avatar-upload"
                                            className={cn(
                                                "w-full h-full rounded-2xl border-2 border-dashed border-white/10 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all hover:border-indigo-500/50 hover:bg-white/5",
                                                isUploading && "opacity-50 cursor-wait"
                                            )}
                                        >
                                            {isUploading ? (
                                                <Loader2 className="w-6 h-6 text-indigo-400 animate-spin" />
                                            ) : (
                                                <>
                                                    <Upload className="w-6 h-6 text-gray-500" />
                                                    <span className="text-[10px] font-bold text-gray-500 uppercase">Upload</span>
                                                </>
                                            )}
                                        </label>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-6 border-t border-white/10">
                                <h3 className="text-white font-bold mb-2">Avatar Personnalisé (URL)</h3>
                                <div className="flex gap-2">
                                    <input
                                        type="url"
                                        value={customAvatar}
                                        onChange={e => setCustomAvatar(e.target.value)}
                                        placeholder="https://..."
                                        className="flex-1 bg-gray-900 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-indigo-500"
                                    />
                                    <button
                                        onClick={() => handleSaveAvatar(customAvatar)}
                                        disabled={!customAvatar}
                                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl font-bold transition-colors"
                                    >
                                        Appliquer
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* THEME TAB */}
                    {activeTab === 'theme' && (
                        <div className="space-y-6 animate-in fade-in">
                            <h3 className="text-white font-bold mb-4">Préférence d'affichage</h3>
                            <div className="grid grid-cols-2 gap-4">

                                {/* Dark Mode */}
                                <button
                                    onClick={() => handleUpdateTheme('dark')}
                                    className={cn(
                                        "flex flex-col items-center justify-center gap-4 p-8 rounded-3xl border-2 transition-all",
                                        profile.theme === 'dark' ? "border-cyan-500 bg-gray-800 shadow-[0_0_20px_rgba(6,182,212,0.2)] scale-105" : "border-white/10 bg-gray-900 hover:bg-gray-800 hover:border-white/20"
                                    )}>
                                    <Moon className={cn("w-12 h-12", profile.theme === 'dark' ? "text-cyan-400" : "text-gray-500")} />
                                    <span className={cn("font-bold text-lg", profile.theme === 'dark' ? "text-white" : "text-gray-400")}>Mode Sombre</span>
                                    <span className="text-xs text-gray-500">(Par défaut)</span>
                                </button>

                                {/* Light Mode */}
                                <button
                                    onClick={() => handleUpdateTheme('light')}
                                    className={cn(
                                        "flex flex-col items-center justify-center gap-4 p-8 rounded-3xl border-2 transition-all relative overflow-hidden",
                                        profile.theme === 'light' ? "border-orange-500 bg-orange-50 dark:bg-white shadow-[0_0_20px_rgba(249,115,22,0.1)] scale-105" : "border-white/10 bg-gray-800 hover:bg-gray-700 hover:border-white/20"
                                    )}>
                                    <div className="absolute inset-0 bg-white opacity-5"></div>
                                    <Sun className={cn("w-12 h-12 relative z-10", profile.theme === 'light' ? "text-orange-500" : "text-gray-400")} />
                                    <span className={cn("font-bold text-lg relative z-10", profile.theme === 'light' ? "text-orange-600" : "text-gray-300")}>Mode Clair</span>
                                    <span className={cn("text-xs relative z-10", profile.theme === 'light' ? "text-gray-500" : "text-gray-500")}>Optimisé</span>
                                </button>
                            </div>
                        </div>
                    )}

                    {/* ABSENCES TAB */}
                    {activeTab === 'absences' && (
                        <div className="space-y-6 animate-in fade-in h-full flex flex-col">
                            <div>
                                <h3 className="text-white font-bold mb-2">Déclarer un congé</h3>
                                <p className="text-sm text-gray-400 mb-4">Ces dates seront marquées comme "ABSENCE" dans le planificateur, et vous serez automatiquement retiré(e) de la liste des intervenants disponibles ces jours-là.</p>

                                <div className="space-y-3">
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-bold text-gray-500 uppercase ml-1">Début</label>
                                            <input
                                                type="date"
                                                value={newAbsenceDate}
                                                onChange={e => setNewAbsenceDate(e.target.value)}
                                                className="w-full bg-gray-900 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-orange-500 uppercase font-mono tracking-widest text-sm"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-bold text-gray-500 uppercase ml-1">Fin (Optionnel)</label>
                                            <input
                                                type="date"
                                                value={newAbsenceEndDate}
                                                onChange={e => setNewAbsenceEndDate(e.target.value)}
                                                className="w-full bg-gray-900 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-orange-500 uppercase font-mono tracking-widest text-sm"
                                            />
                                        </div>
                                    </div>
                                    <button
                                        onClick={handleCreateAbsence}
                                        disabled={!newAbsenceDate || isAddingAbsence}
                                        className="w-full py-3 bg-orange-600 hover:bg-orange-500 disabled:opacity-50 flex items-center justify-center gap-2 text-white rounded-xl font-bold transition-colors shadow-lg shadow-orange-900/20"
                                    >
                                        {isAddingAbsence ? 'Ajout...' : <><Plus className="w-4 h-4" /> Enregistrer mon absence</>}
                                    </button>
                                </div>
                            </div>

                            <div className="pt-6 border-t border-white/10 flex-1 flex flex-col min-h-0">
                                <h3 className="text-white font-bold mb-4 flex items-center justify-between">
                                    Vos congés enregistrés
                                    <span className="text-xs bg-gray-800 px-2 py-1 rounded-lg font-mono text-gray-400">{userAbsences.length} jours</span>
                                </h3>

                                <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-2">
                                    {userAbsences.length > 0 ? (
                                        userAbsences.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()).map(act => (
                                            <div key={act.id} className="flex items-center justify-between p-3 bg-gray-900 rounded-xl border border-white/5 hover:border-orange-500/30 transition-colors">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center border border-orange-500/20 text-orange-400">
                                                        <CalendarDays className="w-5 h-5" />
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-white text-sm">{act.date}</div>
                                                        <div className="text-xs text-gray-500">{act.description || "Absence / Congé"}</div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => handleDeleteAbsence(act.id)}
                                                        className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all group/del"
                                                        title="Supprimer ce congé"
                                                    >
                                                        <Trash2 className="w-4 h-4 group-hover/del:scale-110 transition-transform" />
                                                    </button>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="h-32 flex flex-col items-center justify-center text-gray-500 gap-2 border-2 border-dashed border-gray-800 rounded-2xl">
                                            <CalendarDays className="w-8 h-8 opacity-20" />
                                            <p className="text-sm italic">Aucun congé déclaré.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
};
