import React, { useState, useEffect } from 'react';
import { collection, query, where, orderBy, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { db, auth } from '../../services/firebaseService';
import { User, FileText, CheckCircle, Clock, X, Phone, HeartPulse, ShieldAlert, Users } from 'lucide-react';

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

interface RegistrationsTabProps {
    activityId: string;
}

export const RegistrationsTab: React.FC<RegistrationsTabProps> = ({ activityId }) => {
    const [registrations, setRegistrations] = useState<WebRegistration[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedReg, setSelectedReg] = useState<WebRegistration | null>(null);

    useEffect(() => {
        if (!auth.currentUser || !activityId) {
            setLoading(false);
            return;
        }

        const q = query(
            collection(db, 'web_registrations'),
            where('activityId', '==', activityId),
            orderBy('submittedAt', 'desc')
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const regs: WebRegistration[] = [];
            snapshot.forEach((doc) => {
                regs.push({ id: doc.id, ...doc.data() } as WebRegistration);
            });
            setRegistrations(regs);
            setLoading(false);

            // Auto-select first if none selected
            if (regs.length > 0 && !selectedReg) {
                // setSelectedReg(regs[0]); // Optional: maybe better to let user click
            }
        }, (err) => {
            console.error("Error fetching web registrations", err);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [activityId]);

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

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-64 text-muted">
                <Clock className="w-8 h-8 animate-spin mb-2 opacity-20" />
                <p>Chargement des inscriptions...</p>
            </div>
        );
    }

    if (registrations.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-64 text-muted bg-surface/30 rounded-2xl border border-dashed border-subtle">
                <Users className="w-12 h-12 mb-4 opacity-10" />
                <p className="font-medium text-sm">Aucune inscription web pour cette activité.</p>
                <p className="text-[10px] uppercase tracking-widest mt-1 opacity-50">Lien vers le site web actif</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col md:flex-row gap-6 h-[calc(100vh-350px)] min-h-[400px]">
            {/* Sidebar: List */}
            <div className="w-full md:w-64 flex flex-col gap-2 overflow-y-auto pr-2">
                <div className="text-[10px] font-black uppercase tracking-widest text-muted mb-2 px-2">
                    {registrations.length} Inscription(s)
                </div>
                {registrations.map(reg => (
                    <button
                        key={reg.id}
                        onClick={() => setSelectedReg(reg)}
                        className={`w-full text-left p-3 rounded-xl border transition-all flex flex-col gap-1 ${selectedReg?.id === reg.id
                                ? 'bg-indigo-500/10 border-indigo-500/50 shadow-lg shadow-indigo-500/5'
                                : 'bg-surface border-subtle hover:border-muted'
                            }`}
                    >
                        <div className="flex justify-between items-center">
                            <span className="font-bold text-xs truncate whitespace-nowrap overflow-hidden pr-2">{reg.memberName}</span>
                            {reg.status === 'approved' ? (
                                <CheckCircle className="w-3 h-3 text-emerald-500 shrink-0" />
                            ) : reg.status === 'rejected' ? (
                                <X className="w-3 h-3 text-rose-500 shrink-0" />
                            ) : (
                                <Clock className="w-3 h-3 text-amber-500 shrink-0" />
                            )}
                        </div>
                        <span className="text-[9px] text-muted truncate">
                            {reg.memberEmail}
                        </span>
                    </button>
                ))}
            </div>

            {/* Content: Details */}
            <div className="flex-1 bg-surface/50 rounded-2xl border border-subtle overflow-hidden flex flex-col">
                {selectedReg ? (
                    <div className="flex-1 overflow-y-auto p-6 space-y-6">
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="text-xl font-black text-primary uppercase tracking-tight">{selectedReg.memberName}</h3>
                                <p className="text-xs text-muted mt-1">{selectedReg.memberEmail}</p>
                            </div>
                            <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${selectedReg.status === 'approved' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                                    selectedReg.status === 'rejected' ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' :
                                        'bg-amber-500/10 text-amber-500 border-amber-500/20'
                                }`}>
                                {selectedReg.status === 'approved' ? 'Confirmé' :
                                    selectedReg.status === 'rejected' ? 'Refusé' : 'En attente'}
                            </div>
                        </div>

                        {selectedReg.memberProfile ? (
                            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                                {/* Bio */}
                                <div className="p-4 bg-base/50 rounded-xl border border-subtle space-y-3">
                                    <h4 className="text-[10px] font-black uppercase tracking-widest text-muted flex items-center gap-2">
                                        <User className="w-3 h-3" /> Profil & Contact
                                    </h4>
                                    <div className="space-y-2 text-xs">
                                        <div className="flex justify-between"><span className="text-muted">Naissance:</span> <span className="font-bold">{selectedReg.memberProfile.birthDate || 'N/A'}</span></div>
                                        <div className="flex justify-between"><span className="text-muted">Parent:</span> <span className="font-bold">{selectedReg.memberProfile.parentEmail || 'Inconnu'}</span></div>
                                        <div className="flex justify-between"><span className="text-muted">Téléphone:</span> <span className="font-bold text-indigo-400">{selectedReg.memberProfile.phone || 'N/A'}</span></div>
                                    </div>
                                </div>

                                {/* Emergency */}
                                <div className="p-4 bg-base/50 rounded-xl border border-subtle space-y-3">
                                    <h4 className="text-[10px] font-black uppercase tracking-widest text-muted flex items-center gap-2">
                                        <Phone className="w-3 h-3 text-amber-500" /> Urgence
                                    </h4>
                                    {selectedReg.memberProfile.emergencyContacts?.map((c: any, i: number) => (
                                        <div key={i} className="bg-surface p-2 rounded-lg border border-subtle text-[11px]">
                                            <div className="font-bold">{c.name} ({c.relationship})</div>
                                            <div className="text-amber-500 font-bold mt-0.5">{c.phone}</div>
                                        </div>
                                    )) || <p className="text-[11px] italic text-muted">Aucun contact.</p>}
                                </div>

                                {/* Medical */}
                                <div className="p-4 bg-rose-500/5 rounded-xl border border-rose-500/10 space-y-3 xl:col-span-2">
                                    <h4 className="text-[10px] font-black uppercase tracking-widest text-rose-500 flex items-center gap-2">
                                        <HeartPulse className="w-3 h-3" /> Médical & Allergies
                                    </h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <span className="text-[9px] font-bold text-muted uppercase block mb-1">Allergies</span>
                                            <div className="flex flex-wrap gap-1">
                                                {selectedReg.memberProfile.medical?.allergies?.length > 0 ?
                                                    selectedReg.memberProfile.medical.allergies.map((a: string, i: number) => (
                                                        <span key={i} className="bg-rose-500/20 text-rose-400 text-[10px] px-2 py-0.5 rounded-md font-bold">{a}</span>
                                                    )) : <span className="text-xs italic text-muted">Aucune.</span>}
                                            </div>
                                        </div>
                                        <div>
                                            <span className="text-[9px] font-bold text-muted uppercase block mb-1">Conditions</span>
                                            <p className="text-xs text-rose-300 font-medium">
                                                {selectedReg.memberProfile.medical?.conditions?.join(', ') || 'Aucune condition signalée.'}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Consents */}
                                <div className="p-4 bg-indigo-500/5 rounded-xl border border-indigo-500/10 space-y-3 xl:col-span-2">
                                    <h4 className="text-[10px] font-black uppercase tracking-widest text-indigo-400 flex items-center gap-2">
                                        <ShieldAlert className="w-3 h-3" /> Consentements
                                    </h4>
                                    <div className="flex gap-4 text-[10px] font-bold">
                                        <div className={`px-2 py-1 rounded border ${selectedReg.memberProfile.consents?.law25 ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-subtle text-muted border-transparent opacity-50'}`}>
                                            LOI 25
                                        </div>
                                        <div className={`px-2 py-1 rounded border ${selectedReg.memberProfile.consents?.photoVideo ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-subtle text-muted border-transparent opacity-50'}`}>
                                            PHOTOS/VIDÉOS
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="p-8 text-center bg-base/30 rounded-2xl border border-dashed border-subtle">
                                <p className="text-xs text-muted italic">Données de profil détaillées non disponibles pour cette inscription.</p>
                            </div>
                        )}

                        {/* Sticky Action Footer */}
                        <div className="pt-6 border-t border-subtle flex gap-3 mt-auto bg-surface/50">
                            <button
                                onClick={() => handleUpdateStatus(selectedReg.id, 'approved')}
                                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all ${selectedReg.status === 'approved'
                                        ? 'bg-emerald-500 text-white cursor-default'
                                        : 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white'
                                    }`}
                            >
                                <CheckCircle className="w-4 h-4" /> Approuver
                            </button>
                            <button
                                onClick={() => handleUpdateStatus(selectedReg.id, 'rejected')}
                                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all ${selectedReg.status === 'rejected'
                                        ? 'bg-rose-500 text-white cursor-default'
                                        : 'bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white'
                                    }`}
                            >
                                <X className="w-4 h-4" /> Rejeter
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-muted p-8 text-center">
                        <Users className="w-16 h-16 mb-4 opacity-10" />
                        <h4 className="font-black uppercase tracking-widest text-xs">Sélectionner un jeune</h4>
                        <p className="text-[10px] mt-1">Cliquez sur un nom à gauche pour voir sa fiche d'inscription.</p>
                    </div>
                )}
            </div>
        </div>
    );
};
