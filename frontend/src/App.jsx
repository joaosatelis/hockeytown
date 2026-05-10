import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Gestao from './pages/Gestao';
import Telao from './pages/Telao';

function App() {
  return (
    <Router>
      <Navbar />
      <div style={{ padding: '20px' }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/gestao" element={<Gestao />} />
          <Route path="/telao" element={<Telao />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;