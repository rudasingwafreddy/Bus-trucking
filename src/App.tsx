import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { MobileBottomNav } from './components/layout/MobileBottomNav';

// Pages
import { HomePage } from './pages/HomePage';
import { LiveMapPage } from './pages/LiveMapPage';
import { RoutesPage } from './pages/RoutesPage';
import { RouteDetailPage } from './pages/RouteDetailPage';
import { StopsPage } from './pages/StopsPage';
import { StopDetailPage } from './pages/StopDetailPage';
import { DriverDashboardPage } from './pages/DriverDashboardPage';
import { OperatorDashboardPage } from './pages/OperatorDashboardPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { FavoritesPage } from './pages/FavoritesPage';
import { ProfilePage } from './pages/ProfilePage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { AboutPage } from './pages/AboutPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 30,
      refetchOnWindowFocus: false
    }
  }
});

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <AuthProvider>
          <BrowserRouter>
            <div className="flex flex-col min-h-screen bg-slate-50 text-slate-900 pb-16 md:pb-0 font-sans selection:bg-emerald-500 selection:text-white">
              <Navbar />

              <main className="flex-1 flex flex-col">
                <Routes>
                  {/* Public Pages */}
                  <Route path="/" element={<HomePage />} />
                  <Route path="/map" element={<LiveMapPage />} />
                  <Route path="/routes" element={<RoutesPage />} />
                  <Route path="/routes/:id" element={<RouteDetailPage />} />
                  <Route path="/stops" element={<StopsPage />} />
                  <Route path="/stops/:id" element={<StopDetailPage />} />
                  <Route path="/about" element={<AboutPage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />

                  {/* Passenger Pages */}
                  <Route path="/favorites" element={<FavoritesPage />} />
                  <Route path="/profile" element={<ProfilePage />} />

                  {/* Driver Pages */}
                  <Route path="/driver" element={<DriverDashboardPage />} />
                  <Route path="/driver/trip" element={<DriverDashboardPage />} />

                  {/* Operator Pages */}
                  <Route path="/operator" element={<Navigate to="/operator/dashboard" replace />} />
                  <Route path="/operator/dashboard" element={<OperatorDashboardPage />} />
                  <Route path="/operator/buses" element={<OperatorDashboardPage />} />
                  <Route path="/operator/drivers" element={<OperatorDashboardPage />} />
                  <Route path="/operator/routes" element={<OperatorDashboardPage />} />
                  <Route path="/operator/trips" element={<OperatorDashboardPage />} />
                  <Route path="/operator/announcements" element={<OperatorDashboardPage />} />
                  <Route path="/operator/reports" element={<OperatorDashboardPage />} />

                  {/* Administrator Pages */}
                  <Route path="/admin" element={<AdminDashboardPage />} />
                  <Route path="/admin/operators" element={<AdminDashboardPage />} />
                  <Route path="/admin/users" element={<AdminDashboardPage />} />
                  <Route path="/admin/settings" element={<AdminDashboardPage />} />

                  {/* Fallback */}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </main>

              <Footer />
              <MobileBottomNav />
            </div>
          </BrowserRouter>
        </AuthProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
}

export default App;
