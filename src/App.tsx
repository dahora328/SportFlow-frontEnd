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
// import { Login } from './pages/Login';
import { AuthProvider } from './contexts/AuthContext';
import { Register } from './pages/User/Register';

function AppContent() {
  const location = useLocation();
  const hideTopBar =
    location.pathname === '/' ||
    location.pathname === '/login' ||
    location.pathname === '/register';

  return (
    <>
      <AuthProvider>
        {!hideTopBar && <TopBar />}
        <Routes>
          <Route path='/register' element={<Register />} />
          {/* Páginas iniciais */}
          <Route path='/' element={<LandingPage />} />
          {/* <Route path='/login' element={<Login />} /> */}
          <Route path='/user' element={<User />} />
          {/* Páginas principais */}
          <Route path='/reports' element={<Reports />} />
          <Route path='/home' element={<Home />} />
          {/* Rotas de atletas */}
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
