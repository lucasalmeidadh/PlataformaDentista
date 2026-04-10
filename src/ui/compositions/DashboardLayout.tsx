import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';

export const DashboardLayout = () => {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <main className="flex-1 overflow-y-auto min-w-0">
        <div className="p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
