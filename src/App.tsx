import {
  Route,
  BrowserRouter as Router,
  Routes,
  useLocation,
} from 'react-router-dom';
import { TopBar } from './components/Menu/TopBar';
import './styles/App.css';
import { Athletes } from './pages/Athletes';
import { User } from './pages/User';
import { Reports } from './pages/Reports';
import { LandingPage } from './pages/LandingPage';
import { Home } from './pages/Home';
import { Login } from './pages/User/Login';
import { AuthProvider } from './contexts/AuthContext';

function AppContent() {
  const location = useLocation();
  const hideTopBar =
    location.pathname === '/' || location.pathname === '/login';

  return (
    <>
      <AuthProvider>
        {!hideTopBar && <TopBar />}
        <Routes>
          {/* Páginas iniciais */}
          <Route path='/' element={<LandingPage />} />
          <Route path='/user' element={<User />} />
          {/* Páginas principais */}
          <Route path='/reports' element={<Reports />} />
          <Route path='/login' element={<Login />} />
          <Route path='/home' element={<Home />} />
          <Route path='/athletes' element={<Athletes />} />
          <Route path='/athletes/:id' element={<Athletes />} />
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
