import './App.css';
import { Routes, Route } from 'react-router-dom';
import LandingPage from './components/LandingPage';

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/mini-data-sci-proj" element={<miniDataProjects />} />
      </Routes>
    </div>
  );
}

export default App;