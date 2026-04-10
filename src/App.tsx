import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LoginView } from './pages/Auth/LoginView';
import { DashboardLayout } from './ui/compositions/DashboardLayout';
import { AgendaView } from './pages/Agenda/AgendaView';
import { PatientsView } from './pages/Patients/PatientsView';
import { FinanceView } from './pages/Finance/FinanceView';
import { RecallView } from './pages/Recall/RecallView';
import { SettingsView } from './pages/Settings/SettingsView';
import { InventoryView } from './pages/Inventory/InventoryView';
import { ReportsView } from './pages/Reports/ReportsView';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginView />} />
        
        {/* Rotas Autenticadas (Dashboard) */}
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<Navigate to="agenda" replace />} />
          <Route path="agenda" element={<AgendaView />} />
          <Route path="pacientes" element={<PatientsView />} />
          <Route path="estoque" element={<InventoryView />} />
          <Route path="financeiro" element={<FinanceView />} />
          <Route path="relatorios" element={<ReportsView />} />
          <Route path="recall" element={<RecallView />} />
          <Route path="configuracoes" element={<SettingsView />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
