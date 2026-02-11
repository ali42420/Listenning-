import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ModeSelect } from './pages/ModeSelect';
import { TestSelect } from './pages/TestSelect';
import { ListeningPage } from './pages/ListeningPage';

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<ModeSelect />} />
      <Route path="/tests" element={<TestSelect />} />
      <Route path="/listening" element={<ListeningPage />} />
      <Route path="/login" element={<Navigate to="/" replace />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}
