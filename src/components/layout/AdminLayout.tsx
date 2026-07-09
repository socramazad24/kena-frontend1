import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

export default function AdminLayout() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 overflow-x-auto">
        <div className="p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
    
