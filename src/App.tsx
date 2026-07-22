import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AppProvider, useAppContext } from './context/AppContext';
import { ToastProvider } from './context/ToastContext';
import { UpgradeModal } from './components/UpgradeModal';

// Pages
import { Landing } from './pages/Landing';
import { DashboardLayout } from './pages/DashboardLayout';
import { SocialPostGenerator } from './pages/dashboard/SocialPostGenerator';
import { ReviewResponder } from './pages/dashboard/ReviewResponder';
import { Settings } from './pages/dashboard/Settings';
import { Auth } from './pages/Auth';

const AuthGuard = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAppContext();
  const location = useLocation();
  const token = localStorage.getItem('bizsocial_token');
  
  if (!token && !user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }
  
  return <>{children}</>;
};

export default function App() {
  return (
    <AppProvider>
      <ToastProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/dashboard" element={<AuthGuard><DashboardLayout /></AuthGuard>}>
              <Route index element={<Navigate to="/dashboard/social" replace />} />
              <Route path="social" element={<SocialPostGenerator />} />
              <Route path="reviews" element={<ReviewResponder />} />
              <Route path="settings" element={<Settings />} />
            </Route>
          </Routes>
        </Router>
        <UpgradeModal />
      </ToastProvider>
    </AppProvider>
  );
}
