import { COUNTS, FRAMES, frameLabel, PAIRS } from './market';
import type { Config } from './market';

export default function Controls({ config, onChange, prefix }: { config: Config; onChange: (next: Config) => void; prefix: string }) {
  return <div className="fx-controls">
    <label>通貨ペア<select aria-label={`${prefix} 通貨ペア`} value={config.pair}
      onChange={e => onChange({ ...config, pair: e.target.value as Config['pair'] })}>
      {PAIRS.map(pair => <option key={pair}>{pair}</option>)}
    </select></label>
    <label>時間足<select aria-label={`${prefix} 時間足`} value={config.minutes}
      onChange={e => onChange({ ...config, minutes: Number(e.target.value) as Config['minutes'] })}>
      {FRAMES.map(minutes => <option value={minutes} key={minutes}>{frameLabel(minutes)}</option>)}
    </select></label>
    <label>表示本数<select aria-label={`${prefix} 表示本数`} value={config.count}
      onChange={e => onChange({ ...config, count: Number(e.target.value) as Config['count'] })}>
      {COUNTS.map(count => <option value={count} key={count}>{count}本</option>)}
    </select></label>
  </div>;
}
