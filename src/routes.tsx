import { Navigate, Route, Routes } from 'react-router-dom';
import { Layout } from './components/Layout';
import { AboutPage } from './pages/AboutPage';
import { DailyQuizPage } from './pages/DailyQuizPage';
import { DashboardPage } from './pages/DashboardPage';
import { ExtraPracticePage } from './pages/ExtraPracticePage';
import { ReviewPage } from './pages/ReviewPage';
import { SettingsPage } from './pages/SettingsPage';

export function AppRoutes({ onLock }: { onLock: () => void }): JSX.Element {
  return (
    <Routes>
      <Route element={<Layout onLock={onLock} />}>
        <Route index element={<DashboardPage />} />
        <Route path="daily" element={<DailyQuizPage />} />
        <Route path="practice" element={<ExtraPracticePage />} />
        <Route path="review" element={<ReviewPage />} />
        <Route path="settings" element={<SettingsPage onLock={onLock} />} />
        <Route path="about" element={<AboutPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
