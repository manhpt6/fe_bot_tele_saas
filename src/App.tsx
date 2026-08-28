import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { SubscriptionPage } from './pages/SubscriptionPage';
import { SaasTenantsPage } from './pages/SaasTenantsPage';
import { SaasRevenuePage } from './pages/SaasRevenuePage';
import { SaasPlansPage } from './pages/SaasPlansPage';
import { SaasPlatformSettingsPage } from './pages/SaasPlatformSettingsPage';
import { AdminLayout } from './components/layout/AdminLayout';
import { ProtectedRoute } from './components/layout/ProtectedRoute';

import { ProductsPage } from './pages/ProductsPage';
import { CategoriesPage } from './pages/CategoriesPage';
import { AccountsPage } from './pages/AccountsPage';
import { OrdersPage } from './pages/OrdersPage';
import { PaymentEventsPage } from './pages/PaymentEventsPage';
import { CustomersPage } from './pages/CustomersPage';
import { SettingsPage } from './pages/SettingsPage';
import { BroadcastPage } from './pages/BroadcastPage';
import { AdminsPage } from './pages/AdminsPage';
import { ProfilePage } from './pages/ProfilePage';
import { VouchersPage } from './pages/VouchersPage';

import { useSelector } from 'react-redux';
import { RootState } from './store/store';
import { useGetMeQuery } from './api/userApi';

import { SimulationProvider } from './context/SimulationContext';

const RootRedirect = () => {
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const { data: meData } = useGetMeQuery(undefined, { skip: !isAuthenticated });
  const currentUser = meData || user;

  if (currentUser?.role === 'SUPER_ADMIN') {
    return <Navigate to="/saas/revenue" replace />;
  }
  if (currentUser?.role === 'TENANT_ADMIN' || currentUser?.role === 'ADMIN') {
    return <Navigate to="/dashboard" replace />;
  }
  return <Navigate to="/orders" replace />;
};

function App() {
  return (
    <BrowserRouter>
      <SimulationProvider>
        <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        
        <Route element={<ProtectedRoute />}>
          <Route element={<AdminLayout />}>
            <Route path="/" element={<RootRedirect />} />
            
            {/* Super Admin Routes */}
            <Route element={<ProtectedRoute allowedRoles={['SUPER_ADMIN']} />}>
              <Route path="/saas/revenue" element={<SaasRevenuePage />} />
              <Route path="/saas/tenants" element={<SaasTenantsPage />} />
              <Route path="/saas/plans" element={<SaasPlansPage />} />
              <Route path="/saas/platform-settings" element={<SaasPlatformSettingsPage />} />
            </Route>

            {/* Tenant Shared Routes */}
            <Route path="/categories" element={<CategoriesPage />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/accounts" element={<AccountsPage />} />
            <Route path="/orders" element={<OrdersPage />} />
            <Route path="/payment-events" element={<PaymentEventsPage />} />
            <Route path="/customers" element={<CustomersPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/subscription" element={<SubscriptionPage />} />
            
            {/* Tenant Admin Routes */}
            <Route element={<ProtectedRoute allowedRoles={['SUPER_ADMIN', 'TENANT_ADMIN', 'ADMIN']} />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/vouchers" element={<VouchersPage />} />
              <Route path="/broadcast" element={<BroadcastPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/admins" element={<AdminsPage />} />
            </Route>
          </Route>
        </Route>
      </Routes>
      </SimulationProvider>
      <Toaster 
        position="top-right" 
        toastOptions={{
          className: 'glass text-white border border-slate-700',
          style: {
            background: '#1e293b',
            color: '#fff',
          },
        }} 
      />
    </BrowserRouter>
  );
}

export default App;
