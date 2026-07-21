import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { ToastProvider } from './context/ToastContext';
import { UpgradeModal } from './components/UpgradeModal';

// Pages
import { Landing } from './pages/Landing';
import { DashboardLayout } from './pages/DashboardLayout';
import { SocialPostGenerator } from './pages/dashboard/SocialPostGenerator';
import { ReviewResponder } from './pages/dashboard/ReviewResponder';
import { Settings } from './pages/dashboard/Settings';

export default function App() {
  return (
    <AppProvider>
      <ToastProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/dashboard" element={<DashboardLayout />}>
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
