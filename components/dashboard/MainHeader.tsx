import React from 'react';
import {
    Sparkles,
    Mail,
    Zap,
    Cloud,
    LogIn,
    LogOut,
    User as UserIcon,
    ChevronLeft,
    ChevronRight,
    Printer,
    Database,
    Plus
} from 'lucide-react';
import { User } from 'firebase/auth';
import { db, FirebaseService } from '../../services/firebaseService';
import { ThemeToggle } from '../ui/ThemeToggle';
import { getEmployeeName } from '../../lib/constants';
import { NotificationsCloche } from './NotificationsCloche';

interface MainHeaderProps {
    monthTheme: string;
    setMonthTheme: (val: string) => void;
    handleSaveTheme: (e: React.KeyboardEvent | React.FocusEvent) => void;
    currentMonthName: string;
    setShowChat: (val: boolean) => void;
    setShowSyncPreview: (val: boolean) => void;
    setShowProfileModal: (val: boolean) => void;
    currentUser: User | null;
    currentUserAvatar: string | null;
    handleLogout: () => void;
    handleMicrosoftLogin: () => void;
    handleGoogleLogin: () => void;
    showLoginMenu: boolean;
    setShowLoginMenu: (val: boolean) => void;
    goToPrevMonth: () => void;
    goToNextMonth: () => void;
    handleExportHtml: () => void;
    isEditingTheme: boolean;
    setIsEditingTheme: (val: boolean) => void;
    isSuperAdmin: boolean;
    alerts?: {
        incompleteAlerts: any[];
        staffConflicts: any[];
        lowStockItems: any[];
    };
    onSelectActivity: (id: string, tab?: string) => void;
    onManageInventory: (item: any) => void;
    handleSubmitMonth?: () => void;
    handleEmailLogin: (email: string, pass: string) => Promise<void>;
    onCreateActivity?: () => void;
}

export const MainHeader: React.FC<MainHeaderProps> = ({
    monthTheme,
    setMonthTheme,
    handleSaveTheme,
    currentMonthName,
    setShowChat,
    setShowSyncPreview,
    setShowProfileModal,
    currentUser,
    currentUserAvatar,
    handleLogout,
    handleMicrosoftLogin,
    handleGoogleLogin,
    showLoginMenu,
    setShowLoginMenu,
    goToPrevMonth,
    goToNextMonth,
    handleExportHtml,
    isEditingTheme,
    setIsEditingTheme,
    isSuperAdmin,
    alerts,
    onSelectActivity,
    onManageInventory,
    handleSubmitMonth,
    handleEmailLogin,
    onCreateActivity
}) => {
    const [showMaintenanceLogin, setShowMaintenanceLogin] = React.useState(false);
    const [mEmail, setMEmail] = React.useState('admin@mdjescalejeunesse.ca');
    const [mPass, setMPass] = React.useState('');

    return (
        <header className="sticky top-0 z-40 w-full bg-surface/95 backdrop-blur-xl transition-colors duration-300">
            <div className="flex items-center justify-between h-16 px-6 gap-4">
                {/* Left: Month Navigation */}
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                        <button onClick={goToPrevMonth} className="p-2 hover:bg-base rounded-xl transition-colors text-muted hover:text-primary">
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <h1 className="text-sm border-0 sm:text-lg font-black text-primary uppercase tracking-wider min-w-[120px] sm:min-w-[180px] text-center">
                            {currentMonthName}
                        </h1>
                        <button onClick={goToNextMonth} className="p-2 hover:bg-base rounded-xl transition-colors text-muted hover:text-primary">
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>


                    {/* Theme input */}
                    <div className="hidden lg:flex items-center gap-2">
                        <input
                            type="text"
                            value={monthTheme}
                            onChange={(e) => setMonthTheme(e.target.value)}
                            onKeyDown={handleSaveTheme}
                            onBlur={handleSaveTheme}
                            placeholder="Thématique du mois..."
                            className="bg-base border border-subtle rounded-xl px-3 py-1.5 text-sm font-medium text-primary focus:ring-1 focus:ring-indigo-500/50 focus:border-indigo-500/50 placeholder:text-muted w-56 transition-all outline-none"
                        />
                    </div>
                </div>

                {/* Center: Submit Button */}
                {handleSubmitMonth && (
                    <button
                        onClick={handleSubmitMonth}
                        className="hidden md:flex items-center gap-2 px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30"
                    >
                        <Mail className="w-4 h-4" />
                        Soumettre
                    </button>
                )}

                {/* Right: Actions */}
                <div className="flex items-center gap-1.5 sm:gap-2.5">
                    {alerts && (
                        <NotificationsCloche
                            alerts={alerts}
                            onSelectActivity={onSelectActivity}
                            onManageInventory={onManageInventory}
                        />
                    )}

                    <button
                        onClick={() => setShowChat(true)}
                        title="Assistant IA"
                        className="p-2 sm:p-2.5 rounded-xl bg-indigo-500/5 border border-indigo-500/10 text-indigo-400 hover:bg-indigo-500/10 hover:border-indigo-500/30 transition-all active:scale-95 group"
                    >
                        <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                    </button>

                    <button
                        onClick={handleExportHtml}
                        title="Exporter calendrier"
                        className="hidden sm:flex p-2.5 rounded-xl bg-slate-500/5 border border-slate-500/10 text-slate-400 hover:bg-slate-500/10 hover:text-slate-200 transition-all active:scale-95"
                    >
                        <Printer className="w-5 h-5" />
                    </button>

                    <button
                        onClick={() => setShowSyncPreview(true)}
                        title="Sync Web"
                        className="hidden sm:flex p-2.5 rounded-xl bg-indigo-500/5 border border-indigo-500/10 text-indigo-400 hover:bg-indigo-500/10 hover:border-indigo-500/30 transition-all active:scale-95"
                    >
                        <Cloud className="w-5 h-5" />
                    </button>

                    <div className="h-6 w-px bg-subtle/50 mx-1" />
                    <ThemeToggle />

                    {currentUser ? (
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setShowProfileModal(true)}
                                className="flex items-center gap-2.5 group"
                            >
                                <div className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center overflow-hidden border border-white/10 group-hover:border-indigo-500/50 transition-colors">
                                    {currentUserAvatar ? (
                                        <img src={currentUserAvatar} className="w-full h-full object-cover" alt="Profil" />
                                    ) : (
                                        <UserIcon className="w-4 h-4 text-slate-400" />
                                    )}
                                </div>
                                <span className="hidden lg:block text-xs font-bold text-slate-300 group-hover:text-white transition-colors max-w-[100px] truncate">
                                    {currentUser.displayName || getEmployeeName(currentUser.email ?? '')}
                                </span>
                            </button>
                            <button
                                onClick={handleLogout}
                                title="Déconnexion"
                                className="p-2 text-slate-500 hover:text-rose-400 transition-colors"
                            >
                                <LogOut className="w-4 h-4" />
                            </button>
                        </div>
                    ) : (
                        <div className="relative">
                            {!showLoginMenu ? (
                                <button
                                    onClick={() => setShowLoginMenu(true)}
                                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-500 transition-all"
                                >
                                    <LogIn className="w-4 h-4" /> Connexion
                                </button>
                            ) : (
                                <div className="absolute top-full right-0 mt-2 w-64 bg-slate-900 border border-white/10 rounded-2xl shadow-2xl p-4 z-50 flex flex-col gap-3 animate-in fade-in slide-in-from-top-2">
                                    <div className="flex justify-center mb-2">
                                        <img
                                            src="https://mdjescalejeunesse.ca/wp-content/uploads/2024/01/logo-du-planner-no-frame-l039escale-jeunesse-la-piaule.png"
                                            alt="SOLI"
                                            className="w-32 h-auto drop-shadow-[0_0_12px_rgba(99,102,241,0.3)]"
                                        />
                                    </div>
                                    <button
                                        onClick={handleMicrosoftLogin}
                                        className="flex items-center gap-3 w-full px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white font-medium text-xs transition-colors border border-white/5"
                                    >
                                        <img src="https://www.microsoft.com/favicon.ico" className="w-4 h-4" alt="Microsoft" />
                                        Microsoft 365
                                    </button>
                                    <button
                                        onClick={handleGoogleLogin}
                                        className="flex items-center gap-3 w-full px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white font-medium text-xs transition-colors border border-white/5"
                                    >
                                        <img src="https://www.google.com/favicon.ico" className="w-4 h-4" alt="Google" />
                                        Google
                                    </button>

                                    {!showMaintenanceLogin ? (
                                        <button
                                            onClick={() => setShowMaintenanceLogin(true)}
                                            className="w-full py-2 text-[10px] text-slate-500 hover:text-indigo-400 transition-colors uppercase font-black tracking-widest"
                                        >
                                            Maintenance Access
                                        </button>
                                    ) : (
                                        <div className="flex flex-col gap-2 p-2 bg-black/20 rounded-xl border border-white/5">
                                            <input
                                                type="email"
                                                value={mEmail}
                                                onChange={(e) => setMEmail(e.target.value)}
                                                className="bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-[10px] text-white outline-none focus:border-indigo-500"
                                                placeholder="Email..."
                                            />
                                            <input
                                                type="password"
                                                value={mPass}
                                                onChange={(e) => setMPass(e.target.value)}
                                                className="bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-[10px] text-white outline-none focus:border-indigo-500"
                                                placeholder="Mot de passe..."
                                                onKeyDown={(e) => e.key === 'Enter' && handleEmailLogin(mEmail, mPass)}
                                            />
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleEmailLogin(mEmail, mPass)}
                                                    className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-[9px] font-black uppercase rounded-lg"
                                                >
                                                    Connexion
                                                </button>
                                                <button
                                                    onClick={() => setShowMaintenanceLogin(false)}
                                                    className="px-3 py-2 bg-white/5 hover:bg-white/10 text-slate-400 text-[9px] font-black uppercase rounded-lg"
                                                >
                                                    Annuler
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    <p className="text-[9px] text-rose-400 text-center mt-1">
                                        Réservé @mdjescalejeunesse.ca
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};
