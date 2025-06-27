import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AppLayout from './components/AppLayout';
import LoginPage from './pages/LoginPage';
import WorkerSettingsPage from './pages/WorkerSettingsPage';
import WorkerRunPage from './pages/WorkerRunPage';
import DataPage from './pages/DataPage';
import NotFoundPage from './pages/NotFoundPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AppLayout />}>
          <Route index element={<WorkerSettingsPage />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="workers/settings" element={<WorkerSettingsPage />} />
          <Route path="workers/run" element={<WorkerRunPage />} />
          <Route path="data" element={<DataPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
