import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { db, auth } from '../../services/firebaseService';
import { User, Activity, FileText, CheckCircle, Clock, X, Phone, HeartPulse, ShieldAlert } from 'lucide-react';

interface WebRegistration {
    id: string;
    activityId: string;
    memberId: string;
    memberName: string;
    memberEmail: string;
    status: 'pending' | 'approved' | 'rejected';
    memberProfile?: any;
    submittedAt: any;
}

interface WebRegistrationsPanelProps {
    onClose: () => void;
    activities: { id: string, title: string, date: string }[];
}

export const WebRegistrationsPanel: React.FC<WebRegistrationsPanelProps> = ({ onClose, activities }) => {
    const [registrations, setRegistrations] = useState<WebRegistration[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedReg, setSelectedReg] = useState<WebRegistration | null>(null);

    useEffect(() => {
        if (!auth.currentUser) {
            setLoading(false);
            return;
        }

        const q = query(
            collection(db, 'web_registrations'),
            orderBy('submittedAt', 'desc')
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const regs: WebRegistration[] = [];
            snapshot.forEach((doc) => {
                regs.push({ id: doc.id, ...doc.data() } as WebRegistration);
            });
            setRegistrations(regs);
            setLoading(false);
        }, (err) => {
            console.error("Error fetching web registrations", err);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const handleUpdateStatus = async (id: string, newStatus: 'approved' | 'rejected') => {
        try {
            await updateDoc(doc(db, 'web_registrations', id), { status: newStatus });
            if (selectedReg && selectedReg.id === id) {
                setSelectedReg({ ...selectedReg, status: newStatus });
            }
        } catch (error) {
            console.error("Error updating status:", error);
            alert("Erreur lors de la mise à jour");
        }
    };

    const getActivityTitle = (actId: string) => {
        const act = activities.find(a => a.id === actId);
        return act ? `${act.title} (${act.date})` : 'Activité inconnue';
    };

    return (
        <div className="fixed inset-0 z-[110] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-700 w-full max-w-5xl h-[85vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row shadow-cyan-900/20">

                {/* Left side: List of registrations */}
                <div className="w-full md:w-1/3 border-r border-slate-800 flex flex-col bg-slate-800/50">
                    <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900">
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <FileText className="w-5 h-5 text-cyan-400" />
                            Inscriptions Web
                        </h2>
                        <button onClick={onClose} className="md:hidden text-slate-400 hover:text-white">
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-2 space-y-2">
                        {loading ? (
                            <div className="text-center p-8 text-slate-400">Chargement...</div>
                        ) : registrations.length === 0 ? (
                            <div className="text-center p-8 text-slate-500 text-sm">Aucune inscription du web.</div>
                        ) : (
                            registrations.map(reg => (
                                <button
                                    key={reg.id}
                                    onClick={() => setSelectedReg(reg)}
                                    className={`w-full text-left p-3 rounded-lg border transition-all ${selectedReg?.id === reg.id
                                        ? 'bg-cyan-900/40 border-cyan-700 shadow-lg'
                                        : 'bg-slate-800 border-slate-700 hover:bg-slate-700'
                                        }`}
                                >
                                    <div className="flex justify-between items-start mb-1">
                                        <div className="font-bold text-white truncate max-w-[150px]">{reg.memberName}</div>
                                        {reg.status === 'pending' && <span className="bg-amber-500/20 text-amber-400 text-[10px] uppercase font-bold px-2 py-0.5 rounded-full flex items-center gap-1"><Clock className="w-3 h-3" /> En attente</span>}
                                        {reg.status === 'approved' && <span className="bg-emerald-500/20 text-emerald-400 text-[10px] uppercase font-bold px-2 py-0.5 rounded-full flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Approuvé</span>}
                                        {reg.status === 'rejected' && <span className="bg-red-500/20 text-red-400 text-[10px] uppercase font-bold px-2 py-0.5 rounded-full">Rejeté</span>}
                                    </div>
                                    <div className="text-xs text-slate-400 truncate">{getActivityTitle(reg.activityId)}</div>
                                </button>
                            ))
                        )}
                    </div>
                </div>

                {/* Right side: Detail view */}
                <div className="flex-1 flex flex-col bg-slate-900 relative">
                    <button onClick={onClose} className="hidden md:flex absolute top-4 right-4 text-slate-400 hover:text-white z-10 transition-colors p-2 rounded-full hover:bg-white/10">
                        <X className="w-6 h-6" />
                    </button>

                    {selectedReg ? (
                        <div className="p-6 md:p-8 overflow-y-auto flex-1 h-full">
                            <div className="mb-8">
                                <h3 className="text-3xl font-bold border-b border-slate-800 pb-4 text-white">
                                    {selectedReg.memberName}
                                </h3>

                                <div className="mt-4 flex flex-wrap gap-4 items-center">
                                    <div className="bg-slate-800 px-4 py-3 rounded-xl border border-slate-700">
                                        <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-1">Activité ciblée</div>
                                        <div className="text-sm text-cyan-400 font-medium">
                                            {getActivityTitle(selectedReg.activityId)}
                                        </div>
                                    </div>

                                    <div className="bg-slate-800 px-4 py-3 rounded-xl border border-slate-700">
                                        <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-1">Statut</div>
                                        <div className="flex items-center gap-2">
                                            {selectedReg.status === 'pending' && <span className="text-amber-400 text-sm font-bold flex items-center gap-1"><Clock className="w-4 h-4" /> En révision</span>}
                                            {selectedReg.status === 'approved' && <span className="text-emerald-400 text-sm font-bold flex items-center gap-1"><CheckCircle className="w-4 h-4" /> Confirmé</span>}
                                            {selectedReg.status === 'rejected' && <span className="text-red-400 text-sm font-bold">Refusé</span>}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Full Profile Info */}
                            {selectedReg.memberProfile ? (
                                <div className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="bg-slate-800 p-5 rounded-xl border border-slate-700">
                                            <h4 className="flex items-center gap-2 font-bold text-white mb-4 border-b border-slate-700 pb-2">
                                                <User className="w-4 h-4 text-slate-400" /> Informations Personnelles
                                            </h4>
                                            <div className="space-y-2 text-sm text-slate-300">
                                                <p><span className="text-slate-500 inline-block w-24">Date de naiss:</span> {selectedReg.memberProfile.birthDate || 'N/A'}</p>
                                                <p><span className="text-slate-500 inline-block w-24">Email (Membre):</span> {selectedReg.memberProfile.email || selectedReg.memberEmail || 'N/A'}</p>
                                                <p><span className="text-slate-500 inline-block w-24">Email (Parent):</span> {selectedReg.memberProfile.parentEmail || '-'}</p>
                                                <p><span className="text-slate-500 inline-block w-24">Téléphone:</span> {selectedReg.memberProfile.phone || 'N/A'}</p>
                                            </div>
                                        </div>

                                        <div className="bg-slate-800 p-5 rounded-xl border border-slate-700">
                                            <h4 className="flex items-center gap-2 font-bold text-white mb-4 border-b border-slate-700 pb-2">
                                                <Phone className="w-4 h-4 text-amber-500" /> Contacts d'Urgence
                                            </h4>
                                            {selectedReg.memberProfile.emergencyContacts && selectedReg.memberProfile.emergencyContacts.length > 0 ? (
                                                <ul className="space-y-3">
                                                    {selectedReg.memberProfile.emergencyContacts.map((contact: any, idx: number) => (
                                                        <li key={idx} className="bg-slate-900 p-3 rounded-lg border border-slate-700">
                                                            <div className="font-bold text-sm text-slate-200">{contact.name} ({contact.relationship})</div>
                                                            <div className="text-xs text-amber-400 mt-1">{contact.phone}</div>
                                                        </li>
                                                    ))}
                                                </ul>
                                            ) : (
                                                <p className="text-sm text-slate-500 italic">Aucun contact fourni.</p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="bg-red-950/20 p-5 rounded-xl border border-red-900/30">
                                        <h4 className="flex items-center gap-2 font-bold text-red-400 mb-4 border-b border-red-900/50 pb-2">
                                            <HeartPulse className="w-4 h-4" /> Allergies & Médical
                                        </h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <div className="text-xs text-slate-500 font-bold uppercase mb-2">Allergies</div>
                                                {selectedReg.memberProfile.medical?.allergies && selectedReg.memberProfile.medical.allergies.length > 0 ? (
                                                    <div className="flex flex-wrap gap-2">
                                                        {selectedReg.memberProfile.medical.allergies.map((alg: string, i: number) => (
                                                            <span key={i} className="bg-red-500/20 text-red-300 text-xs px-2 py-1 rounded-md">{alg}</span>
                                                        ))}
                                                    </div>
                                                ) : <span className="text-sm text-slate-500">Aucune.</span>}
                                            </div>
                                            <div>
                                                <div className="text-xs text-slate-500 font-bold uppercase mb-2">Conditions / Médicaments</div>
                                                {selectedReg.memberProfile.medical?.conditions && selectedReg.memberProfile.medical.conditions.length > 0 ? (
                                                    <ul className="list-disc pl-4 text-sm text-red-300 space-y-1">
                                                        {selectedReg.memberProfile.medical.conditions.map((cond: string, i: number) => (
                                                            <li key={i}>{cond}</li>
                                                        ))}
                                                    </ul>
                                                ) : <span className="text-sm text-slate-500">Aucune.</span>}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-slate-800 p-5 rounded-xl border border-slate-700">
                                        <h4 className="flex items-center gap-2 font-bold text-white mb-4 border-b border-slate-700 pb-2">
                                            <ShieldAlert className="w-4 h-4 text-indigo-400" /> Consentements
                                        </h4>
                                        <div className="space-y-2 text-sm text-slate-300">
                                            <div className="flex justify-between max-w-sm">
                                                <span>Loi 25 (Confidentialité) :</span>
                                                <span className={selectedReg.memberProfile.consents?.law25 ? "text-emerald-400 font-bold" : "text-slate-500"}>
                                                    {selectedReg.memberProfile.consents?.law25 ? 'Oui' : 'Non'}
                                                </span>
                                            </div>
                                            <div className="flex justify-between max-w-sm">
                                                <span>Photo & Vidéo :</span>
                                                <span className={selectedReg.memberProfile.consents?.photoVideo ? "text-emerald-400 font-bold" : "text-slate-500"}>
                                                    {selectedReg.memberProfile.consents?.photoVideo ? 'Oui' : 'Non'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-slate-500 mt-8 italic bg-slate-800/50 p-6 rounded-xl border border-slate-800 text-sm">
                                    <span className="font-bold text-white block mb-2">Profil Incomplet</span>
                                    Cette inscription ne contient pas le dossier complet ou provient de l'ancien format. Aucune donnée d'urgence attachée.
                                </div>
                            )}

                            {/* Actions */}
                            <div className="mt-8 flex flex-wrap gap-4 pt-6 border-t border-slate-800 sticky bottom-0 bg-slate-900 pb-4">
                                {selectedReg.status !== 'approved' && (
                                    <button
                                        onClick={() => handleUpdateStatus(selectedReg.id, 'approved')}
                                        className="flex-1 md:flex-none border border-emerald-500/50 bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500 hover:text-white px-6 py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/10"
                                    >
                                        <CheckCircle className="w-5 h-5" /> Approuver
                                    </button>
                                )}
                                {selectedReg.status !== 'rejected' && (
                                    <button
                                        onClick={() => handleUpdateStatus(selectedReg.id, 'rejected')}
                                        className="flex-1 md:flex-none border border-red-500/50 bg-transparent text-red-500 hover:bg-red-500/20 px-6 py-3 rounded-xl font-bold transition-all"
                                    >
                                        Rejeter
                                    </button>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-slate-500 p-8">
                            <FileText className="w-16 h-16 mb-4 opacity-20" />
                            <p className="text-lg">Sélectionnez une inscription pour voir la fiche du jeune</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
