import {
  Route,
  BrowserRouter as Router,
  Routes,
  useLocation,
} from 'react-router-dom';
import { useContext, type JSX } from 'react';
import { Navigate } from 'react-router-dom';
import { TopBar } from './components/Menu/TopBar';
import './styles/App.css';
import { Athletes } from './pages/Athletes';
import { User } from './pages/User';
import { Reports } from './pages/Reports';
import { LandingPage } from './pages/LandingPage';
import { Home } from './pages/Home';
import { AuthProvider, AuthContext } from './contexts/AuthContext';
import { AdminPanel } from './pages/AdminPanel';
import { ProtectedRoute } from './routes/ProtectedRoute';

// Guard: somente Super Admin (is_admin=true, enterprise_id=null) acessa /admin
function SuperAdminRoute({ children }: { children: JSX.Element }) {
  const context = useContext(AuthContext);
  const user = context?.user;
  const isAuthenticated = context?.isAuthenticated;

  if (!isAuthenticated) return <Navigate to='/' replace />;
  if (!user?.is_admin || user?.enterprise_id !== null) return <Navigate to='/home' replace />;

  return children;
}

import { Enterprise } from './pages/Enterprise';
// import { Login } from './pages/Login';
function AppContent() {
  const location = useLocation();
  const hideTopBar =
    location.pathname === '/' ||
    location.pathname === '/login';

  return (
    <>
      <AuthProvider>
        {!hideTopBar && <TopBar />}
        <Routes>
          {/* Páginas públicas */}
          <Route path='/' element={<LandingPage />} />

          {/* Páginas autenticadas */}
          <Route path='/user' element={<ProtectedRoute><User /></ProtectedRoute>} />

          <Route path='/enterprise' element={<ProtectedRoute><Enterprise /></ProtectedRoute>} />
          {/* Páginas principais */}
          <Route path='/reports' element={<ProtectedRoute><Reports /></ProtectedRoute>} />
          <Route path='/home' element={<ProtectedRoute><Home /></ProtectedRoute>} />

          {/* Rotas de atletas */}
          <Route path='/athletes' element={<ProtectedRoute><Athletes /></ProtectedRoute>} />
          <Route path='/athletes/:id' element={<ProtectedRoute><Athletes /></ProtectedRoute>} />

          {/* Painel Admin — somente Super Admin */}
          <Route
            path='/admin'
            element={
              <SuperAdminRoute>
                <AdminPanel />
              </SuperAdminRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
