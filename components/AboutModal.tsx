import React from 'react';
import { X, Trophy, Users, Layout, Zap, Mail, Phone, ExternalLink } from 'lucide-react';

interface AboutModalProps {
    onClose: () => void;
}

export const AboutModal: React.FC<AboutModalProps> = ({ onClose }) => {
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
            <div className="relative w-full max-w-2xl bg-surface border border-white/10 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                {/* Header with Background Pattern */}
                <div className="relative h-48 bg-slate-950 flex items-center justify-center overflow-hidden">
                    <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
                    <img
                        src="https://mdjescalejeunesse.ca/wp-content/uploads/2024/01/logo-du-planner-no-frame-l039escale-jeunesse-la-piaule.png"
                        alt="SOLI"
                        className="h-32 w-auto drop-shadow-[0_0_20px_rgba(255,255,255,0.5)] relative z-10"
                    />
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/40 text-white rounded-full transition-colors z-20"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-8 space-y-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
                    {/* Hero Section */}
                    <div className="text-center space-y-2">
                        <h2 className="text-2xl font-black text-primary uppercase tracking-tighter">
                            SOLI - LE COMPLICE DE VOTRE MISSION SOCIALE
                        </h2>
                        <div className="flex items-center justify-center gap-4 text-xs font-bold uppercase tracking-widest text-muted">
                            <span className="px-2 py-0.5 bg-indigo-500/10 text-indigo-400 rounded-md">Version 1.1.0</span>
                            <span className="px-2 py-0.5 bg-cyan-500/10 text-cyan-400 rounded-md">Mars 2026</span>
                        </div>
                    </div>

                    {/* Description */}
                    <div className="space-y-4">
                        <p className="text-sm leading-relaxed text-slate-400 font-medium italic text-center">
                            "SOLI est un écosystème de gestion pensé par et pour les intervenants jeunesse. L'application transforme les données quotidiennes en leviers de décision, permettant de passer moins de temps derrière un écran et plus de temps avec les jeunes."
                        </p>
                    </div>

                    {/* Features Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FeatureCard
                            icon={<Zap className="w-5 h-5 text-yellow-400" />}
                            title="Journal de Bord Centralisé"
                            desc="Saisissez vos interventions et observations quotidiennes en quelques clics."
                        />
                        <FeatureCard
                            icon={<Trophy className="w-5 h-5 text-indigo-400" />}
                            title="Reddition Automatisée"
                            desc="Générez vos rapports d'activités et statistiques (PSOC et autres) instantanément."
                        />
                        <FeatureCard
                            icon={<Users className="w-5 h-5 text-cyan-400" />}
                            title="Membres & Présences"
                            desc="Suivez l'évolution de vos jeunes et compilez les statistiques en temps réel."
                        />
                        <FeatureCard
                            icon={<Layout className="w-5 h-5 text-emerald-400" />}
                            title="Planification Interactive"
                            desc="Une vue globale sur la programmation pour une coordination sans failles."
                        />
                    </div>

                    {/* Footer Info */}
                    <div className="pt-8 border-t border-white/5 grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <h3 className="text-xs font-black uppercase tracking-widest text-indigo-400">Conception</h3>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                                    <span className="font-black text-lg">M</span>
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-primary">Sébastien Johnson</p>
                                    <p className="text-[10px] text-muted font-bold uppercase tracking-tighter">Majuscule</p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h3 className="text-xs font-black uppercase tracking-widest text-cyan-400">Support Technique</h3>
                            <div className="space-y-2">
                                <a href="mailto:majuscule.animateur@gmail.com" className="flex items-center gap-2 text-sm text-slate-400 hover:text-cyan-400 transition-colors group">
                                    <Mail className="w-4 h-4" />
                                    majuscule.animateur@gmail.com
                                </a>
                                <a href="tel:8196941977" className="flex items-center gap-2 text-sm text-slate-400 hover:text-cyan-400 transition-colors">
                                    <Phone className="w-4 h-4" />
                                    819 694-1977
                                </a>
                            </div>
                        </div>
                    </div>

                    <div className="text-center pt-4">
                        <p className="text-[9px] text-muted font-black uppercase tracking-[0.3em] opacity-50">
                            Propulsé par MDJ L'Escale Jeunesse © 2026
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

interface FeatureCardProps {
    icon: React.ReactNode;
    title: string;
    desc: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, desc }) => (
    <div className="p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 transition-colors space-y-2">
        <div className="flex items-center gap-3">
            {icon}
            <h3 className="text-sm font-bold text-primary tracking-tight">{title}</h3>
        </div>
        <p className="text-xs text-slate-400 leading-relaxed">{desc}</p>
    </div>
);

export default AboutModal;
