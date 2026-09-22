import React, { useState } from 'react';
import { CRMProvider, useCRM } from './context/CRMContext';
import { Sidebar } from './components/layout/Sidebar';
import { Topbar } from './components/layout/Topbar';
import { DashboardView } from './views/DashboardView';
import { LeadsView } from './views/LeadsView';
import { CalendarView } from './views/CalendarView';
import { ProposalsView } from './views/ProposalsView';
import { NotesView } from './views/NotesView';
import { OperationsView } from './views/OperationsView';
import { DiscardedView } from './views/DiscardedView';
import { LoginView } from './views/LoginView';
import { LeadFormModal } from './components/leads/LeadFormModal';
import { LeadDetailDrawer } from './components/leads/LeadDetailDrawer';
import { CallLogModal } from './components/leads/CallLogModal';
import { VisitFormModal } from './components/visits/VisitFormModal';
import { ProposalFormModal } from './components/proposals/ProposalFormModal';
import { DeleteConfirmModal } from './components/common/DeleteConfirmModal';
import { AIDealModal } from './components/common/AIDealModal';

const AppContent: React.FC = () => {
  const { activeTab, isAuthenticated } = useCRM();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Dedicated Architectural Login View if not authenticated
  if (!isAuthenticated) {
    return <LoginView />;
  }

  return (
    <div className="min-h-screen bg-[#F7F5F0] flex flex-col font-sans text-stone-900 selection:bg-amber-200 selection:text-stone-900">
      
      {/* Sidebar Navigation */}
      <Sidebar
        mobileOpen={mobileSidebarOpen}
        setMobileOpen={setMobileSidebarOpen}
      />

      {/* Main Content Area */}
      <div className="flex-1 md:pl-64 flex flex-col min-w-0">
        
        {/* Sticky Topbar Header */}
        <Topbar onOpenMobileSidebar={() => setMobileSidebarOpen(true)} />

        {/* View Content Body */}
        <main className="flex-1 p-4 sm:p-6 max-w-7xl w-full mx-auto">
          {activeTab === 'dashboard' && <DashboardView />}
          {activeTab === 'leads' && <LeadsView />}
          {activeTab === 'notes' && <NotesView />}
          {activeTab === 'calendar' && <CalendarView />}
          {activeTab === 'proposals' && <ProposalsView />}
          {activeTab === 'operations' && <OperationsView />}
          {activeTab === 'discarded' && <DiscardedView />}
        </main>
      </div>

      {/* Global Drawers & Modals */}
      <LeadFormModal />
      <LeadDetailDrawer />
      <CallLogModal />
      <VisitFormModal />
      <ProposalFormModal />
      <AIDealModal />
      <DeleteConfirmModal />

    </div>
  );
};

export function App() {
  return (
    <CRMProvider>
      <AppContent />
    </CRMProvider>
  );
}

export default App;
