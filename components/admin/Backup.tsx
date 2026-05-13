import React, { useState } from 'react';
import { z } from 'zod';
import { Shield, RefreshCw, CheckCircle2, AlertCircle, Calendar, Mail } from 'lucide-react';

/** 
 * Zod schema for internal configuration validation.
 * Ensures the notification email follows a strict format.
 */
const backupConfigSchema = z.object({
    adminEmail: z.string().email("Format d'email invalide").optional().or(z.literal('')),
});

interface BackupProps {
    lastBackupDate: Date | null;
    onTriggerBackup: () => Promise<void>;
    className?: string;
}

/**
 * Backup Component
 * Manages, configures, and triggers system-wide backups to SharePoint.
 */
const Backup: React.FC<BackupProps> = ({
    lastBackupDate,
    onTriggerBackup,
    className = ''
}) => {
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [isSuccess, setIsSuccess] = useState<boolean>(false);
    const [adminEmail, setAdminEmail] = useState<string>('');

    const handleManualBackup = async (): Promise<void> => {
        // Reset states before starting
        setIsLoading(true);
        setError(null);
        setIsSuccess(false);

        try {
            // Validate configuration before triggering
            backupConfigSchema.parse({ adminEmail });

            await onTriggerBackup();
            setIsSuccess(true);
        } catch (err) {
            if (err instanceof z.ZodError) {
                setError(err.issues[0].message);
                return;
            }
            setError("Échec de la sauvegarde. Veuillez vérifier les logs système.");
        } finally {
            setIsLoading(false);
        }
    };

    const statusMessage = isSuccess
        ? "Sauvegarde réussie et synchronisée avec SharePoint."
        : error;

    return (
        <section
            className={`p-6 rounded-2xl border transition-all duration-300 ${isSuccess ? 'border-emerald-500/30 bg-emerald-500/5' :
                error ? 'border-rose-500/30 bg-rose-500/5' :
                    'border-subtle bg-surface'
                } ${className}`}
            aria-labelledby="backup-title"
        >
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400">
                        <Shield className="w-6 h-6" />
                    </div>
                    <div>
                        <h2 id="backup-title" className="text-lg font-bold text-primary">Système de Sauvegarde</h2>
                        <p className="text-xs text-muted">Firestore vers SharePoint (@mdjescalejeunesse.ca)</p>
                    </div>
                </div>

                <div className="flex items-center gap-2 text-xs font-medium text-muted bg-base px-3 py-1.5 rounded-lg border border-subtle">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Dernière sauvegarde : </span>
                    <span className="text-primary">
                        {lastBackupDate ? lastBackupDate.toLocaleString('fr-CA') : 'Jamais'}
                    </span>
                </div>
            </header>

            <article className="space-y-6">
                {/* Email Notification Config */}
                <div className="space-y-2">
                    <label htmlFor="admin-email" className="text-xs font-black uppercase tracking-widest text-muted flex items-center gap-2">
                        <Mail className="w-3.5 h-3.5" />
                        Email de notification (Optionnel)
                    </label>
                    <input
                        id="admin-email"
                        type="email"
                        value={adminEmail}
                        onChange={(e) => setAdminEmail(e.target.value)}
                        placeholder="admin@mdjescalejeunesse.ca"
                        className="w-full bg-base border border-subtle rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none"
                        aria-label="Email de notification pour la sauvegarde"
                    />
                </div>

                {/* Action & Status */}
                <div className="flex flex-col gap-4">
                    <button
                        onClick={handleManualBackup}
                        disabled={isLoading}
                        aria-disabled={isLoading}
                        className={`w-full md:w-auto px-6 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-95 ${isLoading
                            ? 'bg-subtle text-muted cursor-not-allowed opacity-70'
                            : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20'
                            }`}
                    >
                        <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                        {isLoading ? 'Opération en cours...' : 'Lancer une sauvegarde manuelle'}
                    </button>

                    {statusMessage && (
                        <div
                            className={`flex items-center gap-2 text-sm p-3 rounded-lg animate-in fade-in slide-in-from-left-2 ${isSuccess ? 'text-emerald-500' : 'text-rose-500'
                                }`}
                            role="alert"
                            aria-live="polite"
                        >
                            {isSuccess ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                            {statusMessage}
                        </div>
                    )}
                </div>
            </article>
        </section>
    );
};

export default Backup;
