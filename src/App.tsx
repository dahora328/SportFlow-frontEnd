import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import { TopBar } from './components/Menu/TopBar';
import './styles/App.css';
import { Athletes } from './pages/Athletes';
import { Home } from './pages/Home';

function App() {
  return (
    <>
      <Router>
        <TopBar />
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/athletes' element={<Athletes />} />
        </Routes>
      </Router>
    </>
  );
}

export default App;
