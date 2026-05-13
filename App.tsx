import React, { useState, useEffect, lazy, Suspense } from 'react';
import { Activity, InventoryItem } from './types';
const ActivityModal = lazy(() => import('./components/ActivityModal'));
const ChatPanel = lazy(() => import('./components/communication/ChatPanel'));
const SyncPreviewModal = lazy(() => import('./components/sync/SyncPreviewModal'));
const EmployeeProfileModal = lazy(() => import('./components/EmployeeProfileModal').then(module => ({ default: module.EmployeeProfileModal })));
const InternalMessenger = lazy(() => import('./components/communication/InternalMessenger'));
const ReportsPanel = lazy(() => import('./components/dashboard/ReportsPanel').then(m => ({ default: m.ReportsPanel })));
const MemberRegistryModal = lazy(() => import('./components/admin/MemberRegistryModal').then(m => ({ default: m.MemberRegistryModal })));
const GovernanceModule = lazy(() => import('./components/admin/GovernanceModule').then(m => ({ default: m.GovernanceModule })));
const FinancialHealthPanel = lazy(() => import('./components/reports/FinancialHealthPanel').then(m => ({ default: m.FinancialHealthPanel })));
const PsocExportWizard = lazy(() => import('./components/reports/PsocExportWizard').then(m => ({ default: m.PsocExportWizard })));
const WebRegistrationsPanel = lazy(() => import('./components/admin/WebRegistrationsPanel').then(m => ({ default: m.WebRegistrationsPanel })));
const AboutModal = lazy(() => import('./components/AboutModal').then(m => ({ default: m.AboutModal })));

// Dashboard Components
import { DashboardSidebar } from './components/dashboard/DashboardSidebar';
import { LeftRailNav } from './components/dashboard/LeftRailNav';
import { MobileBottomNav } from './components/ui/MobileBottomNav';
import { InventoryItemModal } from './components/dashboard/InventoryItemModal';
import { MainHeader } from './components/dashboard/MainHeader';
import { QuickStats } from './components/dashboard/QuickStats';
import { RmjqPanel } from './components/dashboard/RmjqPanel';
import { BudgetPanel } from './components/dashboard/BudgetPanel';
import { PostponedPanel } from './components/dashboard/PostponedPanel';
import { CalendarGrid } from './components/dashboard/CalendarGrid';
import { CalendarLegend } from './components/dashboard/CalendarLegend';
import { HtmlGeneratorService } from './services/htmlGeneratorService';
import { FirebaseService } from './services/firebaseService';
import { useActivities } from './hooks/useActivities';
import { InventoryService } from './services/inventoryService';
import { useAuth } from './hooks/useAuth';
import { useCalendar } from './hooks/useCalendar';
import { usePlanningMetrics } from './hooks/usePlanningMetrics';
import { usePurchases } from './hooks/usePurchases';
import { useUserProfile } from './hooks/useUserProfile';
import { calculateActivityReadiness } from './lib/readiness';
import { cn, isAbsence } from './lib/utils';
import { RMJQ_TARGETS, getUserRole, TEAM_DIRECTORY, getEmployeeName, MONTH_NAMES, EMPLOYEE_AVATARS } from './lib/constants';
import { DashboardFilters } from './components/dashboard/DashboardFilters';
import { AlertsPanel } from './components/dashboard/AlertsPanel';
import { AbsencesPanel } from './components/dashboard/AbsencesPanel';
import { InventoryPanel } from './components/dashboard/InventoryPanel';
import { PurchasesPanel } from './components/dashboard/PurchasesPanel';
import { useInventory } from './hooks/useInventory';
import { PermissionGate } from './components/auth/PermissionGate';
import { getSpecialDay } from './lib/calendarConstants';
import { getEmployeeAvatar, getStatusColor, getBudgetIcon, getBudgetColor } from './lib/ui-utils';
import { Container } from './components/ui/Container';
import {
  Settings,
  Plus,
  Target,
  AlertCircle,
  MessageSquare,
  Sparkles,
  LogOut,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Loader2
} from 'lucide-react';
import { User } from 'firebase/auth';

// ═══════════════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════

// Redundant constants and helpers removed in favor of constants.ts

// Expose migration on window for admin console access
(window as any).runMigration = async () => {
  const result = await FirebaseService.migrateActivityTypes();
  console.table(result.details);
  alert(`Migration complète !\n${result.updated} types corrigés\n${result.skipped} déjà conformes`);
  return result;
};



// ═══════════════════════════════════════════════════════════════════════════
// APP COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

const App = () => {
  // --- Hooks ---
  const auth = useAuth();
  const { profile, updateProfile } = useUserProfile(auth.currentUser);
  const activityStore = useActivities(auth.currentUser?.email ?? undefined);
  const calendar = useCalendar();
  const rmjqCategoryState = useState<string | null>(null);
  const { requests: purchaseRequests } = usePurchases(auth.currentUser?.email ?? undefined, profile?.role);
  const {
    items: inventoryItems,
    isLoading: isInventoryLoading,
    saveItem: saveInventoryItem,
    deleteItem: deleteInventoryItem
  } = useInventory(auth.currentUser?.email || undefined, profile?.role);
  const metrics = usePlanningMetrics(activityStore.filteredActivities, calendar.currentMonthStr, rmjqCategoryState, purchaseRequests, inventoryItems);

  const handleCreatePRFromAlert = async (item: InventoryItem, missingQty: number) => {
    if (!auth.currentUser?.email) return;
    try {
      await InventoryService.autoCreatePurchaseRequest(
        item,
        missingQty,
        'ALERTE_STOCK',
        auth.currentUser.email
      );
      alert(`Demande d'achat créée pour ${missingQty} ${item.name}.`);
    } catch (error) {
      console.error("Error creating PR from alert:", error);
      alert("Erreur lors de la création de la demande d'achat.");
    }
  };

  const [showChat, setShowChat] = useState(false);
  const [showSyncPreview, setShowSyncPreview] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showReports, setShowReports] = useState(false);
  const [showMembers, setShowMembers] = useState(false);
  const [showGovernance, setShowGovernance] = useState(false);
  const [showFinancial, setShowFinancial] = useState(false);
  const [showPsocWizard, setShowPsocWizard] = useState(false);
  const [showWebRegistrations, setShowWebRegistrations] = useState(false);
  const [showAboutModal, setShowAboutModal] = useState(false);
  const [initialModalTab, setInitialModalTab] = useState<string | undefined>(undefined);

  const [monthTheme, setMonthTheme] = useState('');
  const [isEditingTheme, setIsEditingTheme] = useState(false);
  const [dragOverDate, setDragOverDate] = useState<string | null>(null);
  const [showMessenger, setShowMessenger] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [activeSection, setActiveSection] = useState<'calendar' | 'members' | 'governance' | 'financial' | 'psoc' | 'web_registrations'>('calendar');

  const handleSectionChange = (section: any) => {
    // Reset all modal states first
    setShowMembers(false);
    setShowGovernance(false);
    setShowFinancial(false);
    setShowPsocWizard(false);
    setShowWebRegistrations(false);
    setShowReports(false);
    setShowSyncPreview(false);

    if (section === 'calendar' || section === 'web_registrations') {
      setActiveSection(section);
      if (section === 'web_registrations') setShowWebRegistrations(true);
      return;
    }

    // These sections are currently modals
    setActiveSection(section); // Allow sidebar to reflect the active modal
    if (section === 'members') setShowMembers(true);
    if (section === 'governance') setShowGovernance(true);
    if (section === 'financial') setShowFinancial(true);
    if (section === 'psoc') setShowPsocWizard(true);
  };

  useEffect(() => {
    const fetchTheme = async () => {
      const theme = await FirebaseService.getTheme(calendar.currentMonthStr);
      setMonthTheme(theme);
    };
    fetchTheme();
  }, [calendar.currentMonthStr]);

  useEffect(() => {
    if (!auth.currentUser || !profile?.role || profile.role === 'viewer') return;
    const unsub = FirebaseService.subscribeToMessages(setMessages);
    return () => unsub();
  }, [auth.currentUser, profile?.role]);

  // --- Cleanup: remove duplicate March 19 "Soirée libre" activities ---
  useEffect(() => {
    if (!auth.currentUser || activityStore.activities.length === 0) return;
    const march19Date = '2026-03-19';
    const march19Acts = activityStore.activities
      .filter(a => a.date === march19Date && (a.title === 'Soirée libre' || a.title === 'Libre'));
    if (march19Acts.length > 1) {
      // Keep only the first one, delete the rest
      const key = `cleanup_done_${march19Date}`;
      if (localStorage.getItem(key)) return;

      const toDelete = march19Acts.slice(1);
      Promise.all(toDelete.map(act => FirebaseService.delete(act.id)))
        .then(() => localStorage.setItem(key, 'true'))
        .catch(err => console.error("Cleanup error:", err));
    }
  }, [auth.currentUser, activityStore.activities]);

  // --- Inventory Modal State ---
  const [showInventoryModal, setShowInventoryModal] = useState(false);
  const [selectedInventoryItem, setSelectedInventoryItem] = useState<InventoryItem | undefined>(undefined);

  // --- Seed Pat's Vacation ---
  useEffect(() => {
    if (!auth.currentUser) return;
    const addVacations = async () => {
      // Jusqu'à lundi prochain means March 3 to March 9 inclusive
      const dates = ['2026-03-03', '2026-03-04', '2026-03-05', '2026-03-06', '2026-03-07', '2026-03-08', '2026-03-09'];
      const hasAdded = localStorage.getItem('added_pat_vacations_mars3a9');
      if (hasAdded) return;

      for (const date of dates) {
        const id = 'act-vacation-pat-v2-' + date;
        const exists = activityStore.activities.some(a => a.id === id);
        if (!exists) {
          await FirebaseService.save({
            id,
            title: 'Vacances - Pat',
            date,
            startTime: '00:00',
            endTime: '23:59',
            type: 'Vie associative et implication' as any,
            description: "En vacances jusqu'à lundi prochain",
            status: 'draft',
            budget: { estimatedCost: 0, actualCost: 0, items: [] },
            materials: [],
            staffing: { leadStaff: '', supportStaff: [], requiredRatio: '' },
            evaluationCriteria: [],
            rmjqDimensions: [],
            logistics: { location: '', transportRequired: false },
            riskManagement: { hazards: [], safetyProtocols: [] },
            comments: [],
            createdByEmail: auth.currentUser?.email || 'system'
          } as unknown as Activity);
        }
      }
      localStorage.setItem('added_pat_vacations_mars3a9', 'true');
    };
    addVacations();
  }, [auth.currentUser, activityStore.activities]);

  useEffect(() => {
    if (!auth.currentUser || localStorage.getItem('fcm_permission_requested')) return;

    const requestPermission = async () => {
      const token = await FirebaseService.requestMessagingPermission();
      if (token) {
        localStorage.setItem('fcm_permission_requested', 'true');
      }
    };
    // Delay request slightly for better UX
    const timer = setTimeout(requestPermission, 5000);
    return () => clearTimeout(timer);
  }, [auth.currentUser]);

  useEffect(() => {
    if (!activityStore.isLoading) {
      const loadingScreen = document.getElementById('loading-screen');
      if (loadingScreen) {
        loadingScreen.style.opacity = '0';
        setTimeout(() => loadingScreen.remove(), 500);
      }
    }
  }, [activityStore.isLoading]);

  const handleSaveTheme = async (e: React.KeyboardEvent | React.FocusEvent) => {
    if ('key' in e && e.key !== 'Enter') return;
    setIsEditingTheme(false);
    try {
      await FirebaseService.saveTheme(calendar.currentMonthStr, monthTheme);
    } catch (e) {
      alert("Erreur lors de la sauvegarde du thème.");
    }
  };

  const handleExportHtml = () => {
    const activeActivities = activityStore.activities.filter(a => a.isPostponed !== true);
    HtmlGeneratorService.downloadHtml(activeActivities, calendar.currentDate, monthTheme);
  };

  const handleSubmitMonthForValidation = () => {
    const recipients = ['admin@mdjescalejeunesse.ca', 'dg@mdjescalejeunesse.ca'].join(',');
    const monthName = MONTH_NAMES[calendar.currentDate.getMonth()];
    const year = calendar.currentDate.getFullYear();
    const subject = encodeURIComponent(`[VALIDATION CALENDRIER] ${monthName} ${year}`);
    const body = encodeURIComponent(
      `Bonjour,\n\n` +
      `Je vous soumets le calendrier complet pour le mois de ${monthName} ${year} pour validation.\n\n` +
      `📌 Thématique : ${monthTheme || 'Non définie'}\n` +
      `📅 Nombre d'activités : ${metrics.displayedActivities.length}\n` +
      `💰 Budget total estimé : ${metrics.totalBudget.toFixed(2)} $\n` +
      `⚠️ Jours restant à finaliser : ${metrics.daysToFinalize}\n\n` +
      `Le calendrier est prêt à être révisé dans le Planificateur.\n\n` +
      `— Envoyé depuis le Planificateur MDJ`
    );
    window.open(`mailto:${recipients}?subject=${subject}&body=${body}`, '_blank');
  };

  const currentUserAvatar = profile?.avatarUrl || getEmployeeAvatar(auth.currentUser);
  const userEmail = auth.currentUser?.email?.toLowerCase() ?? '';
  const isStaff = userEmail.endsWith('@mdjescalejeunesse.ca');
  const userRole = getUserRole(auth.currentUser?.email ?? undefined);
  const isAdmin = userRole === 'admin' || userRole === 'super_admin' || auth.isSuperAdmin;
  const unreadMessagesCount = messages.filter(m => !m.isRead && m.senderId !== auth.currentUser?.email).length;

  return (
    <div className="min-h-screen bg-base text-primary flex flex-col transition-colors duration-300">
      <div className="hidden lg:block">
        <LeftRailNav
          isAdmin={isAdmin}
          isStaff={isStaff}
          activeSection={activeSection}
          onSectionChange={handleSectionChange}
          onToggleMessenger={() => setShowMessenger(!showMessenger)}
          onOpenSettings={() => setShowProfileModal(true)}
          onLogoClick={() => setShowAboutModal(true)}
          hasUnreadMessages={unreadMessagesCount > 0}
        />
      </div>

      <div className="flex-1 flex flex-col lg:pl-20 pb-16 lg:pb-0 transition-all duration-300">
        <MainHeader
          monthTheme={monthTheme}
          setMonthTheme={setMonthTheme}
          handleSaveTheme={handleSaveTheme}
          currentMonthName={`${MONTH_NAMES[calendar.currentDate.getMonth()]} ${calendar.currentDate.getFullYear()}`}
          setShowChat={setShowChat}
          setShowSyncPreview={setShowSyncPreview}
          setShowProfileModal={setShowProfileModal}
          currentUser={auth.currentUser}
          currentUserAvatar={currentUserAvatar}
          handleLogout={auth.handleLogout}
          handleMicrosoftLogin={auth.handleMicrosoftLogin}
          handleGoogleLogin={auth.handleGoogleLogin}
          showLoginMenu={auth.showLoginMenu}
          setShowLoginMenu={auth.setShowLoginMenu}
          goToPrevMonth={calendar.goToPrevMonth}
          goToNextMonth={calendar.goToNextMonth}
          handleExportHtml={handleExportHtml}
          isEditingTheme={isEditingTheme}
          setIsEditingTheme={setIsEditingTheme}
          isSuperAdmin={auth.isSuperAdmin}
          alerts={{
            incompleteAlerts: metrics.incompleteAlerts,
            staffConflicts: metrics.staffConflicts,
            lowStockItems: metrics.lowStockItems
          }}
          onSelectActivity={(id: string, tab?: string) => {
            const act = activityStore.activities.find(a => a.id === id);
            if (act) {
              if (tab) setInitialModalTab(tab);
              activityStore.setSelectedActivity(act);
            }
          }}
          onManageInventory={(item: any) => {
            setSelectedInventoryItem(item);
            setShowInventoryModal(true);
          }}
          handleSubmitMonth={handleSubmitMonthForValidation}
          handleEmailLogin={auth.handleEmailLogin}
          onCreateActivity={activityStore.handleOpenNewActivity}
        />

        <main className="flex-1 flex relative overflow-hidden">
          <Suspense fallback={
            <div className="flex-1 flex flex-col items-center justify-center bg-base/50 gap-4">
              <Loader2 className="w-8 h-8 animate-spin text-cyan-500 opacity-50" />
              <p className="text-[10px] font-black uppercase tracking-widest text-muted animate-pulse">Chargement...</p>
            </div>
          }>
            {activeSection === 'calendar' ? (
              <div className="flex-1 flex flex-col relative overflow-hidden">
                <div className="flex-1 p-6 space-y-4 overflow-auto">
                  {/* Compact toolbar: Legend + Filters on same row */}
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <CalendarLegend />
                    <div className="flex items-center gap-2">
                      <DashboardFilters
                        filters={activityStore.filters}
                        onFilterChange={activityStore.setFilters}
                      />
                    </div>
                  </div>

                  {/* Calendar Grid — FULL WIDTH */}
                  <div className="relative">
                    <CalendarGrid
                      calendarDays={calendar.calendarDays}
                      activities={activityStore.filteredActivities}
                      currentUser={auth.currentUser}
                      isSuperAdmin={auth.isSuperAdmin}
                      currentMonthName={MONTH_NAMES[calendar.currentDate.getMonth()]}
                      onSelectActivity={activityStore.setSelectedActivity}
                      onCreateActivity={activityStore.handleCreateActivity}
                      onCopyActivity={activityStore.handleCopyActivity}
                      onPasteActivity={activityStore.handlePasteActivity}
                      onDeleteActivity={(id) => {
                        if (window.confirm("Supprimer définitivement cette activité ?")) {
                          FirebaseService.delete(id);
                        }
                      }}
                      copiedActivity={activityStore.copiedActivity}
                      dragOverDate={dragOverDate}
                      setDragOverDate={setDragOverDate}
                      handleDrop={async (activityId, targetDate) => {
                        const act = activityStore.activities.find(a => a.id === activityId);
                        if (act) {
                          await FirebaseService.save({ ...act, date: targetDate, isPostponed: false });
                        }
                      }}
                      onQuickSpecialDay={activityStore.handleQuickSpecialDay}
                    />

                    {/* FAB: Now absolute inside the calendar grid area specifically */}
                    <button
                      onClick={activityStore.handleOpenNewActivity}
                      className="hidden lg:flex absolute bottom-6 right-6 w-14 h-14 bg-cyan-500 hover:bg-cyan-400 rounded-full shadow-[0_0_20px_rgba(0,255,255,0.3)] items-center justify-center text-white z-50 animate-bounce active:scale-95 transition-all duration-200"
                    >
                      <Plus className="w-8 h-8" />
                    </button>
                  </div>

                  {/* Secondary panels below calendar */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                    <AbsencesPanel
                      activities={activityStore.activities}
                      onAddAbsence={auth.currentUser ? () => {
                        setInitialModalTab('absences');
                        setShowProfileModal(true);
                      } : undefined}
                    />
                    <PostponedPanel
                      activities={activityStore.activities}
                      dragOverDate={dragOverDate}
                      onDragOver={(e) => {
                        e.preventDefault();
                        if (auth.currentUser) setDragOverDate('postponed');
                      }}
                      onDragLeave={() => setDragOverDate(null)}
                      onDrop={async (e) => {
                        e.preventDefault();
                        setDragOverDate(null);
                        if (!auth.currentUser) return;
                        const activityId = e.dataTransfer.getData('text/plain');
                        const act = activityStore.activities.find(a => a.id === activityId);
                        if (act && !act.isPostponed) {
                          await activityStore.handleSaveActivity({ ...act, isPostponed: true });
                        }
                      }}
                      onSelectActivity={activityStore.setSelectedActivity}
                      currentUser={auth.currentUser}
                    />
                  </div>
                </div>

                {/* FAB: Now absolute inside the calendar frame */}
                {/* The FAB button was moved inside the CalendarGrid's parent div */}
              </div>
            ) : activeSection === 'web_registrations' ? (
              <div className="flex-1 overflow-auto">
                <WebRegistrationsPanel
                  onClose={() => setActiveSection('calendar')}
                  activities={activityStore.activities.map(a => ({ id: a.id, title: a.title, date: a.date }))}
                />
              </div>
            ) : null}
          </Suspense>

          {/* ═══ COLLAPSIBLE SIDEBAR (Right Panel) ═══ */}
          {activeSection === 'calendar' && (
            <aside className="hidden xl:block w-[340px] shrink-0 bg-surface/50 backdrop-blur-sm overflow-y-auto p-5">
              <DashboardSidebar
                isAdmin={isAdmin}
                auth={auth}
                metrics={metrics}
                activityStore={activityStore}
                handleCreatePRFromAlert={handleCreatePRFromAlert}
                onRMJQSync={async () => {
                  try {
                    // Step 1: Migrate old types to new RMJQ volets
                    const migration = await FirebaseService.migrateActivityTypes();
                    // Step 2: Update RMJQ dimensions
                    const count = await FirebaseService.batchUpdateRMJQDimensions();
                    alert(`Migration: ${migration.updated} types corrigés (${migration.skipped} déjà conformes).\nDimensions: ${count} activités mises à jour.`);
                    if (migration.details.length > 0) {
                      console.log('[Migration Details]', migration.details);
                    }
                  } catch (err) {
                    console.error("RMJQ Sync error:", err);
                    alert("Erreur lors de la synchronisation RMJQ.");
                  }
                }}
                onShowReports={() => setShowReports(true)}
                onShowMembers={() => setShowMembers(true)}
                onShowGovernance={() => setShowGovernance(true)}
                onShowFinancial={() => setShowFinancial(true)}
                onShowPsoc={() => setShowPsocWizard(true)}
                onSelectActivityCallback={(activityId, tab) => {
                  const act = activityStore.activities.find(a => a.id === activityId);
                  if (act) {
                    setInitialModalTab(tab);
                    activityStore.setSelectedActivity(act);
                  }
                }}
                onManageInventory={(item: any) => {
                  setSelectedInventoryItem(item);
                  setShowInventoryModal(true);
                }}
              />
            </aside>
          )}
        </main>
      </div>

      {/* ═══ MODALS ═══ */}
      <Suspense fallback={null}>
        {activityStore.selectedActivity && (
          <ActivityModal
            activity={activityStore.selectedActivity}
            onClose={() => {
              activityStore.setSelectedActivity(null);
              setInitialModalTab(undefined);
            }}
            onSave={activityStore.handleUpdateActivity}
            onDelete={activityStore.handleDeleteActivityFromModal}
            onClone={activityStore.handleCloneActivity}
            userEmail={auth.currentUser?.email || undefined}
            allActivities={activityStore.activities}
            initialTab={initialModalTab}
          />
        )}
        {showChat && (
          <ChatPanel currentUser={auth.currentUser!} onClose={() => setShowChat(false)} isOpen={showChat} />
        )}
        {showSyncPreview && (
          <SyncPreviewModal onClose={() => setShowSyncPreview(false)} />
        )}
        {showProfileModal && auth.currentUser && profile && (
          <EmployeeProfileModal
            userEmail={auth.currentUser.email || ''}
            userName={auth.currentUser.displayName || getEmployeeName(auth.currentUser.email || '')}
            profile={profile}
            updateProfile={updateProfile}
            absences={activityStore.activities}
            onClose={() => setShowProfileModal(false)}
            initialTab={initialModalTab as any}
          />
        )}
        {showMessenger && auth.currentUser && profile && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="relative w-full max-w-2xl">
              <button
                onClick={() => setShowMessenger(false)}
                className="absolute -top-12 right-0 p-2 text-white/70 hover:text-white transition-colors"
              >
                Fermer
              </button>
              <InternalMessenger
                currentUser={{
                  id: auth.currentUser.email || 'unknown',
                  name: auth.currentUser.displayName || getEmployeeName(auth.currentUser.email || ''),
                  avatar: currentUserAvatar || undefined
                }}
                initialMessages={messages}
                onSendMessage={async (msg) => {
                  await FirebaseService.sendMessage(msg);
                }}
                onMarkAsRead={async (ids) => {
                  await FirebaseService.markMessagesAsRead(ids);
                }}
                teamDirectory={TEAM_DIRECTORY}
              />
            </div>
          </div>
        )}
        {showReports && (
          <ReportsPanel
            activities={activityStore.activities}
            onClose={() => {
              setShowReports(false);
              setActiveSection('calendar');
            }}
            userEmail={auth.currentUser?.email || undefined}
          />
        )}
        {showInventoryModal && (
          <InventoryItemModal
            item={selectedInventoryItem}
            onClose={() => {
              setShowInventoryModal(false);
              setSelectedInventoryItem(undefined);
            }}
            onSave={saveInventoryItem}
            onDelete={deleteInventoryItem}
          />
        )}
        {showMembers && isStaff && (
          <MemberRegistryModal
            userEmail={auth.currentUser?.email || undefined}
            onClose={() => {
              setShowMembers(false);
              setActiveSection('calendar');
            }}
          />
        )}
        {showGovernance && isAdmin && (
          <GovernanceModule
            userEmail={auth.currentUser?.email || undefined}
            onClose={() => {
              setShowGovernance(false);
              setActiveSection('calendar');
            }}
          />
        )}
        {showFinancial && isAdmin && (
          <FinancialHealthPanel
            userEmail={auth.currentUser?.email || undefined}
            onClose={() => {
              setShowFinancial(false);
              setActiveSection('calendar');
            }}
          />
        )}
        {showPsocWizard && (
          <PsocExportWizard
            activities={activityStore.activities}
            onClose={() => {
              setShowPsocWizard(false);
              setActiveSection('calendar');
            }}
          />
        )}
        {showAboutModal && (
          <AboutModal onClose={() => setShowAboutModal(false)} />
        )}
      </Suspense>

      <MobileBottomNav
        isAdmin={isAdmin}
        isStaff={isStaff}
        activeSection={activeSection}
        onSectionChange={handleSectionChange}
        onToggleMessenger={() => setShowMessenger(!showMessenger)}
        onOpenSettings={() => setShowProfileModal(true)}
        hasUnreadMessages={unreadMessagesCount > 0}
        onCreateActivity={() => activityStore.handleCreateActivity(new Date().toISOString().split('T')[0])}
      />
      <footer className="w-full py-4 text-center mt-auto">
        <p className="text-[10px] text-muted font-bold uppercase tracking-[0.3em]">Propulsé par MDJ L'Escale Jeunesse © 2026</p>
      </footer>




    </div >
  );
};


export default App;