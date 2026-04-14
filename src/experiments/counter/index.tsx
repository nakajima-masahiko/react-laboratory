import { useState } from 'react';

function Counter() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <h2>カウンター</h2>
      <p>useStateの基本的な使い方を確認するシンプルなカウンターです。</p>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '24px' }}>
        <button onClick={() => setCount((c) => c - 1)}>-</button>
        <span style={{ fontSize: '2rem', minWidth: '80px', textAlign: 'center' }}>{count}</span>
        <button onClick={() => setCount((c) => c + 1)}>+</button>
      </div>
      <button onClick={() => setCount(0)} style={{ marginTop: '16px' }}>
        リセット
      </button>
    </div>
  );
}

export default Counter;
