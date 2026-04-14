import { Suspense } from 'react';
import { useParams, Link } from 'react-router-dom';
import { experiments } from '../experiments/registry';

function ExperimentPage() {
  const { id } = useParams<{ id: string }>();
  const experiment = experiments.find((e) => e.id === id);

  if (!experiment) {
    return (
      <div>
        <h2>実験が見つかりません</h2>
        <p>ID: {id} に該当する実験は登録されていません。</p>
        <Link to="/">ホームに戻る</Link>
      </div>
    );
  }

  const ExperimentComponent = experiment.component;

  return (
    <div>
      <Link to="/" style={{ display: 'inline-block', marginBottom: '16px' }}>
        &larr; ホームに戻る
      </Link>
      <Suspense fallback={<div>読み込み中...</div>}>
        <ExperimentComponent />
      </Suspense>
    </div>
  );
}

export default ExperimentPage;
