import React, { useState } from 'react';
import { Users, X, Plus, Search, Mail, Phone, HeartPulse, Edit2, Trash2 } from 'lucide-react';
import { useMembers } from '../../hooks/useMembers';
import { Member } from '../../types';
import { MemberGenderEnum, MemberStatusEnum } from '../../lib/schemas';
import { cn } from '../../lib/utils';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';

interface MemberRegistryModalProps {
    userEmail?: string;
    onClose: () => void;
}

export const MemberRegistryModal: React.FC<MemberRegistryModalProps> = ({ userEmail, onClose }) => {
    const { members, isLoading, createMember, updateMember, deleteMember } = useMembers(userEmail);
    const [searchTerm, setSearchTerm] = useState('');
    const [isCreating, setIsCreating] = useState(false);
    const [editingMember, setEditingMember] = useState<Member | null>(null);

    const [formData, setFormData] = useState<Partial<Member>>({
        firstName: '', lastName: '', birthDate: '', gender: 'Préfère ne pas répondre',
        status: 'Actif', allergies: '', emergencyContact: '', parentContact: '', notes: ''
    });

    const resetForm = () => {
        setFormData({
            firstName: '', lastName: '', birthDate: '', gender: 'Préfère ne pas répondre',
            status: 'Actif', allergies: '', emergencyContact: '', parentContact: '', notes: ''
        });
        setIsCreating(false);
        setEditingMember(null);
    };

    const handleSave = async () => {
        try {
            if (editingMember) {
                await updateMember(editingMember.id, formData);
            } else {
                await createMember(formData as Omit<Member, 'id'>);
            }
            resetForm();
        } catch (error) {
            alert("Erreur lors de la sauvegarde du profil membre.");
        }
    };

    const calculateAge = (birthDate: string) => {
        if (!birthDate) return '?';
        const today = new Date();
        const birthDateObj = new Date(birthDate);
        let age = today.getFullYear() - birthDateObj.getFullYear();
        const m = today.getMonth() - birthDateObj.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDateObj.getDate())) {
            age--;
        }
        return age;
    };

    const filteredMembers = members.filter(m =>
        m.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.code?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const youthMembers = filteredMembers
        .filter(m => {
            const age = calculateAge(m.birthDate);
            return age !== '?' && (age as number) <= 18;
        })
        .sort((a, b) => `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`));

    const adultMembers = filteredMembers
        .filter(m => {
            const age = calculateAge(m.birthDate);
            return age !== '?' && (age as number) >= 19;
        })
        .sort((a, b) => `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`));

    const renderMemberButton = (m: Member) => (
        <button
            key={m.id}
            onClick={() => { setIsCreating(false); setEditingMember(m); setFormData(m); }}
            className={cn(
                "w-full flex items-center justify-between p-3 rounded-xl transition-all text-left",
                editingMember?.id === m.id ? "bg-indigo-50 dark:bg-indigo-500/10 border-indigo-200 dark:border-indigo-500/30" : "hover:bg-slate-50 dark:hover:bg-gray-700 border-transparent"
            )}
        >
            <div className="flex flex-col">
                <div className="flex items-center gap-2">
                    <p className="font-bold text-sm text-slate-900 dark:text-white">{m.firstName} {m.lastName}</p>
                    {(m as any).isSynced && (
                        <span className="text-[8px] font-black bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 px-1 py-0.5 rounded border border-emerald-200 dark:border-emerald-500/30">SYNC WEB</span>
                    )}
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] font-black uppercase text-indigo-500 bg-indigo-100 dark:bg-indigo-500/20 px-1.5 py-0.5 rounded">{m.code}</span>
                    <span className="text-[10px] font-bold text-slate-500">{calculateAge(m.birthDate)} ans</span>
                </div>
            </div>
        </button>
    );

    return (
        <Modal
            onClose={onClose}
            title="Registre des Jeunes"
            icon={<Users className="w-6 h-6" />}
            maxWidth="5xl"
        >
            <div className="flex flex-col h-full">
                {/* BODY */}
                <div className="flex-1 overflow-auto flex bg-slate-50 dark:bg-gray-800/30">
                    {/* LEFT: LIST / SEARCH */}
                    <div className="w-1/3 min-w-[300px] border-r border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex flex-col">
                        <div className="p-4 border-b border-slate-100 dark:border-gray-700 flex flex-col gap-3">
                            <div className="relative">
                                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                <input
                                    type="text"
                                    placeholder="Rechercher par nom ou code..."
                                    className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 dark:bg-gray-900 border border-slate-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500/50 outline-none"
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-2 space-y-4">
                            {isLoading ? (
                                <p className="text-center text-slate-400 p-4 text-sm font-medium animate-pulse">Chargement...</p>
                            ) : (
                                <>
                                    {youthMembers.length > 0 && (
                                        <div className="space-y-1">
                                            <div className="px-3 pb-1">
                                                <h3 className="text-[10px] font-black text-indigo-500 uppercase tracking-wider">Jeunes (18 ans et moins)</h3>
                                            </div>
                                            {youthMembers.map(renderMemberButton)}
                                        </div>
                                    )}

                                    {adultMembers.length > 0 && (
                                        <div className="space-y-1">
                                            <div className="px-3 pb-1 border-t border-slate-100 dark:border-gray-700 pt-3 mt-2">
                                                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Membres Majeurs (19 ans +)</h3>
                                            </div>
                                            {adultMembers.map(renderMemberButton)}
                                        </div>
                                    )}

                                    {filteredMembers.length === 0 && (
                                        <p className="text-center text-slate-400 p-8 text-sm italic">Aucun membre trouvé</p>
                                    )}
                                </>
                            )}
                        </div>
                    </div>

                    {/* RIGHT: EDITOR */}
                    <div className="flex-1 p-8 overflow-y-auto">
                        {isCreating || editingMember ? (
                            <div className="max-w-2xl mx-auto space-y-8 animate-in slide-in-from-right-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-xl font-bold dark:text-white">{isCreating ? "Nouveau membre" : "Édition du profil"}</h3>
                                    <div className="flex items-center gap-2">
                                        {(editingMember as any).isSynced && (
                                            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-3 py-1 rounded-lg border border-emerald-100 dark:border-emerald-500/20">Profil géré sur le site web</span>
                                        )}
                                        {editingMember && (
                                            <button
                                                onClick={() => {
                                                    if (window.confirm(`Êtes-vous sûr de vouloir supprimer définitivement le profil de ${editingMember.firstName} ${editingMember.lastName} ? Cette action est irréversible.`)) {
                                                        deleteMember(editingMember.id);
                                                        resetForm();
                                                    }
                                                }}
                                                className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
                                                title="Supprimer le membre"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        )}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-slate-500 uppercase">Prénom</label>
                                        <input type="text" value={formData.firstName} onChange={e => setFormData({ ...formData, firstName: e.target.value })} className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm focus:ring-2 focus:ring-indigo-500/30" />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-slate-500 uppercase">Nom</label>
                                        <input type="text" value={formData.lastName} onChange={e => setFormData({ ...formData, lastName: e.target.value })} className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm focus:ring-2 focus:ring-indigo-500/30" />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-slate-500 uppercase">Date de naissance</label>
                                        <input type="date" value={formData.birthDate} onChange={e => setFormData({ ...formData, birthDate: e.target.value })} className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm focus:ring-2 focus:ring-indigo-500/30 text-slate-900 dark:text-white [color-scheme:light] dark:[color-scheme:dark]" />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-slate-500 uppercase">Genre</label>
                                        <select value={formData.gender} onChange={e => setFormData({ ...formData, gender: e.target.value as any })} className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm focus:ring-2 focus:ring-indigo-500/30 dark:text-white">
                                            {MemberGenderEnum.options.map((o: string) => <option key={o} value={o}>{o}</option>)}
                                        </select>
                                    </div>
                                    <div className="space-y-1 col-span-2">
                                        <label className="text-[10px] font-bold text-slate-500 uppercase">Allergies / Particularités (Médico-social)</label>
                                        <input type="text" value={formData.allergies} onChange={e => setFormData({ ...formData, allergies: e.target.value })} className="w-full px-4 py-2 rounded-xl border border-orange-200 bg-orange-50/50 dark:bg-orange-500/10 dark:border-orange-500/20 text-sm focus:ring-2 focus:ring-orange-500/30 dark:text-white" />
                                    </div>
                                    <div className="space-y-1 col-span-2">
                                        <label className="text-[10px] font-bold text-slate-500 uppercase">Contact d'urgence (Parents / Tuteur)</label>
                                        <input type="text" value={formData.emergencyContact} onChange={e => setFormData({ ...formData, emergencyContact: e.target.value })} placeholder="Nom et Téléphone" className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm focus:ring-2 focus:ring-indigo-500/30 dark:text-white" />
                                    </div>
                                    <div className="space-y-1 col-span-2">
                                        <label className="text-[10px] font-bold text-slate-500 uppercase">Statut au sein de la MDJ</label>
                                        <select value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value as any })} className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm focus:ring-2 focus:ring-indigo-500/30 dark:text-white">
                                            {MemberStatusEnum.options.map((o: string) => <option key={o} value={o}>{o}</option>)}
                                        </select>
                                    </div>
                                    <div className="space-y-1 col-span-2">
                                        <label className="text-[10px] font-bold text-slate-500 uppercase">Notes (Comportementales, Intervention)</label>
                                        <textarea rows={4} value={formData.notes} onChange={e => setFormData({ ...formData, notes: e.target.value })} className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm focus:ring-2 focus:ring-indigo-500/30 dark:text-white"></textarea>
                                    </div>
                                </div>
                                <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-gray-700">
                                    <Button variant="outline" onClick={resetForm}>Annuler</Button>
                                    {!(editingMember as any)?.isSynced && (
                                        <Button variant="primary" onClick={handleSave} disabled={!formData.firstName || !formData.lastName || !formData.birthDate}>
                                            Sauvegarder le profil
                                        </Button>
                                    )}
                                    {(editingMember as any)?.isSynced && (
                                        <p className="text-xs text-slate-400 italic flex items-center gap-2">
                                            <Users className="w-3 h-3" /> Les modifications doivent être faites via le site web.
                                        </p>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-slate-400 dark:text-gray-600">
                                <Users className="w-16 h-16 mb-4 opacity-20" />
                                <h3 className="text-xl font-bold mb-2">Aucun membre sélectionné</h3>
                                <p className="text-sm">Sélectionnez un membre à gauche pour afficher son profil.</p>
                                <p className="text-xs mt-4 italic opacity-70">L'inscription de nouveaux membres se fait via le site web.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Modal>
    );
};
