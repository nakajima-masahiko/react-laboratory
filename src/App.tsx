import { HashRouter, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import ExperimentPage from './pages/ExperimentPage';
import { lazy, Suspense } from 'react';

const FxFrameScreen = lazy(() => import('./experiments/fx-screen-switch-lab/FrameScreen'));

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/fx-screen/:screenId" element={<Suspense fallback={<p>読み込み中…</p>}><FxFrameScreen /></Suspense>} />
        <Route path="/" element={<HomePage />} />
        <Route path="/experiments/:id/*" element={<ExperimentPage />} />
      </Routes>
    </HashRouter>
  );
}

export default App;
