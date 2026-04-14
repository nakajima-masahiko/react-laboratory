import { Link } from 'react-router-dom';
import type { ExperimentEntry } from '../experiments/registry';

interface Props {
  experiment: ExperimentEntry;
}

function ExperimentCard({ experiment }: Props) {
  return (
    <Link
      to={`/experiments/${experiment.id}`}
      style={{
        display: 'block',
        padding: '20px',
        border: '1px solid #ddd',
        borderRadius: '8px',
        textDecoration: 'none',
        color: 'inherit',
        transition: 'box-shadow 0.2s, border-color 0.2s',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = '#646cff';
        e.currentTarget.style.boxShadow = '0 2px 8px rgba(100, 108, 255, 0.2)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = '#ddd';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      <h3 style={{ margin: '0 0 8px 0' }}>{experiment.title}</h3>
      <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>{experiment.description}</p>
    </Link>
  );
}

export default ExperimentCard;
