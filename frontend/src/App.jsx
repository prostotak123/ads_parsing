import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AppLayout from './components/AppLayout';
import LoginPage from './pages/LoginPage';
import WorkerSettingsPage from './pages/WorkerSettingsPage';
import WorkerRunPage from './pages/WorkerRunPage';
import DataPage from './pages/DataPage';
import NotFoundPage from './pages/NotFoundPage';
import ProtectedRoute from './components/ProtectedRoute';
import PublicOnlyRoute from './components/PublicOnlyRoute';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AppLayout />}>
          <Route path="login" element={
            <PublicOnlyRoute>
              <LoginPage />
            </PublicOnlyRoute>
          } />

          {/* <Route
            index
            element={
              <ProtectedRoute>
                <WorkerSettingsPage />
              </ProtectedRoute>
            }
          /> */}
          <Route
            path="workers/run"
            element={
              <ProtectedRoute>
                <WorkerRunPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="workers/settings"
            element={
              <ProtectedRoute>
                <WorkerSettingsPage />
              </ProtectedRoute>
            }
          />



          <Route
            path="data"
            element={
              <ProtectedRoute>
                <DataPage />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
