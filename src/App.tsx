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
import { AuthProvider } from './contexts/AuthContext';
import { Register } from './pages/User/Register';
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
          <Route path='/user' element={<User />} />

          <Route path='/enterprise' element={<Enterprise />} />
          {/* Páginas principais */}
          <Route path='/reports' element={<Reports />} />
          <Route path='/home' element={<Home />} />

          {/* Rotas de atletas */}
          <Route path='/athletes' element={<Athletes />} />
          <Route path='/athletes/:id' element={<Athletes />} />

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
