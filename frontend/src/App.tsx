import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Navbar } from './components/Navbar';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { NotesPage } from './pages/NotesPage';
import { NoteDetailPage } from './pages/NoteDetailPage';
import { MeetingsPage } from './pages/MeetingsPage';
import { MeetingDetailPage } from './pages/MeetingDetailPage';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { token } = useAuth();
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}

function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f1f5f9' }}>
      <Navbar />
      <main>{children}</main>
    </div>
  );
}

function AppRoutes() {
  const { token } = useAuth();

  return (
    <Routes>
      <Route
        path="/login"
        element={token ? <Navigate to="/notes" replace /> : <LoginPage />}
      />
      <Route
        path="/register"
        element={token ? <Navigate to="/notes" replace /> : <RegisterPage />}
      />
      <Route
        path="/notes"
        element={
          <ProtectedRoute>
            <AppLayout>
              <NotesPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/notes/:id"
        element={
          <ProtectedRoute>
            <AppLayout>
              <NoteDetailPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/meetings"
        element={
          <ProtectedRoute>
            <AppLayout>
              <MeetingsPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/meetings/:id"
        element={
          <ProtectedRoute>
            <AppLayout>
              <MeetingDetailPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to={token ? '/notes' : '/login'} replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
