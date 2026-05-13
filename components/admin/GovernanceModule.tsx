import React, { useState } from 'react';
import { Shield, X, Plus, Search, Mail, Phone, ExternalLink, Trash2, FileText, UploadCloud, Calendar, UserCheck, Database } from 'lucide-react';
import { useGovernance } from '../../hooks/useGovernance';
import { BoardMember, VaultDocument } from '../../types';
import { BoardRoleEnum } from '../../lib/schemas';
import { cn } from '../../lib/utils';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import Backup from './Backup';
import { getFunctions, httpsCallable } from 'firebase/functions';

interface GovernanceModuleProps {
    userEmail?: string;
    onClose: () => void;
}

export const GovernanceModule: React.FC<GovernanceModuleProps> = ({ userEmail, onClose }) => {
    const { boardMembers, vaultDocuments, isLoading, createBoardMember, updateBoardMember, deleteBoardMember, saveVaultDocument, deleteVaultDocument } = useGovernance(userEmail);
    const [activeTab, setActiveTab] = useState<'board' | 'vault' | 'backup'>('board');

    // -- Board State --
    const [searchBoard, setSearchBoard] = useState('');
    const [isCreatingBoard, setIsCreatingBoard] = useState(false);
    const [editingMember, setEditingMember] = useState<BoardMember | null>(null);
    const [boardForm, setBoardForm] = useState<Partial<BoardMember>>({
        firstName: '', lastName: '', role: 'Administrateur(trice)', email: '', phone: '', joinDate: '', termEndDate: '', status: 'Actif', notes: ''
    });

    const resetBoardForm = () => {
        setBoardForm({ firstName: '', lastName: '', role: 'Administrateur(trice)', email: '', phone: '', joinDate: '', termEndDate: '', status: 'Actif', notes: '' });
        setIsCreatingBoard(false);
        setEditingMember(null);
    };

    const handleSaveBoard = async () => {
        try {
            if (editingMember) {
                await updateBoardMember(editingMember.id, boardForm);
            } else {
                await createBoardMember(boardForm as Omit<BoardMember, 'id'>);
            }
            resetBoardForm();
        } catch (error) {
            alert("Erreur lors de la sauvegarde.");
        }
    };

    // -- Vault State --
    const [searchVault, setSearchVault] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const [vaultForm, setVaultForm] = useState<Partial<VaultDocument>>({
        title: '', type: 'Procès-verbal', url: '', associatedDate: '', description: ''
    });

    const resetVaultForm = () => {
        setVaultForm({ title: '', type: 'Procès-verbal', url: '', associatedDate: '', description: '' });
        setIsUploading(false);
    };

    const handleSaveVault = async () => {
        if (!userEmail) { alert("Vous devez être connecté."); return; }
        try {
            await saveVaultDocument({
                ...vaultForm,
                uploadedByEmail: userEmail,
                sizeBytes: 0, // Placeholder for external URL representation for now
            } as Omit<VaultDocument, 'id'>);
            resetVaultForm();
        } catch (error) {
            alert("Erreur lors de l'enregistrement du document.");
        }
    };

    const filteredBoard = boardMembers.filter(m =>
        m.firstName.toLowerCase().includes(searchBoard.toLowerCase()) ||
        m.lastName.toLowerCase().includes(searchBoard.toLowerCase())
    );

    const filteredVault = vaultDocuments.filter(d =>
        d.title.toLowerCase().includes(searchVault.toLowerCase()) ||
        d.type.toLowerCase().includes(searchVault.toLowerCase())
    );

    return (
        <Modal
            onClose={onClose}
            title="Gouvernance & Coffre-Fort"
            icon={<Shield className="w-6 h-6" />}
            maxWidth="6xl"
        >
            <div className="flex flex-col h-full">
                {/* HEAD */}
                <div className="flex-none p-6 border-b border-slate-100 dark:border-gray-800 flex items-center justify-between bg-white dark:bg-gray-900 z-10">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 rounded-2xl">
                            <Shield className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold dark:text-white">Gouvernance & Coffre-Fort</h2>
                            <p className="text-xs text-slate-500 font-medium">Espace sécurisé pour le Conseil d'Administration et l'Archivage (AGA, PV)</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex bg-slate-100 dark:bg-gray-800 p-1 rounded-xl">
                            <button onClick={() => setActiveTab('board')} className={cn("px-4 py-2 text-xs font-bold uppercase rounded-lg transition-all", activeTab === 'board' ? "bg-white dark:bg-gray-700 text-slate-900 dark:text-white shadow-sm" : "text-slate-500 hover:text-slate-700")}>Conseil (CA)</button>
                            <button onClick={() => setActiveTab('vault')} className={cn("px-4 py-2 text-xs font-bold uppercase rounded-lg transition-all", activeTab === 'vault' ? "bg-white dark:bg-gray-700 text-slate-900 dark:text-white shadow-sm" : "text-slate-500 hover:text-slate-700")}>Coffre-Fort</button>
                            <button onClick={() => setActiveTab('backup')} className={cn("px-4 py-2 text-xs font-bold uppercase rounded-lg transition-all", activeTab === 'backup' ? "bg-white dark:bg-gray-700 text-slate-900 dark:text-white shadow-sm" : "text-slate-500 hover:text-slate-700")}>Sauvegarde</button>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-gray-800 rounded-full transition-colors">
                            <X className="w-5 h-5 text-slate-500" />
                        </button>
                    </div>
                </div>

                {/* BODY - BOARD OVERVIEW */}
                {activeTab === 'board' && (
                    <div className="flex-1 overflow-auto flex bg-slate-50 dark:bg-gray-800/30">
                        {/* LEFT: LIST / SEARCH */}
                        <div className="w-1/3 min-w-[300px] border-r border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex flex-col">
                            <div className="p-4 border-b border-slate-100 dark:border-gray-700 flex flex-col gap-3">
                                <div className="relative">
                                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                    <input
                                        type="text"
                                        placeholder="Rechercher un administrateur..."
                                        className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 dark:bg-gray-900 border border-slate-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-amber-500/50 outline-none"
                                        value={searchBoard}
                                        onChange={e => setSearchBoard(e.target.value)}
                                    />
                                </div>
                                <Button variant="primary" className="w-full flex justify-center py-2 bg-amber-600 hover:bg-amber-500 shadow-amber-900/20" onClick={() => { resetBoardForm(); setIsCreatingBoard(true); }}>
                                    <Plus className="w-4 h-4 mr-2" /> Ajouter un administrateur
                                </Button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-2 space-y-1">
                                {isLoading ? (
                                    <p className="text-center text-slate-400 p-4 text-sm font-medium animate-pulse">Chargement...</p>
                                ) : filteredBoard.map(m => (
                                    <button
                                        key={m.id}
                                        onClick={() => { setIsCreatingBoard(false); setEditingMember(m); setBoardForm(m); }}
                                        className={cn(
                                            "w-full flex flex-col p-3 rounded-xl transition-all text-left border",
                                            editingMember?.id === m.id ? "bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/30" : "hover:bg-slate-50 dark:hover:bg-gray-700 border-transparent",
                                            m.status === 'Ancien' ? 'opacity-60' : ''
                                        )}
                                    >
                                        <div className="flex justify-between items-start w-full">
                                            <p className="font-bold text-sm text-slate-900 dark:text-white">{m.firstName} {m.lastName}</p>
                                            {m.status === 'Actif' && <span className="w-2 h-2 rounded-full bg-green-500 mt-1.5" title="Actif"></span>}
                                        </div>
                                        <p className="text-[10px] uppercase font-black text-amber-600 dark:text-amber-400 mt-1">{m.role}</p>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* RIGHT: EDITOR */}
                        <div className="flex-1 p-8 overflow-y-auto w-full">
                            {(isCreatingBoard || editingMember) ? (
                                <div className="max-w-2xl mx-auto space-y-8 animate-in slide-in-from-right-4">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-xl font-bold dark:text-white">{isCreatingBoard ? "Nouvel Administrateur" : "Édition du CA"}</h3>
                                        {editingMember && (
                                            <button onClick={() => {
                                                if (window.confirm("Supprimer ce membre définitivement du CA ?")) {
                                                    deleteBoardMember(editingMember.id);
                                                    resetBoardForm();
                                                }
                                            }} className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 className="w-5 h-5" /></button>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-bold text-slate-500 uppercase">Prénom</label>
                                            <input type="text" value={boardForm.firstName} onChange={e => setBoardForm({ ...boardForm, firstName: e.target.value })} className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm focus:ring-2 focus:ring-amber-500/30" />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-bold text-slate-500 uppercase">Nom</label>
                                            <input type="text" value={boardForm.lastName} onChange={e => setBoardForm({ ...boardForm, lastName: e.target.value })} className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm focus:ring-2 focus:ring-amber-500/30" />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-bold text-slate-500 uppercase">Rôle (CA)</label>
                                            <select value={boardForm.role} onChange={e => setBoardForm({ ...boardForm, role: e.target.value as any })} className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm focus:ring-2 focus:ring-amber-500/30 dark:text-white">
                                                {BoardRoleEnum.options.map((o: string) => <option key={o} value={o}>{o}</option>)}
                                            </select>
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-bold text-slate-500 uppercase">Statut</label>
                                            <select value={boardForm.status} onChange={e => setBoardForm({ ...boardForm, status: e.target.value as any })} className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm focus:ring-2 focus:ring-amber-500/30 dark:text-white">
                                                <option value="Actif">Actif (En fonction)</option>
                                                <option value="Ancien">Ancien Membre</option>
                                            </select>
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-bold text-slate-500 uppercase">Courriel</label>
                                            <input type="email" value={boardForm.email} onChange={e => setBoardForm({ ...boardForm, email: e.target.value })} className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm" />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-bold text-slate-500 uppercase">Téléphone</label>
                                            <input type="tel" value={boardForm.phone} onChange={e => setBoardForm({ ...boardForm, phone: e.target.value })} className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm" />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-bold text-slate-500 uppercase">Date d'entrée en fonction</label>
                                            <input type="date" value={boardForm.joinDate} onChange={e => setBoardForm({ ...boardForm, joinDate: e.target.value })} className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm" />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-bold text-slate-500 uppercase">Fin de mandat (Optionnel)</label>
                                            <input type="date" value={boardForm.termEndDate} onChange={e => setBoardForm({ ...boardForm, termEndDate: e.target.value })} className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm" />
                                        </div>
                                        <div className="space-y-1 col-span-2">
                                            <label className="text-[10px] font-bold text-slate-500 uppercase">Notes & Expertises</label>
                                            <textarea rows={3} value={boardForm.notes} onChange={e => setBoardForm({ ...boardForm, notes: e.target.value })} className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm"></textarea>
                                        </div>
                                    </div>
                                    <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-gray-700">
                                        <Button variant="outline" onClick={resetBoardForm}>Annuler</Button>
                                        <Button variant="primary" onClick={handleSaveBoard} disabled={!boardForm.firstName || !boardForm.lastName || !boardForm.joinDate} className="bg-amber-600 hover:bg-amber-500 shadow-amber-900/20">
                                            Sauvegarder
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center text-slate-400 dark:text-gray-600">
                                    <UserCheck className="w-16 h-16 mb-4 opacity-20" />
                                    <h3 className="text-xl font-bold mb-2">Conseil d'Administration</h3>
                                    <p className="text-sm">Sélectionnez un membre pour voir ses détails.</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* BODY - DOCUMENT VAULT OVERVIEW */}
                {activeTab === 'vault' && (
                    <div className="flex-1 overflow-auto flex flex-col bg-slate-50 dark:bg-gray-800/30 p-8">
                        <div className="flex justify-between items-center mb-8">
                            <h3 className="text-2xl font-black dark:text-white flex items-center gap-3">
                                <FileText className="w-8 h-8 text-indigo-500" /> Documents Officiels (Archives)
                            </h3>
                            <Button variant="primary" onClick={() => setIsUploading(!isUploading)}>
                                {isUploading ? "Fermer l'Upload" : <><UploadCloud className="w-4 h-4 mr-2" /> Ajouter un document</>}
                            </Button>
                        </div>

                        {isUploading && (
                            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-slate-200 dark:border-gray-700 mb-8 animate-in slide-in-from-top-4 shadow-sm">
                                <h4 className="text-sm font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400 mb-6">Nouvelle Archive</h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-slate-500 uppercase">Titre du document</label>
                                        <input type="text" value={vaultForm.title} onChange={e => setVaultForm({ ...vaultForm, title: e.target.value })} className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-gray-700 bg-slate-50 dark:bg-gray-900 text-sm focus:ring-2 focus:ring-indigo-500/30" placeholder="Ex: Procès-Verbal AGA 2025" />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-slate-500 uppercase">Type de document</label>
                                        <select value={vaultForm.type} onChange={e => setVaultForm({ ...vaultForm, type: e.target.value as any })} className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-gray-700 bg-slate-50 dark:bg-gray-900 text-sm focus:ring-2 focus:ring-indigo-500/30">
                                            <option>Procès-verbal</option>
                                            <option>Rapport d'activité</option>
                                            <option>États financiers</option>
                                            <option>Politique interne</option>
                                            <option>Autre</option>
                                        </select>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-slate-500 uppercase">Date liée au document</label>
                                        <input type="date" value={vaultForm.associatedDate} onChange={e => setVaultForm({ ...vaultForm, associatedDate: e.target.value })} className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-gray-700 bg-slate-50 dark:bg-gray-900 text-sm focus:ring-2 focus:ring-indigo-500/30" />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-slate-500 uppercase">Lien URL (Google Drive / Fichier)</label>
                                        <input type="url" value={vaultForm.url} onChange={e => setVaultForm({ ...vaultForm, url: e.target.value })} className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-gray-700 bg-slate-50 dark:bg-gray-900 text-sm focus:ring-2 focus:ring-indigo-500/30" placeholder="https://..." />
                                    </div>
                                </div>
                                <div className="flex justify-end gap-3">
                                    <Button variant="outline" onClick={resetVaultForm}>Annuler</Button>
                                    <Button variant="primary" onClick={handleSaveVault} disabled={!vaultForm.title || !vaultForm.url} className="bg-indigo-600 hover:bg-indigo-500 shadow-indigo-900/20">
                                        Enregistrer aux archives
                                    </Button>
                                </div>
                            </div>
                        )}

                        <div className="relative mb-6">
                            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                            <input
                                type="text"
                                placeholder="Rechercher une archive..."
                                className="w-full pl-11 pr-4 py-3 text-sm bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500/50 outline-none shadow-sm"
                                value={searchVault}
                                onChange={e => setSearchVault(e.target.value)}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {isLoading ? (
                                <p className="text-slate-500">Chargement des documents...</p>
                            ) : filteredVault.length === 0 ? (
                                <p className="text-slate-500 italic">Aucun document dans le coffre-fort.</p>
                            ) : filteredVault.map(doc => (
                                <div key={doc.id} className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-slate-200 dark:border-gray-700 shadow-sm group hover:shadow-md transition-all flex flex-col justify-between h-[160px]">
                                    <div>
                                        <div className="flex justify-between items-start mb-2">
                                            <span className="text-[10px] uppercase font-black tracking-widest text-indigo-500 bg-indigo-50 dark:bg-indigo-500/10 px-2 py-0.5 rounded">{doc.type}</span>
                                            <button onClick={() => {
                                                if (window.confirm(`Supprimer définitivement "${doc.title}" du registre ?`)) {
                                                    deleteVaultDocument(doc.id);
                                                }
                                            }} className="text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                        <h4 className="font-bold text-slate-900 dark:text-white line-clamp-2 leading-snug">{doc.title}</h4>
                                        {doc.associatedDate && <p className="text-xs text-slate-500 mt-1 flex items-center gap-1"><Calendar className="w-3 h-3" /> {doc.associatedDate}</p>}
                                    </div>
                                    <div className="border-t border-slate-100 dark:border-gray-700 pt-3 mt-3 flex justify-between items-center">
                                        <span className="text-[10px] text-slate-400">{new Date(doc.uploadDate).toLocaleDateString()}</span>
                                        <a href={doc.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-[10px] font-bold uppercase text-indigo-600 hover:underline">
                                            Ouvrir <ExternalLink className="w-3 h-3" />
                                        </a>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* BODY - BACKUP SYSTEMS */}
                {activeTab === 'backup' && (
                    <div className="flex-1 overflow-auto flex flex-col bg-slate-50 dark:bg-gray-800/30 p-8">
                        <div className="max-w-3xl mx-auto w-full space-y-8 animate-in fade-in slide-in-from-bottom-4">
                            <div className="flex items-center gap-4 mb-2">
                                <div className="p-3 bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 rounded-2xl">
                                    <Database className="w-8 h-8" />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black dark:text-white">Maintenance & Sauvegarde</h3>
                                    <p className="text-sm text-slate-500 font-medium italic">Gérez la persistance et l'archivage externe de vos données critiques.</p>
                                </div>
                            </div>

                            <Backup
                                lastBackupDate={new Date()} // Mocked for now, in prod fetch from Firestore metadata
                                onTriggerBackup={async () => {
                                    const functions = getFunctions();
                                    const triggerBackup = httpsCallable(functions, 'triggerManualBackup');
                                    await triggerBackup();
                                }}
                            />

                            <div className="p-6 rounded-2xl border border-amber-500/20 bg-amber-500/5 mt-8">
                                <h4 className="text-sm font-bold text-amber-600 dark:text-amber-400 flex items-center gap-2 mb-2">
                                    <Shield className="w-4 h-4" /> Note sur la Protection des Données
                                </h4>
                                <p className="text-xs text-slate-500 leading-relaxed">
                                    Les sauvegardes hebdomadaires sont automatiques (chaque dimanche à 00:00).
                                    Les données sont exportées au format JSON crypté vers le SharePoint institutionnel de <strong>MDJ Escale Jeunesse</strong>.
                                    Toute intervention manuelle est journalisée pour des fins d'audit.
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </Modal>
    );
};
