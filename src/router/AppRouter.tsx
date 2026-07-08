import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from '../pages/auth/LoginPage';
import HomePage from '../pages/HomePage';
import UnauthorizedPage from '../pages/UnauthorizedPage';
import ProtectedRoute from '../components/auth/ProtectedRoute';
import AdminLayout from '../components/layout/AdminLayout';
import AdminDashboard from '../pages/admin/AdminDashboard';
import BranchesPage from '../pages/admin/BranchesPage';
import CashiersPage from '../pages/admin/CashiersPage';
import SettingsPage from '../pages/admin/SettingsPage';
import PrizesPage from '../pages/admin/PrizesPage';
import JackpotPage from '../pages/admin/JackpotPage';
import ReportsPage from '../pages/admin/ReportsPage';
import CashierLayout from '../components/layout/CashierLayout';
import CashierHomePage from '../pages/cashier/CashierHomePage';
import CashierDashboard from '../pages/cashier/CashierDashboard';
import CashPage from '../pages/cashier/CashPage';
import SearchTicketPage from '../pages/cashier/SearchTicketPage';
import PayPrizePage from '../pages/cashier/PayPrizePage';
import MyBetsPage from '../pages/cashier/MyBetsPage';
import CashierReportsPage from '../pages/cashier/CashierReportsPage';
import DisplayPage from '../pages/display/DisplayPage';

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/unauthorized" element={<UnauthorizedPage />} />

      {/* Pantalla pública (TV) - sin login */}
      <Route path="/display" element={<DisplayPage />} />

      {/* ADMIN ROUTES (con sidebar admin) */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="branches" element={<BranchesPage />} />
        <Route path="cashiers" element={<CashiersPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="prizes" element={<PrizesPage />} />
        <Route path="jackpot" element={<JackpotPage />} />
        <Route path="reports" element={<ReportsPage />} />
      </Route>

      {/* CASHIER ROUTES (con layout del cajero) */}
      <Route
        path="/cashier"
        element={
          <ProtectedRoute
            allowedRoles={['cashier', 'admin']}
            adminCanAccess={true}
          >
            <CashierLayout>
              <CashierHomePage />
            </CashierLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/cashier/new-bet"
        element={
          <ProtectedRoute
            allowedRoles={['cashier', 'admin']}
            adminCanAccess={true}
          >
            <CashierLayout>
              <CashierDashboard />
            </CashierLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/cashier/cash"
        element={
          <ProtectedRoute
            allowedRoles={['cashier', 'admin']}
            adminCanAccess={true}
          >
            <CashierLayout>
              <CashPage />
            </CashierLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/cashier/search"
        element={
          <ProtectedRoute
            allowedRoles={['cashier', 'admin']}
            adminCanAccess={true}
          >
            <CashierLayout>
              <SearchTicketPage />
            </CashierLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/cashier/pay"
        element={
          <ProtectedRoute
            allowedRoles={['cashier', 'admin']}
            adminCanAccess={true}
          >
            <CashierLayout>
              <PayPrizePage />
            </CashierLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/cashier/my-bets"
        element={
          <ProtectedRoute
            allowedRoles={['cashier', 'admin']}
            adminCanAccess={true}
          >
            <CashierLayout>
              <MyBetsPage />
            </CashierLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/cashier/reports"
        element={
          <ProtectedRoute
            allowedRoles={['cashier', 'admin']}
            adminCanAccess={true}
          >
            <CashierLayout>
              <CashierReportsPage />
            </CashierLayout>
          </ProtectedRoute>
        }
      />

      {/* Default home */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <HomePage />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
