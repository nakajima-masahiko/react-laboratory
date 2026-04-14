import { HashRouter, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import ExperimentPage from './pages/ExperimentPage';

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/experiments/:id" element={<ExperimentPage />} />
      </Routes>
    </HashRouter>
  );
}

export default App;
