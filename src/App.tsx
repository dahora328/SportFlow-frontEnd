import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import { TopBar } from './components/Menu/TopBar';
import './styles/App.css';
import { Athletes } from './pages/Athletes';
import { Home } from './pages/Home';
import { User } from './pages/User';
import { Reports } from './pages/Reports';

function App() {
  return (
    <>
      <Router>
        <TopBar />
        <Routes>
          <Route path='/reports' element={<Reports />} />
          <Route path='/user' element={<User />} />
          <Route path='/' element={<Home />} />
          <Route path='/athletes' element={<Athletes />} />
        </Routes>
      </Router>
    </>
  );
}

export default App;
