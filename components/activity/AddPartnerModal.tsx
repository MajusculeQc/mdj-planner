import React, { useState } from 'react';
import { X, Save, Globe, Phone, MapPin, Mail, Facebook, LayoutGrid, Search, Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';
import { ECOSYSTEME_PARTENAIRES } from '../../lib/constants';

interface AddPartnerModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (partner: any) => Promise<void>;
}

const CATEGORIES = [
    'Loisirs et Sports',
    'Culture et Divertissement',
    'Santé et Prévention',
    'Inclusion et Droits',
    'Développement et Proximité',
    'Réseau Inter-MDJ',
    'Services Publics',
    'Lieux Divers'
];

const AddPartnerModal: React.FC<AddPartnerModalProps> = ({ isOpen, onClose, onSave }) => {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        category: 'Loisirs et Sports',
        address: '',
        phone: '',
        email: '',
        website: '',
        facebook: ''
    });

    if (!isOpen) return null;

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name || !formData.address) return;

        setLoading(true);
        try {
            await onSave({
                ...formData,
                id: `cp-${Date.now()}`
            });
            onClose();
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-[2.5rem] shadow-2xl border border-slate-100 dark:border-white/10 overflow-hidden animate-in zoom-in-95 duration-300">
                {/* Header */}
                <div className="bg-slate-50/50 dark:bg-white/5 px-8 py-6 border-b border-slate-100 dark:border-white/10 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-2xl bg-indigo-500 text-white shadow-lg shadow-indigo-500/20">
                            <LayoutGrid className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Nouveau Partenaire</h2>
                            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Ajouter un lieu à la base de données</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-white/10 rounded-full transition-colors">
                        <X className="w-5 h-5 text-slate-400" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSave} className="p-8 space-y-6">
                    <div className="space-y-4">
                        {/* Section Identité (Pleine largeur) */}
                        <div className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-slate-400 dark:text-gray-500 uppercase tracking-widest ml-1">Nom de l'organisme</label>
                                <input
                                    required
                                    type="text"
                                    placeholder="Ex: Musée POP"
                                    className="w-full bg-slate-50 dark:bg-gray-800/50 border border-slate-200 dark:border-white/10 rounded-2xl px-4 py-3 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-slate-400 dark:text-gray-500 uppercase tracking-widest ml-1">Catégorie</label>
                                <select
                                    className="w-full bg-slate-50 dark:bg-gray-800/50 border border-slate-200 dark:border-white/10 rounded-2xl px-4 py-3 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all appearance-none"
                                    value={formData.category}
                                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                                >
                                    {CATEGORIES.map(c => (
                                        <option key={c} value={c}>{c}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Section Localisation (Pleine largeur) */}
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-400 dark:text-gray-500 uppercase tracking-widest ml-1 flex items-center gap-1.5">
                                <MapPin className="w-3 h-3" /> Adresse Complète
                            </label>
                            <input
                                required
                                type="text"
                                placeholder="123 rue Royale, Trois-Rivières..."
                                className="w-full bg-slate-50 dark:bg-gray-800/50 border border-slate-200 dark:border-white/10 rounded-2xl px-4 py-3 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                                value={formData.address}
                                onChange={e => setFormData({ ...formData, address: e.target.value })}
                            />
                        </div>

                        {/* Section Contacts (Grille 2 colonnes) */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-slate-400 dark:text-gray-500 uppercase tracking-widest ml-1 flex items-center gap-1.5">
                                    <Phone className="w-3 h-3" /> Téléphone
                                </label>
                                <input
                                    type="tel"
                                    placeholder="(819) ..."
                                    className="w-full bg-slate-50 dark:bg-gray-800/50 border border-slate-200 dark:border-white/10 rounded-2xl px-4 py-3 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                                    value={formData.phone}
                                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-slate-400 dark:text-gray-500 uppercase tracking-widest ml-1 flex items-center gap-1.5">
                                    <Mail className="w-3 h-3" /> Courriel
                                </label>
                                <input
                                    type="email"
                                    placeholder="info@..."
                                    className="w-full bg-slate-50 dark:bg-gray-800/50 border border-slate-200 dark:border-white/10 rounded-2xl px-4 py-3 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                                    value={formData.email}
                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>
                        </div>

                        {/* Section Digital (Grille 2 colonnes) */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-slate-400 dark:text-gray-500 uppercase tracking-widest ml-1 flex items-center gap-1.5">
                                    <Globe className="w-3 h-3" /> Site Web
                                </label>
                                <div className="relative group">
                                    <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                                    <input
                                        type="url"
                                        placeholder="https://..."
                                        className="w-full bg-slate-50 dark:bg-gray-800/50 border border-slate-200 dark:border-white/10 rounded-2xl pl-11 pr-4 py-3 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                                        value={formData.website}
                                        onChange={e => setFormData({ ...formData, website: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-slate-400 dark:text-gray-500 uppercase tracking-widest ml-1 flex items-center gap-1.5">
                                    <Facebook className="w-3 h-3 text-[#1877F2]" /> Facebook
                                </label>
                                <div className="relative group">
                                    <Facebook className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-[#1877F2] transition-colors" />
                                    <input
                                        type="url"
                                        placeholder="Page officielle..."
                                        className="w-full bg-slate-50 dark:bg-gray-800/50 border border-slate-200 dark:border-white/10 rounded-2xl pl-11 pr-4 py-3 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                                        value={formData.facebook}
                                        onChange={e => setFormData({ ...formData, facebook: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-6 py-4 rounded-2xl text-sm font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5 transition-all"
                        >
                            Annuler
                        </button>
                        <button
                            type="submit"
                            disabled={loading || !formData.name || !formData.address}
                            className="flex-1 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 text-white px-6 py-4 rounded-2xl text-sm font-bold shadow-lg shadow-indigo-500/20 transition-all flex items-center justify-center gap-2"
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                            Enregistrer
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddPartnerModal;
