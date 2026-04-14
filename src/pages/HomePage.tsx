import ExperimentCard from '../components/ExperimentCard';
import { experiments } from '../experiments/registry';

function HomePage() {
  return (
    <div>
      <h1>React Laboratory</h1>
      <p>Reactの様々な実験を行うリポジトリです。下の一覧から実験を選んでください。</p>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '16px',
          marginTop: '24px',
        }}
      >
        {experiments.map((exp) => (
          <ExperimentCard key={exp.id} experiment={exp} />
        ))}
      </div>
    </div>
  );
}

export default HomePage;
