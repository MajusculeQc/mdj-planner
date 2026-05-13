import React from 'react';
import { FileText, Upload, Trash2, File, Eye, Download, Info, FileImage, FileCode } from 'lucide-react';
import { Activity, ActivityDocument } from '../../types';
import { cn } from '../../lib/utils';

interface DocumentsTabProps {
    activity: Activity;
    handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleDeleteFile: (fileId: string) => void;
    formatFileSize: (bytes: number) => string;
}

const getFileIcon = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'].includes(ext || '')) return <FileImage className="w-8 h-8 text-pink-500" />;
    if (['pdf'].includes(ext || '')) return <FileText className="w-8 h-8 text-red-500" />;
    if (['doc', 'docx'].includes(ext || '')) return <FileText className="w-8 h-8 text-blue-500" />;
    if (['xls', 'xlsx'].includes(ext || '')) return <FileCode className="w-8 h-8 text-green-500" />;
    return <File className="w-8 h-8 text-slate-400" />;
};

const DocumentsTab: React.FC<DocumentsTabProps> = ({
    activity,
    handleFileUpload,
    handleDeleteFile,
    formatFileSize
}) => {
    const { documents } = activity;

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* UPLOAD HERO SECTION */}
            <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-3xl blur opacity-10 group-hover:opacity-20 transition duration-1000 group-hover:duration-200"></div>
                <div className="relative bg-white dark:bg-white/5 border border-slate-100 dark:border-white/10 p-10 rounded-3xl flex flex-col items-center justify-center text-center transition-all">
                    <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center mb-6 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-500/20 group-hover:scale-110 transition-transform duration-500">
                        <Upload className="w-8 h-8" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">Ajouter des documents</h3>
                    <p className="text-sm text-slate-500 dark:text-gray-400 max-w-xs mb-8">
                        Photos, menus, listes de participants, décharges de responsabilité ou plans PDF.
                    </p>

                    <label className="cursor-pointer px-8 py-3 bg-indigo-600 hover:bg-white text-white hover:text-indigo-600 border-2 border-indigo-600 rounded-2xl text-[10px] font-bold uppercase tracking-widest transition-all shadow-xl shadow-indigo-600/20 flex items-center gap-2 active:scale-95">
                        <Upload className="w-4 h-4" /> Sélectionner un fichier
                        <input
                            type="file"
                            className="hidden"
                            multiple
                            onChange={handleFileUpload}
                        />
                    </label>
                    <p className="mt-4 text-[9px] text-slate-400 uppercase tracking-widest font-bold opacity-50">Taille max : 10 Mo par fichier</p>
                </div>
            </div>

            {/* DOCUMENTS LIST */}
            <section className="space-y-4">
                <div className="flex items-center gap-3 mb-6 px-1">
                    <div className="p-2 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-500 dark:text-gray-400">
                        <FileText className="w-4 h-4" />
                    </div>
                    <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-gray-500">Documents rattachés ({documents?.length || 0})</h3>
                </div>

                {(!documents || documents.length === 0) ? (
                    <div className="py-20 bg-slate-50/50 dark:bg-white/2 rounded-3xl border-2 border-dashed border-slate-100 dark:border-white/5 flex flex-col items-center justify-center text-slate-300 dark:text-gray-700">
                        <Info className="w-10 h-10 mb-4 opacity-10" />
                        <p className="text-sm font-medium italic">Aucun document pour le moment.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {documents.map((doc) => (
                            <div
                                key={doc.id}
                                className="group relative bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 p-4 rounded-2xl flex items-center gap-4 hover:border-indigo-500/30 hover:shadow-lg transition-all animate-in zoom-in-95 duration-300"
                            >
                                <div className="flex-none p-3 rounded-xl bg-slate-50 dark:bg-gray-800/50 group-hover:scale-110 transition-transform">
                                    {getFileIcon(doc.name)}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <h4 className="text-xs font-bold text-slate-800 dark:text-white truncate pr-6" title={doc.name}>
                                        {doc.name}
                                    </h4>
                                    <p className="text-[9px] text-slate-400 dark:text-gray-500 mt-0.5 font-bold uppercase tracking-tighter">
                                        {formatFileSize(doc.size)} • {new Date(doc.dateAdded).toLocaleDateString('fr-CA')}
                                    </p>
                                </div>

                                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => handleDeleteFile(doc.id)}
                                        className="p-1.5 bg-red-50 dark:bg-red-500/20 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-all shadow-sm"
                                        title="Supprimer"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                </div>

                                <div className="absolute bottom-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <a
                                        href={doc.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="p-1.5 bg-indigo-50 dark:bg-indigo-500/20 text-indigo-500 rounded-lg hover:bg-indigo-500 hover:text-white transition-all shadow-sm"
                                        title="Voir / Télécharger"
                                    >
                                        <Eye className="w-3.5 h-3.5" />
                                    </a>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
};

export default DocumentsTab;
