import React, { useState, useEffect, memo, useCallback, useRef, useMemo } from 'react';
import { z } from 'zod';
import { Activity, ActivityType, ActivityDocument, ActivityComment, Material, RiskManagement, Logistics, YouthInvolvement } from '../types';
import { X, LayoutDashboard, History, Users, Hand, MapPin, ShieldAlert, DollarSign, Truck, Folder, GripVertical, Printer, Save, CheckSquare, Clock, Trash2, ClipboardCheck, Copy, AlertCircle, Globe, BookOpen } from 'lucide-react';
import { STAFF_LIST, SUPPORT_STAFF_EXTRAS, TEAM_DIRECTORY, SUGGESTIONS, DEFAULT_START_TIME, DEFAULT_END_TIME, HOMEWORK_HELP_START_TIME, HOMEWORK_HELP_END_TIME } from '../lib/constants';

import { calculateActivityReadiness } from '../lib/readiness';
import { suggestDimensions } from '../lib/rmjqUtils';
import { FirebaseService } from '../services/firebaseService';
import { parseActivityStrict } from '../lib/schemas';
import { checkStaffConflict, getConflictingActivities } from '../lib/staffConflict';
import { isSuperAdmin } from '../lib/auth-utils';
import { cn, isAbsence } from '../lib/utils';
import { getRMJQFromObjectives, getPSOCFromType } from '../lib/taxonomyMapping';
import { useCustomSuggestions } from '../hooks/useCustomSuggestions';

// Import modular components
import ChecklistTab from './activity/ChecklistTab';
import StaffTab from './activity/StaffTab';
import PedagogyTab from './activity/PedagogyTab';
import LogisticsTab from './activity/LogisticsTab';
import RiskTab from './activity/RiskTab';
import BudgetTab from './activity/BudgetTab';
import MaterialsTab from './activity/MaterialsTab';
import DocumentsTab from './activity/DocumentsTab';
import JournalTab from './activity/JournalTab';
import ControlTab from './activity/ControlTab';
import JournalDeBordTab from './activity/JournalDeBordTab';
import { useInventory } from '../hooks/useInventory';
import { useReservations } from '../hooks/useReservations';
import { useActivities } from '../hooks/useActivities';
import { RegistrationsTab } from './activity/RegistrationsTab';
import AICorrectButton from './ui/AICorrectButton';

interface Props {
  activity: Activity;
  onClose: () => void;
  onSave: (updated: Activity) => void;
  onDelete?: (id: string) => void;
  userEmail?: string;
  allActivities?: Activity[];
  initialTab?: string;
  onClone?: (activity: Activity) => Promise<void>;
}

type TabId = 'checklist' | 'pedagogy' | 'logistics' | 'materials' | 'risk' | 'staff' | 'budget' | 'documents' | 'inscriptions' | 'jdb' | 'journal' | 'control';

interface TabDef {
  id: TabId;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const DEFAULT_TABS: TabDef[] = [
  { id: 'logistics', label: 'Logistique', icon: MapPin },
  { id: 'staff', label: 'Équipe', icon: Users },
  { id: 'pedagogy', label: 'Pédagogie', icon: Hand },
  { id: 'risk', label: 'Risques', icon: ShieldAlert },
  { id: 'control', label: 'Contrôle', icon: ClipboardCheck },
  { id: 'materials', label: 'Matériel', icon: Truck },
  { id: 'inscriptions', label: 'Inscriptions', icon: Globe },
  { id: 'jdb', label: 'Journal De Bord', icon: CheckSquare },
  { id: 'documents', label: 'Documents', icon: Folder },
  { id: 'checklist', label: 'Checklist', icon: LayoutDashboard },
  { id: 'journal', label: 'Historique', icon: History },
];

const TAB_MAP = Object.fromEntries(DEFAULT_TABS.map(t => [t.id, t])) as Record<TabId, TabDef>;

function getStorageKey(email?: string) {
  return `mdj-tab-order-v2-${email ?? 'default'}`;
}

function loadTabOrder(email?: string): TabDef[] {
  try {
    const raw = localStorage.getItem(getStorageKey(email));
    if (!raw) return DEFAULT_TABS;
    const ids: TabId[] = JSON.parse(raw);
    // Rebuild from the saved ID order, keeping icon refs intact
    const ordered = ids.map(id => TAB_MAP[id]).filter(Boolean);
    // Append any new tabs not yet saved
    const seen = new Set(ids);
    DEFAULT_TABS.forEach(t => { if (!seen.has(t.id)) ordered.push(t); });
    return ordered;
  } catch {
    return DEFAULT_TABS;
  }
}

function saveTabOrder(tabs: TabDef[], email?: string) {
  localStorage.setItem(getStorageKey(email), JSON.stringify(tabs.map(t => t.id)));
}



const DEFAULT_SUPPORT_STAFF = [
  ...STAFF_LIST,
  ...SUPPORT_STAFF_EXTRAS,
];

const ActivityModal: React.FC<Props> = memo(({ activity: initialActivity, onClose, onSave, onDelete, userEmail, allActivities, initialTab, onClone }) => {
  const { addSuggestions } = useCustomSuggestions();

  // CRUCIAL: Initialisation sécurisée du champ documents
  const [activity, setActivity] = useState<Activity>({
    ...initialActivity,
    documents: initialActivity.documents || [],
    comments: initialActivity.comments || [],
    youthInvolvement: {
      level: (initialActivity.youthInvolvement?.level && ['Consultation', 'Organisation', 'Animation', 'Participation'].includes(initialActivity.youthInvolvement.level))
        ? initialActivity.youthInvolvement.level
        : null,
      tasks: initialActivity.youthInvolvement?.tasks || []
    },
    checklist: initialActivity.checklist || [],
    journal: initialActivity.journal || '',
    types: (initialActivity.types && initialActivity.types.length > 0)
      ? initialActivity.types
      : (initialActivity.type ? [initialActivity.type] : []),
  });
  const [showTransfer, setShowTransfer] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [tabs, setTabs] = useState<TabDef[]>(() => loadTabOrder(userEmail));
  const dragTab = useRef<number | null>(null);
  const dragOverTab = useRef<number | null>(null);

  const [activeTab, setActiveTab] = useState<TabId>((initialTab as TabId) || 'logistics');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isTransferring, setIsTransferring] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const { items: inventoryItems, updateItemCondition } = useInventory(userEmail);
  const { reservations: allReservations, validateConsumption } = useReservations(inventoryItems, userEmail);
  const { setConsumptionValidated } = useActivities(userEmail);

  const activityReservations = useMemo(() =>
    allReservations.filter(r => r.activityId === activity.id),
    [allReservations, activity.id]);

  const updateLogistics = (updates: Partial<Logistics>) => {
    setActivity(prev => ({ ...prev, logistics: { ...prev.logistics, ...updates } }));
  };

  const updateYouthInvolvement = (updates: Partial<YouthInvolvement>) => {
    setActivity(prev => ({ ...prev, youthInvolvement: { ...prev.youthInvolvement, ...updates } }));
  };

  const updateStats = (updates: Partial<Activity['stats']>) => {
    setActivity(prev => ({ ...prev, stats: { ...prev.stats, ...updates } }));
  };

  const handleTransferResponsibility = async (newLeadEmail: string) => {
    if (!newLeadEmail) return;
    setIsTransferring(true);
    try {
      const previousLead = activity.staffing.leadStaff || 'Non assigné';
      const newLeadName = Object.keys(TEAM_DIRECTORY).find(k => TEAM_DIRECTORY[k] === newLeadEmail) || newLeadEmail;

      const updatedActivity = {
        ...activity,
        staffing: { ...activity.staffing, leadStaff: newLeadName }
      };

      setActivity(updatedActivity);
      setShowTransfer(false);

      // Notify via Firebase
      await FirebaseService.notifyTransfer(
        updatedActivity,
        previousLead,
        newLeadName,
        newLeadEmail,
        (userEmail && TEAM_DIRECTORY[userEmail]) ? Object.keys(TEAM_DIRECTORY).find(k => TEAM_DIRECTORY[k] === userEmail) || userEmail : (userEmail || 'Inconnu')
      );
    } catch (error) {
      console.error("Transfer error:", error);
      alert("Erreur lors du transfert de responsabilité.");
    } finally {
      setIsTransferring(false);
    }
  };

  const autoSuggestAll = async () => {
    if (!activity.title) {
      alert("Veuillez donner un titre à l'activité pour générer des suggestions.");
      return;
    }
    setIsGenerating(true);
    try {
      const suggestions = suggestDimensions(activity.title, activity.description);
      setActivity(prev => ({
        ...prev,
        rmjqDimensions: [...new Set([...(prev.rmjqDimensions || []), ...suggestions])]
      }));
    } finally {
      setIsGenerating(false);
    }
  };

  const availableLeadStaff = useMemo(() => {
    if (!allActivities) return Object.keys(TEAM_DIRECTORY);
    const absencesToday = allActivities.filter((a: Activity) => a.date === activity.date && isAbsence(a.title));
    const absentNames = absencesToday.map((a: Activity) => {
      const match = a.title.match(/^(?:absence|vacances?|cong[eé]s?)\s*(?:-|:)?\s*(.+)$/i);
      return match ? match[1].trim().toLowerCase() : '';
    });
    return Object.keys(TEAM_DIRECTORY).filter((name: string) => {
      const nameLower = name.toLowerCase();
      return !absentNames.some((absent: string) => absent && absent.length >= 2 && (nameLower.includes(absent) || absent.includes(nameLower)));
    });
  }, [activity.date, allActivities]);

  const availableSupportStaff = useMemo(() => {
    if (!allActivities) return DEFAULT_SUPPORT_STAFF;
    const absencesToday = allActivities.filter((a: Activity) => a.date === activity.date && isAbsence(a.title));
    const absentNames = absencesToday.map((a: Activity) => {
      const match = a.title.match(/^(?:absence|vacances?|cong[eé]s?)\s*(?:-|:)?\s*(.+)$/i);
      return match ? match[1].trim().toLowerCase() : '';
    });
    return DEFAULT_SUPPORT_STAFF.filter((name: string) => {
      const nameLower = name.toLowerCase();
      return !absentNames.some((absent: string) => absent && absent.length >= 2 && (nameLower.includes(absent) || absent.includes(nameLower)));
    });
  }, [activity.date, allActivities]);

  // --- IMPRESSION FICHE TERRAIN (Mise à jour) ---
  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert("Veuillez autoriser les pop-ups pour imprimer.");
      return;
    }

    // Icônes SVG pour l'impression
    const icons = {
      clock: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>`,
      map: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>`,
      bus: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="6" width="18" height="11" rx="2"></rect><path d="M14 17v4"></path><path d="M6 17v4"></path><path d="M3 11h18"></path></svg>`,
      users: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>`,
      brain: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z"></path><path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z"></path></svg>`,
      shield: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>`,
      box: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>`
    };

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>FICHE : ${activity.title}</title>
        <style>
          @page { size: 8.5in 11in; margin: 0.5in; }
          body { font-family: 'Helvetica Neue', Arial, sans-serif; color: #1a202c; line-height: 1.3; margin: 0; padding: 0; -webkit-print-color-adjust: exact; }
          
          /* HEADER */
          .header { background-color: #2d3748; color: white; padding: 15px 20px; border-radius: 6px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
          .header h1 { margin: 0; font-size: 22px; text-transform: uppercase; letter-spacing: 1px; }
          .header-meta { margin-top: 5px; opacity: 0.9; font-size: 13px; display: flex; align-items: center; gap: 15px; }
          .badge { background: #4299e1; color: white; padding: 3px 8px; border-radius: 4px; font-weight: bold; font-size: 11px; text-transform: uppercase; }
          .score-circle { width: 45px; height: 45px; border-radius: 50%; border: 3px solid #48bb78; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 14px; color: #48bb78; background: #fff; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }

          /* LAYOUT */
          .container { display: grid; grid-template-columns: 1fr 1fr; gap: 25px; }
          
          /* SECTIONS */
          .section { border: 1px solid #e2e8f0; border-radius: 6px; padding: 12px; background: #fff; margin-bottom: 15px; break-inside: avoid; }
          .section-title { font-size: 11px; font-weight: 800; text-transform: uppercase; color: #718096; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; margin-bottom: 10px; display: flex; align-items: center; gap: 6px; letter-spacing: 0.5px; }
          
          .row { display: flex; justify-content: space-between; margin-bottom: 6px; font-size: 11px; }
          .label { font-weight: 700; color: #4a5568; }
          .value { text-align: right; color: #000; font-weight: 500; max-width: 65%; }
          
          /* LISTS & TEXT */
          .description { font-style: italic; background: #f7fafc; padding: 10px; border-radius: 4px; font-size: 11px; color: #2d3748; border-left: 3px solid #cbd5e0; margin-bottom: 10px; }
          .list-item { display: flex; align-items: flex-start; gap: 6px; font-size: 11px; margin-bottom: 4px; line-height: 1.4; }
          .checkbox { width: 10px; height: 10px; border: 1px solid #a0aec0; border-radius: 2px; display: inline-block; margin-top: 2px; background: white; }
          
          /* RISK BOX */
          .risk-section { border: 1px solid #feb2b2; background: #fff5f5; }
          .risk-title { color: #c53030; border-bottom-color: #fc8181; }
          .risk-label { color: #c53030; font-weight: bold; font-size: 10px; uppercase; }

          /* SIGNATURE */
          .signature-section { margin-top: 30px; display: flex; justify-content: space-between; align-items: flex-end; font-size: 11px; color: #4a5568; }
          .sig-box { text-align: center; }
          .sig-line { width: 220px; border-bottom: 1px solid #000; height: 30px; margin-bottom: 5px; }
          
          /* FOOTER */
          .footer { text-align: center; font-size: 9px; color: #a0aec0; margin-top: 30px; border-top: 1px solid #e2e8f0; padding-top: 8px; }
        </style>
      </head>
      <body>
        
        <div class="header">
          <div>
            <h1>${activity.title}</h1>
            <div class="header-meta">
               <span>${icons.clock} ${activity.date} | ${activity.startTime} - ${activity.endTime}</span>
               <span class="badge">${(activity.types || []).join(' | ') || activity.type || 'Non défini'}</span>
            </div>
          </div>
          <div class="score-circle">
            ${activity.preparationScore}%
          </div>
        </div>

        <div class="container">
          
          <div>
            
            <div class="section">
              <div class="section-title">${icons.map} LOGISTIQUE & LIEU</div>
              <div class="row"><span class="label">Lieu:</span> <span class="value">${activity.logistics.venueName}</span></div>
              <div class="row"><span class="label">Adresse:</span> <span class="value">${activity.logistics.address}</span></div>
              <div class="row"><span class="label">Contact:</span> <span class="value">${activity.logistics.phoneNumber || '-'}</span></div>
              <div className="row"><span class="label">Site Web:</span> <span class="value">${activity.logistics.website || '-'}</span></div>
              <div className="row"><span class="label">Facebook:</span> <span class="value">${(activity.logistics as any).facebook || '-'}</span></div>
              <div className="row"><span class="label">Courriel:</span> <span class="value">${activity.logistics.email || '-'}</span></div>
              <div class="row"><span class="label">Rassemblement:</span> <span class="value">${activity.logistics.meetingPoint || 'MDJ'}</span></div>
              <div class="row"><span class="label">Aide aux devoirs (16h30):</span> <span class="value">${activity.hasHomeworkHelp ? 'OUI' : 'NON'}</span></div>
              <div class="row"><span class="label">Coût / personne:</span> <span class="value">${activity.logistics.isFree ? 'GRATUIT' : (activity.logistics.costPerPerson || 0).toFixed(2) + ' $'}</span></div>
            </div>

            <div class="section">
              <div class="section-title">${icons.bus} TRANSPORT</div>
              <div class="row"><span class="label">Requis:</span> <span class="value">${activity.logistics.transportRequired ? 'OUI' : 'NON'}</span></div>
              ${activity.logistics.transportRequired ? `
                <div class="row"><span class="label">Mode:</span> <span class="value">${activity.logistics.transportMode || '-'}</span></div>
                <div class="row"><span class="label">Distance:</span> <span class="value">${activity.logistics.distance || '-'}</span></div>
                <div class="row"><span class="label">Durée:</span> <span class="value">${activity.logistics.travelTime || '-'}</span></div>
                <div class="row"><span class="label">Départ:</span> <span class="value">${activity.logistics.departureTime || '-'}</span></div>
                <div class="row"><span class="label">Retour:</span> <span class="value">${activity.logistics.returnTime || '-'}</span></div>
              ` : ''}
            </div>

            <div class="section">
              <div class="section-title">${icons.users} ÉQUIPE & ENCADREMENT</div>
              <div class="row"><span class="label">Responsable:</span> <span class="value" style="font-weight:800;">${activity.staffing.leadStaff || 'À définir'}</span></div>
              <div class="row"><span class="label">Ratio:</span> <span class="value">${activity.staffing.requiredRatio}</span></div>
              <div style="margin-top:8px; border-top:1px dashed #e2e8f0; padding-top:6px;">
                <span class="label" style="font-size:10px;">SOUTIEN:</span><br/>
                <span style="font-size:11px;">${activity.staffing.supportStaff.length > 0 ? activity.staffing.supportStaff.join(', ') : 'Aucun'}</span>
              </div>
            </div>

            <div class="section">
               <div class="section-title">${icons.box} MATÉRIEL & BUDGET</div>
               <div class="row"><span class="label">Budget Estimé:</span> <span class="value">${activity.budget.estimatedCost.toFixed(2)} $</span></div>
               <div style="margin-top:8px;">
                 <span class="label" style="font-size:10px;">LISTE MATÉRIEL:</span>
                 <div style="margin-top:4px;">
                 ${activity.materials.length > 0 ?
        activity.materials.map(m => `<div class="list-item"><span class="checkbox"></span> ${m.quantity} x ${m.item}</div>`).join('')
        : '<div style="font-style:italic; font-size:10px; color:#a0aec0;">Aucun matériel listé.</div>'}
                 </div>
               </div>
            </div>

          </div>

          <div>
            
            <div class="section">
              <div class="section-title">${icons.brain} PÉDAGOGIE</div>
              <div class="description">
                "${activity.description || 'Aucune description disponible.'}"
              </div>
              
              <div style="margin-bottom: 12px;">
                <span class="label" style="font-size:10px; text-transform:uppercase;">Objectifs:</span>
                <div style="margin-top:4px;">
                ${activity.objectives.length > 0 ?
        activity.objectives.map(o => `<div class="list-item"><span class="checkbox"></span> ${o}</div>`).join('')
        : '<span style="font-style:italic; font-size:10px;">Non définis.</span>'}
                </div>
              </div>

              <div>
                 <span class="label" style="font-size:10px; text-transform:uppercase;">Implication Jeunes (${activity.youthInvolvement?.level || 'Part.'}):</span>
                 <div style="margin-top:4px;">
                 ${(activity.youthInvolvement?.tasks || []).map(t => `<div class="list-item">- ${t}</div>`).join('')}
                 </div>
              </div>
            </div>

            <div class="section risk-section">
              <div class="section-title risk-title">${icons.shield} SÉCURITÉ & RISQUES</div>
              <div style="margin-bottom:10px;">
                <div class="risk-label">DANGERS POTENTIELS:</div>
                <div style="font-size:11px;">${activity.riskManagement.hazards.length > 0 ? activity.riskManagement.hazards.join(', ') : 'Aucun danger spécifique.'}</div>
              </div>
              <div style="margin-bottom:10px;">
                 <div class="risk-label">PROTOCOLES:</div>
                 ${activity.riskManagement.safetyProtocols.map(p => `<div class="list-item">• ${p}</div>`).join('')}
              </div>
              <div style="margin-top:10px; border-top:1px solid #feb2b2; padding-top:6px;">
                <span class="risk-label">URGENCE:</span><br/>
                <span style="font-weight:bold; font-size:12px;">${activity.riskManagement.emergencyContact}</span>
              </div>
            </div>

            <div class="section">
               <div class="section-title">NOTES TERRAIN / PLAN B</div>
               <div style="min-height: 40px; font-size: 11px; color: #4a5568;">
                 ${activity.backupPlan ? `<strong>Plan B:</strong> ${activity.backupPlan}` : '<em>Aucun plan B défini.</em>'}
               </div>
            </div>

          </div>
        </div>

        <div class="signature-box signature-section">
           <div class="sig-box">
             <div class="sig-line"></div>
             <span>Signature Responsable</span>
           </div>
           <div class="sig-box">
             <div class="sig-line"></div>
             <span>Signature Direction</span>
           </div>
        </div>

        <div class="footer">
          Généré par Planificateur MDJ - ${new Date().toLocaleDateString()}
        </div>

        <script>
          window.onload = function() { window.print(); }
        </script>
      </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
  };




  // ... (inside the component)

  const readiness = calculateActivityReadiness(activity);

  useEffect(() => {
    setActivity(prev => {
      if (prev.preparationScore === readiness.percentage && prev.isMissingOnlyCost === readiness.isMissingOnlyCost) return prev;
      return { ...prev, preparationScore: readiness.percentage, isMissingOnlyCost: readiness.isMissingOnlyCost };
    });
  }, [readiness.percentage, readiness.isMissingOnlyCost]);

  const updateActivity = (updates: Partial<Activity>) => {
    setActivity(prev => {
      let next = { ...prev, ...updates };

      // Synchronisation type (legacy) <-> types (array)
      if (updates.types && updates.types.length > 0 && !updates.type) {
        next.type = updates.types[0];
      } else if (updates.type && (!updates.types || updates.types.length === 0)) {
        next.types = [updates.type];
      }

      // Automatisme : Type d'activité -> Axes PSOC
      const typeForPsoc = updates.type || (updates.types && updates.types[0]);
      if (typeForPsoc && (!prev.pedagogy?.psocTags || prev.pedagogy.psocTags.length === 0)) {
        const suggestedPsoc = getPSOCFromType(typeForPsoc);
        if (suggestedPsoc.length > 0) {
          next.pedagogy = { ...next.pedagogy, psocTags: suggestedPsoc } as any;
        }
      }

      // Automatisme : Objectifs C.A.R. -> Dimensions RMJQ
      if (updates.objectives) {
        const suggestedRmjq = getRMJQFromObjectives(updates.objectives);
        if (suggestedRmjq.length > 0) {
          const currentRmjq = prev.rmjqDimensions || [];
          const combined = Array.from(new Set([...currentRmjq, ...suggestedRmjq]));
          next.rmjqDimensions = combined;
        }
      }

      // Automatisme : Aide aux devoirs -> Heures spécifiques (16:30 - 17:30)
      const isHomeworkHelp = next.types?.includes(ActivityType.AIDE_DEVOIRS) || next.type === ActivityType.AIDE_DEVOIRS;
      const wasHomeworkHelp = prev.types?.includes(ActivityType.AIDE_DEVOIRS) || prev.type === ActivityType.AIDE_DEVOIRS;

      if (isHomeworkHelp && !wasHomeworkHelp) {
        next.startTime = HOMEWORK_HELP_START_TIME;
        next.endTime = HOMEWORK_HELP_END_TIME;
      } else if (!isHomeworkHelp && wasHomeworkHelp) {
        if (next.startTime === HOMEWORK_HELP_START_TIME && next.endTime === HOMEWORK_HELP_END_TIME) {
          next.startTime = DEFAULT_START_TIME;
          next.endTime = DEFAULT_END_TIME;
        }
      }

      // Automatisme : Ratio d'encadrement suggéré
      const isAnimation = next.types?.includes(ActivityType.ANIMATION) || next.type === ActivityType.ANIMATION;
      const titleLower = (next.title || '').toLowerCase();
      const isHighRisk = (next.types?.includes(ActivityType.PHYSIQUE) || next.types?.includes(ActivityType.ANIMATION)) || titleLower.includes('haut risque');
      const isDangerous = isHighRisk && (titleLower.includes('escalade') || titleLower.includes('canot') || titleLower.includes('kayak') || titleLower.includes('piscine') || titleLower.includes('baignade'));
      const isOuting = isAnimation && (titleLower.includes('sortie') || titleLower.includes('voyage') || titleLower.includes('excursion') || titleLower.includes('camping'));
      const isCamp = isAnimation && (titleLower.includes('séjour') || titleLower.includes('camp') || titleLower.includes('nuit'));

      if (!next.staffing.requiredRatio || next.staffing.requiredRatio === '1/15' || next.staffing.requiredRatio === '1/12' || next.staffing.requiredRatio === 'N/A' || next.staffing.requiredRatio === '') {
        if (isDangerous) {
          next.staffing.requiredRatio = '1/6';
        } else if (isCamp) {
          next.staffing.requiredRatio = 'Min. 2 staff';
        } else if (isOuting) {
          next.staffing.requiredRatio = '1/8';
        } else if (isAnimation) {
          next.staffing.requiredRatio = '1/12';
        }
      }

      return next;
    });
  };

  const updateRiskManagement = (updates: Partial<RiskManagement>) => {
    setActivity(prev => ({ ...prev, riskManagement: { ...prev.riskManagement, ...updates } }));
  };

  const updateStaffing = (updates: Partial<Activity['staffing']>) => {
    setActivity(prev => ({ ...prev, staffing: { ...prev.staffing, ...updates } }));
  };

  const updateBudget = (updates: Partial<Activity['budget']>) => {
    setActivity(prev => ({ ...prev, budget: { ...prev.budget, ...updates } }));
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;
    const newDocuments: ActivityDocument[] = [];
    const promises: Promise<void>[] = [];
    Array.from(files).forEach((file: File) => {
      const promise = new Promise<void>((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          if (e.target?.result) {
            newDocuments.push({
              id: `doc-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
              name: file.name,
              type: file.type || file.name.split('.').pop() || 'unknown',
              size: file.size,
              url: e.target.result as string,
              dateAdded: Date.now()
            });
          }
          resolve();
        };
        reader.readAsDataURL(file);
      });
      promises.push(promise);
    });
    Promise.all(promises).then(() => {
      setActivity(prev => ({ ...prev, documents: [...(prev.documents || []), ...newDocuments] }));
    });
  };

  const handleDeleteFile = (docId: string) => {
    setActivity(prev => ({ ...prev, documents: (prev.documents || []).filter(d => d.id !== docId) }));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleSaveInternal = async () => {
    // Only block if the title is truly empty (schema requirement)
    if (!activity.title || (activity.title || '').trim().length === 0) {
      alert("Un titre est requis pour enregistrer l'activité.");
      setActiveTab('pedagogy');
      return;
    }

    const criticalFails = (readiness.checks || []).filter((c: any) => c.isCritical && !c.met);

    try {
      if (activity.youthInvolvement?.tasks) {
        addSuggestions('youthTasks', activity.youthInvolvement.tasks);
      }
      if (activity.objectives) {
        addSuggestions('objectives', activity.objectives);
      }
      if (activity.evaluationCriteria) {
        addSuggestions('evaluationCriteria', activity.evaluationCriteria);
      }
      if (activity.materials) {
        addSuggestions('materials', activity.materials.map((m: any) => typeof m === 'string' ? m : m.item));
      }
      if (activity.materialReservations) {
        addSuggestions('materials', activity.materialReservations.map((r: any) => r.itemName));
      }
      if (activity.riskManagement?.hazards) {
        addSuggestions('hazards', activity.riskManagement.hazards);
      }
      if (activity.riskManagement?.safetyProtocols) {
        addSuggestions('safety', activity.riskManagement.safetyProtocols);
      }
      if (activity.logistics?.venueName) {
        addSuggestions('venueName', [activity.logistics.venueName]);
      }
      if (activity.checklist) {
        addSuggestions('checklist', activity.checklist.map((c: any) => c.item));
      }

      const validated = parseActivityStrict(activity);
      await onSave(validated);
      onClose();
    } catch (err: any) {
      if (err instanceof z.ZodError) {
        alert("Erreur de validation: " + err.issues.map(i => `${i.path.join('.')}: ${i.message}`).join(", "));
      } else {
        console.error("Save error:", err);
        alert("Une erreur inattendue est survenue lors de la sauvegarde.");
      }
    }
  };

  const isCreator = !activity.createdByEmail || activity.createdByEmail === userEmail || isSuperAdmin(userEmail);
  const inputClass = "w-full bg-white dark:bg-mdj-black border border-slate-200 dark:border-white/10 rounded-lg p-2 text-slate-900 dark:text-white focus:ring-1 focus:ring-mdj-cyan focus:border-mdj-cyan placeholder-slate-400 dark:placeholder-gray-600 transition-all";
  const labelClass = "text-xs font-bold text-cyan-600 dark:text-mdj-cyan uppercase tracking-wider mb-1 block";

  return (
    <div className="fixed inset-0 z-[100] sm:p-4 flex items-center justify-center bg-black/60 backdrop-blur-sm transition-all duration-300">
      <div className="bg-slate-50 dark:bg-mdj-dark border border-slate-200 dark:border-white/10 rounded-none sm:rounded-3xl w-full max-w-6xl h-full sm:h-[90vh] shadow-2xl dark:shadow-[0_0_50px_rgba(0,0,0,0.5)] flex flex-col relative overflow-hidden transition-all">

        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-mdj-cyan via-mdj-magenta to-mdj-orange z-10"></div>

        {/* HEADER */}
        <div className="p-4 sm:p-6 border-b border-slate-200 dark:border-white/10 flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white dark:bg-mdj-dark gap-4 sm:gap-0 transition-all">
          <div className="flex-1 w-full sm:mr-6">
            <div className="flex items-center gap-3 mb-2 w-full">
              <input
                className={cn(
                  "text-xl sm:text-3xl font-display font-bold text-slate-800 dark:text-white bg-transparent border-b focus:ring-0 px-0 w-full leading-tight placeholder-slate-400 dark:placeholder-gray-600 transition-all",
                  (activity.title || '').trim().length < 3 && !activity.isMDJClosed
                    ? "border-red-500/50 shadow-[0_4px_10px_-2px_rgba(239,68,68,0.2)] animate-pulse-slow font-black bg-red-500/5"
                    : "border-transparent hover:border-slate-200 dark:hover:border-white/20 focus:border-mdj-cyan"
                )}
                value={activity.title}
                onChange={(e) => setActivity({ ...activity, title: e.target.value })}
                placeholder="Titre de l'activité"
              />
              <div className="flex items-center gap-2 shrink-0 self-start sm:self-center mt-1 sm:mt-0">
                <AICorrectButton 
                  text={activity.title} 
                  onCorrect={(corrected) => setActivity({ ...activity, title: corrected })}
                  className="mr-2"
                />
                {readiness.checks.filter((c: any) => c.isCritical && !c.met).length > 0 && (
                  <div className="relative group/missing">
                    <div
                      onClick={() => {
                        const firstFail = readiness.checks.find((c: any) => c.isCritical && !c.met);
                        if (firstFail) setActiveTab(firstFail.tab as TabId);
                      }}
                      className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-red-500 text-white text-[10px] font-black uppercase tracking-tighter cursor-pointer hover:bg-red-600 transition-all shadow-lg shadow-red-500/20 animate-bounce-subtle"
                    >
                      <AlertCircle className="w-3 h-3" />
                      <span>{readiness.checks.filter((c: any) => c.isCritical && !c.met).length} MANQUANTS</span>
                    </div>

                    <div className="absolute top-full right-0 mt-2 w-64 bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-red-200 dark:border-red-900/50 p-4 opacity-0 pointer-events-none group-hover/missing:opacity-100 group-hover/missing:pointer-events-auto transition-all z-[110] transform origin-top-right group-hover/missing:translate-y-0 translate-y-2">
                      <div className="text-[10px] font-black text-red-500 uppercase tracking-widest mb-3 border-b border-red-100 dark:border-red-900/30 pb-2">
                        Éléments obligatoires à remplir :
                      </div>
                      <div className="space-y-2">
                        {readiness.checks.filter((c: any) => c.isCritical && !c.met).map((c: any, i: number) => (
                          <div
                            key={i}
                            onClick={() => setActiveTab(c.tab as TabId)}
                            className="flex items-start gap-2 text-[11px] text-slate-600 dark:text-slate-300 hover:text-red-500 cursor-pointer transition-colors"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1 shrink-0" />
                            <span>{c.label}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
                <button
                  onClick={() => {
                    const firstFail = readiness.checks.find((c: any) => c.isCritical && !c.met);
                    if (firstFail) setActiveTab(firstFail.tab as TabId);
                  }}
                  className={`px-2 py-0.5 sm:px-3 sm:py-1 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-wider border shrink-0 transition-all hover:scale-105 active:scale-95 ${(!readiness.checks.some((c: any) => c.isCritical && !c.met) && readiness.percentage >= 80) ? 'bg-mdj-cyan/10 text-mdj-cyan border-mdj-cyan/50' : 'bg-mdj-orange/10 text-mdj-orange border-mdj-orange/50'}`}
                >
                  {readiness.percentage}% Prêt
                </button>
              </div>
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-3 text-xs sm:text-sm text-gray-400 items-center mt-2">
              <div className="flex items-center gap-1 group">
                <CheckSquare className="w-3 h-3 sm:w-4 sm:h-4 text-cyan-500 dark:text-mdj-cyan group-hover:text-slate-900 dark:group-hover:text-white transition-colors" />
                <select
                  className={cn(
                    "bg-transparent border focus:ring-0 p-1 rounded-lg text-xs sm:text-sm cursor-pointer transition-all uppercase font-bold",
                    (activity.types || []).length === 0 && !activity.isMDJClosed
                      ? "text-red-500 border-red-500 bg-red-500/10 font-black animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.3)]"
                      : "text-slate-500 dark:text-gray-400 border-transparent hover:text-slate-900 dark:hover:text-white hover:border-slate-300 dark:hover:border-white/20"
                  )}
                  value={activity.type || ''}
                  onChange={(e) => {
                    const newType = e.target.value as any;
                    updateActivity({ type: newType, types: [newType] });
                  }}
                >
                  <option value="" disabled className="bg-white dark:bg-mdj-dark">⚠️ SÉLECTIONNEZ UN TYPE</option>
                  {Object.values(ActivityType).filter(t => typeof t === 'string').map(t => (
                    <option key={t as string} value={t as string} className="bg-white dark:bg-mdj-dark text-slate-900 dark:text-white">{t as string}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-center hover:text-slate-900 dark:hover:text-white transition-colors">
                <input
                  type="date"
                  className="bg-transparent border-none text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white focus:ring-0 p-0 text-xs sm:text-sm font-sans cursor-pointer uppercase tracking-wide"
                  value={activity.date}
                  onChange={(e) => setActivity({ ...activity, date: e.target.value, isPostponed: false })}
                />
              </div>
              <div className="text-white/20 hidden sm:block">•</div>
              <div className={cn(
                "flex items-center gap-1 font-bold text-slate-700 dark:text-white bg-slate-100 dark:bg-white/5 px-2 py-0.5 rounded border transition-all",
                (!activity.startTime || !activity.endTime) && !activity.isMDJClosed
                  ? "border-red-500 bg-red-500/10 text-red-500 animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.3)]"
                  : "border-slate-200 dark:border-white/10"
              )}>
                <Clock className="w-3 h-3 text-pink-500 dark:text-mdj-magenta" />
                <div className="flex items-center gap-1">
                  <input
                    type="time"
                    className="bg-transparent border-none p-0 w-20 text-center text-xs sm:text-sm focus:ring-0 cursor-pointer"
                    value={activity.startTime}
                    onChange={(e) => updateActivity({ startTime: e.target.value })}
                  />
                  <span>-</span>
                  <input
                    type="time"
                    className="bg-transparent border-none p-0 w-20 text-center text-xs sm:text-sm focus:ring-0 cursor-pointer"
                    value={activity.endTime}
                    onChange={(e) => updateActivity({ endTime: e.target.value })}
                  />
                  {(() => {
                    const isHW = activity.types?.includes(ActivityType.AIDE_DEVOIRS) || activity.type === ActivityType.AIDE_DEVOIRS;
                    const targetStart = isHW ? HOMEWORK_HELP_START_TIME : DEFAULT_START_TIME;
                    const targetEnd = isHW ? HOMEWORK_HELP_END_TIME : DEFAULT_END_TIME;

                    if (activity.startTime !== targetStart || activity.endTime !== targetEnd) {
                      return (
                        <button
                          key="time-reset-btn"
                          onClick={() => updateActivity({ startTime: targetStart, endTime: targetEnd })}
                          className="ml-1 p-0.5 rounded-full hover:bg-slate-200 dark:hover:bg-white/20 text-slate-400 dark:text-gray-500 hover:text-indigo-500 transition-all"
                          title={`Réinitialiser aux heures par défaut (${targetStart}-${targetEnd})`}
                        >
                          <History className="w-3 h-3" />
                        </button>
                      );
                    }
                    return null;
                  })()}
                </div>
              </div>
              <div className="text-white/20 hidden sm:block">•</div>
              <div
                onClick={() => setActiveTab('staff')}
                className={cn(
                  "flex items-center gap-1.5 font-bold px-3 py-1.5 rounded-lg text-xs sm:text-sm shadow-md transition-all cursor-pointer whitespace-nowrap",
                  activity.staffing?.leadStaff || activity.isMDJClosed
                    ? 'text-black bg-gradient-to-r from-mdj-cyan to-cyan-400 border border-mdj-cyan/50'
                    : 'text-red-500 bg-red-500/10 border-2 border-red-500 animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.4)]'
                )}
              >
                <Users className="w-3.5 h-3.5" />
                <span className="max-w-[120px] sm:max-w-none truncate">{activity.staffing?.leadStaff || '⚠ Responsable'}</span>
              </div>
            </div>
          </div>
          <div className="flex gap-2 sm:gap-3 shrink-0 absolute top-4 right-4 sm:static bg-white/80 dark:bg-mdj-dark/80 backdrop-blur-sm sm:backdrop-blur-none p-1 sm:p-0 rounded-full sm:rounded-none z-20">
            <button
              onClick={() => setActivity({ ...activity, isPostponed: !activity.isPostponed })}
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-xl border font-bold text-xs uppercase tracking-wider transition-all",
                activity.isPostponed
                  ? "bg-orange-500/20 text-orange-400 border-orange-500/50 shadow-[0_0_15px_rgba(249,115,22,0.2)]"
                  : "bg-white/5 text-gray-400 border-white/10 hover:bg-orange-500/10 hover:text-orange-400 hover:border-orange-500/30"
              )}
              title={activity.isPostponed ? "Annuler le report" : "Reporter l'activité"}
            >
              <History className="w-4 h-4" />
              {activity.isPostponed ? "À Reporter" : "Reporter"}
            </button>
            <div className="w-px h-8 bg-slate-200 dark:bg-white/10 hidden sm:block mx-1"></div>
            <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-white/10 rounded-full text-slate-400 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white transition-colors"><X className="w-6 h-6" /></button>
          </div>
        </div>

        {/* CONTENT */}
        <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
          {/* NAVIGATION LATERALE (Desktop) / HORIZONTALE (Mobile) */}
          <div className="w-full md:w-64 bg-slate-50 dark:bg-mdj-black/50 border-b md:border-b-0 md:border-r border-slate-200 dark:border-white/10 flex flex-row md:flex-col overflow-x-auto md:overflow-y-auto shrink-0 custom-scrollbar z-10 sticky top-0 md:relative">
            <nav className="p-2 md:p-4 flex md:flex-col gap-2 md:space-y-1 min-w-max">
              {tabs.map((tab, idx) => (
                <button
                  key={tab.id}
                  draggable
                  onDragStart={() => { dragTab.current = idx; }}
                  onDragEnter={() => { dragOverTab.current = idx; }}
                  onDragOver={(e) => e.preventDefault()}
                  onDragEnd={() => {
                    if (dragTab.current === null || dragOverTab.current === null || dragTab.current === dragOverTab.current) return;
                    const reordered = [...tabs];
                    const [moved] = reordered.splice(dragTab.current, 1);
                    reordered.splice(dragOverTab.current, 0, moved);
                    setTabs(reordered);
                    saveTabOrder(reordered, userEmail);
                    dragTab.current = null;
                    dragOverTab.current = null;
                  }}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-3 rounded-xl text-xs sm:text-sm font-bold transition-all border border-transparent whitespace-nowrap group relative ${activeTab === tab.id ? 'bg-cyan-50 dark:bg-mdj-cyan/10 text-cyan-700 dark:text-mdj-cyan border-cyan-200 dark:border-mdj-cyan/20 shadow-sm dark:shadow-[0_0_10px_rgba(0,255,255,0.1)]' : 'text-slate-500 dark:text-gray-400 hover:bg-white/50 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white'}`}
                >
                  <GripVertical className="w-3 h-3 text-gray-600 opacity-0 group-hover:opacity-100 cursor-grab active:cursor-grabbing transition-opacity shrink-0 hidden md:block" />
                  <tab.icon className={`w-3 h-3 sm:w-4 sm:h-4 ${activeTab === tab.id ? 'text-mdj-cyan' : 'text-gray-500'}`} />
                  {tab.label}
                  {readiness.checks.some((c: any) => c.tab === tab.id && c.isCritical && !c.met) && (
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full animate-pulse shadow-[0_0_5px_rgba(239,68,68,0.5)] z-20"></span>
                  )}
                </button>
              ))}
            </nav>
          </div>

          <div className="flex-1 overflow-y-auto bg-white dark:bg-mdj-dark p-4 md:p-8 custom-scrollbar transition-all">

            {/* CHECKLIST */}
            {activeTab === 'checklist' && (
              <ChecklistTab
                activity={activity}
                updateActivity={updateActivity}
                setActiveTab={setActiveTab}
                readiness={readiness}
              />
            )}

            {/* PEDAGOGY */}
            {activeTab === 'pedagogy' && (
              <PedagogyTab
                activity={activity}
                updateActivity={updateActivity}
                updateYouthInvolvement={updateYouthInvolvement}
                autoSuggestAll={autoSuggestAll}
                isGenerating={isGenerating}
                readiness={readiness}
              />
            )}

            {/* LOGISTICS */}
            {activeTab === 'logistics' && (
              <LogisticsTab
                activity={activity}
                updateLogistics={updateLogistics}
                updateActivity={updateActivity}
                readiness={readiness}
              />
            )}

            {/* MATERIALS */}
            {activeTab === 'materials' && (
              <MaterialsTab
                activity={activity}
                updateActivity={updateActivity}
                userEmail={userEmail}
              />
            )}

            {/* INSCRIPTIONS */}
            {activeTab === 'inscriptions' && (
              <RegistrationsTab activityId={activity.id} />
            )}

            {/* RISK */}
            {activeTab === 'risk' && (
              <RiskTab
                activity={activity}
                updateRiskManagement={updateRiskManagement}
                updateActivity={updateActivity}
              />
            )}

            {/* BUDGET */}
            {activeTab === 'budget' && (
              <BudgetTab
                activity={activity}
                updateBudget={updateBudget}
                userEmail={userEmail}
              />
            )}


            {/* JDB & PSOC */}
            {activeTab === 'jdb' && (
              <JournalDeBordTab
                activity={activity}
                updateActivity={updateActivity}
                userEmail={userEmail ?? null}
              />
            )}

            {/* JOURNAL DES MODIFICATIONS */}
            {activeTab === 'journal' && (
              <JournalTab activity={activity} />
            )}

            {/* STAFF */}
            {activeTab === 'staff' && (
              <StaffTab
                activity={activity}
                updateStaffing={updateStaffing}
                availableLeadStaff={availableLeadStaff}
                availableSupportStaff={availableSupportStaff}
                checkStaffConflict={checkStaffConflict}
                getConflictingActivities={getConflictingActivities}
                allActivities={allActivities ?? []}
                showTransfer={showTransfer}
                setShowTransfer={setShowTransfer}
                handleTransferResponsibility={handleTransferResponsibility}
                isTransferring={isTransferring}
              />
            )}

            {/* DOCUMENTS */}
            {activeTab === 'documents' && (
              <DocumentsTab
                activity={activity}
                handleFileUpload={handleFileUpload}
                handleDeleteFile={handleDeleteFile}
                formatFileSize={formatFileSize}
              />
            )}

            {/* CONTROL / POST-MORTEM */}
            {activeTab === 'control' && (
              <ControlTab
                activity={activity}
                reservations={activityReservations}
                inventoryItems={inventoryItems}
                onUpdateStats={updateStats}
                onValidateConsumption={validateConsumption}
                onReportDamage={updateItemCondition}
                onSetActivityValidated={setConsumptionValidated}
              />
            )}
          </div>
        </div >
        <div className="p-4 border-t border-slate-200 dark:border-white/10 flex flex-col sm:flex-row justify-between items-center bg-white dark:bg-mdj-dark gap-4 sm:gap-0 transition-all">
          <div className="flex flex-col gap-1 items-start">
            <div className="text-xs text-slate-400 dark:text-gray-500 font-medium">MDJ L'Escale Jeunesse - La Piaule</div>
            {readiness.checks.some((c: any) => c.isCritical && !c.met) && (
              <div className="flex items-center gap-2 text-[10px] text-red-500 font-bold uppercase tracking-widest animate-pulse">
                <AlertCircle className="w-3 h-3" /> éléments obligatoires manquants
              </div>
            )}
          </div>
          <div className="flex gap-2 sm:gap-3 w-full sm:w-auto justify-center">
            {onDelete && (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-red-500/10 border border-red-500/30 hover:bg-red-500/20 hover:border-red-500/50 text-red-400 hover:text-red-300 font-bold transition-all text-xs sm:text-sm"
                title="Supprimer cette activité"
              >
                <Trash2 className="w-4 h-4" /> <span className="inline">Supprimer</span>
              </button>
            )}
            <button onClick={handlePrint} className="flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-slate-50 dark:bg-mdj-black border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/10 hover:border-slate-300 dark:hover:border-white/20 text-slate-600 dark:text-gray-300 font-bold transition-all text-xs sm:text-sm shadow-sm" title="Générer une fiche terrain imprimable">
              <Printer className="w-4 h-4" /> <span className="inline">Imprimer</span>
            </button>
            {onClone && userEmail && userEmail.endsWith('@mdjescalejeunesse.ca') && (
              <button
                onClick={async () => {
                  try {
                    await onClone(activity);
                    onClose();
                  } catch (e) {
                    console.error("Cloning failed:", e);
                  }
                }}
                className="flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-slate-50 dark:bg-mdj-black border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/10 hover:border-slate-300 dark:hover:border-white/20 text-indigo-600 dark:text-indigo-400 font-bold transition-all text-xs sm:text-sm shadow-sm"
                title="Dupliquer cette activité pour la semaine suivante"
              >
                <Copy className="w-4 h-4" /> <span className="inline">Cloner</span>
              </button>
            )}
            <button onClick={onClose} className="px-4 sm:px-6 py-2 sm:py-2.5 rounded-xl text-slate-500 dark:text-gray-400 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white font-bold transition-all text-xs sm:text-sm">Annuler</button>
            <button
              onClick={handleSaveInternal}
              className={cn(
                "flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-2.5 rounded-xl font-bold transition-all text-xs sm:text-sm",
                readiness.checks.some((c: any) => c.isCritical && !c.met)
                  ? "bg-slate-200 dark:bg-white/5 text-slate-400 cursor-not-allowed border border-slate-300 dark:border-white/10"
                  : "bg-gradient-to-r from-mdj-cyan to-blue-600 text-black hover:to-blue-500 shadow-[0_0_20px_rgba(0,255,255,0.3)] hover:shadow-[0_0_30px_rgba(0,255,255,0.5)]"
              )}
            >
              <Save className="w-4 h-4" /> Enregistrer
            </button>
          </div>
        </div>
      </div>

      {/* DELETE CONFIRMATION MODAL */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white dark:bg-slate-900 border border-red-500/30 rounded-3xl p-8 max-w-sm w-full shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Trash2 className="w-8 h-8 text-red-500" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white text-center mb-2">Confirmer la suppression</h3>
            <p className="text-slate-500 dark:text-slate-400 text-center mb-8 text-sm">
              Êtes-vous sûr de vouloir supprimer définitivement l'activité <span className="font-bold text-red-500">"{activity.title}"</span> ? Cette action est irréversible.
            </p>
            <div className="flex flex-col gap-3">
              <button
                onClick={() => {
                  if (onDelete) onDelete(activity.id);
                  setShowDeleteConfirm(false);
                }}
                className="w-full py-3 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold transition-all shadow-lg shadow-red-500/25 active:scale-95"
              >
                Oui, supprimer
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="w-full py-3 rounded-xl bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 font-bold hover:bg-slate-200 dark:hover:bg-white/10 transition-all active:scale-95"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

ActivityModal.displayName = 'ActivityModal';

export default ActivityModal;