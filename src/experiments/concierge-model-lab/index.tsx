import { ContactShadows, Environment, OrbitControls, useGLTF } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { Suspense, useMemo, useState } from 'react';
import './styles.css';

type Phase = {
  id: string;
  number: string;
  title: string;
  summary: string;
  deliverable: string;
  checks: string[];
};

const phases: Phase[] = [
  {
    id: 'style',
    number: '01',
    title: '美的設計書',
    summary: '「可愛い」を顔の比率、人格、色彩、素材へ分解します。',
    deliverable: 'style-bible.md',
    checks: ['成人女性であることを明記', '6.8頭身・セミリアル比率を固定', 'ホテル制服と印象色を決定'],
  },
  {
    id: 'turnaround',
    number: '02',
    title: '多方向設定画',
    summary: '正面だけでなく、横顔と後頭部まで同一人物として設計します。',
    deliverable: 'turnaround.png',
    checks: ['Aポーズ・正投影・均一照明', '正面／左右／背面／45度', '表情集と顔の拡大図'],
  },
  {
    id: 'generation',
    number: '03',
    title: 'AI立体化',
    summary: '複数方向画像から、修正前提の70点の立体下書きを生成します。',
    deliverable: 'concierge-raw.glb',
    checks: ['複数ビューを同時入力', '衣装と身体を分離可能にする', 'GLB／FBXで書き出す'],
  },
  {
    id: 'sculpt',
    number: '04',
    title: '造形とリトポロジー',
    summary: 'Blenderで顔、手、髪、関節を重点的に修正します。',
    deliverable: 'concierge-retopo.blend',
    checks: ['45度と横顔の輪郭を確認', '目口周辺に表情用エッジループ', '手指・生え際・衣装貫通を修正'],
  },
  {
    id: 'material',
    number: '05',
    title: '髪と質感',
    summary: '写実とトゥーンの中間にある、触れられそうなイラスト感を作ります。',
    deliverable: 'concierge-material.blend',
    checks: ['髪を独立メッシュ化', '弱いSSSと控えめな肌ディテール', '角膜と虹彩を分離'],
  },
  {
    id: 'rig',
    number: '06',
    title: 'リグと表情',
    summary: '接客時の自然な微笑みと会話を表現できるようにします。',
    deliverable: 'concierge-rigged.fbx',
    checks: ['全身リグとウェイト', 'まばたき・視線・口形', '左右差のある微笑み'],
  },
  {
    id: 'qa',
    number: '07',
    title: '全方向QA',
    summary: '24方向レンダーをAIと人間の両方で比較評価します。',
    deliverable: 'qa-report.md',
    checks: ['人物同一性を比較', '干渉・破綻・過度な対称性を検査', 'ホテル接客としての印象を確認'],
  },
  {
    id: 'web',
    number: '08',
    title: 'Web最適化',
    summary: '白の宿で滑らかに動くGLBへ最適化します。',
    deliverable: 'hotel-concierge.glb',
    checks: ['3〜8万ポリゴンを目安に調整', 'テクスチャをWebP／KTX2化', 'モバイルとWebGLフォールバック確認'],
  },
];

const characterPrompt = `20代半ばの成人女性をモデルにした、精密な日本発のセミリアル3Dホテルコンシェルジュ。アニメ的な整理と現実的な骨格を半分ずつ組み合わせる。6.8頭身、短めの中顔面、自然に大きい瞳、厚みのあるまぶた、小さすぎない鼻、繊細な口元。穏やかで知的、微笑む直前の表情。生成りのブラウス、濃紺のベスト、控えめな金色の名札。過剰な幼児化や人形的な左右対称を避ける。正投影に近いカメラ、均一な照明、白背景、Aポーズ。正面・左右・背面・斜め45度の設定画。すべての方向で顔、髪、衣装、体格を完全に一致させる。`;

const negativePrompt = `child, teenage appearance, exaggerated anatomy, oversized eyes, tiny nose, doll-like plastic skin, perfect facial symmetry, inconsistent hairstyle, asymmetrical clothing errors, perspective distortion, dramatic pose, strong shadows`;

function ConciergeAsset() {
  const { scene } = useGLTF(`${import.meta.env.BASE_URL}models/shiro-yado/hotel-concierge.glb`);
  const model = useMemo(() => scene.clone(), [scene]);

  return <primitive object={model} position={[0, -1.45, 0]} scale={1.55} />;
}

function ModelViewer() {
  return (
    <div className="concierge-lab__viewer" aria-label="現在のホテルコンシェルジュ3Dモデル">
      <Canvas camera={{ position: [0, 0.1, 3.3], fov: 32 }} dpr={[1, 1.5]}>
        <color attach="background" args={['#e9e4dc']} />
        <ambientLight intensity={1.15} />
        <directionalLight position={[3, 4, 3]} intensity={2.2} />
        <Suspense fallback={null}>
          <ConciergeAsset />
          <Environment preset="studio" environmentIntensity={0.35} />
        </Suspense>
        <ContactShadows position={[0, -1.42, 0]} opacity={0.28} scale={3} blur={2.5} />
        <OrbitControls makeDefault enablePan={false} minDistance={2.2} maxDistance={5} target={[0, -0.25, 0]} />
      </Canvas>
      <div className="concierge-lab__viewer-caption">
        <span>CURRENT MODEL</span>
        <strong>白の宿コンシェルジュ</strong>
        <small>ドラッグで回転・ホイールで拡大</small>
      </div>
    </div>
  );
}

function ConciergeModelLab() {
  const [activeId, setActiveId] = useState(phases[0].id);
  const [completed, setCompleted] = useState<Set<string>>(() => new Set());
  const [copied, setCopied] = useState<'main' | 'negative' | null>(null);
  const activePhase = phases.find((phase) => phase.id === activeId) ?? phases[0];
  const progress = Math.round((completed.size / phases.length) * 100);

  const toggleCompleted = (id: string) => {
    setCompleted((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const copyPrompt = async (kind: 'main' | 'negative', value: string) => {
    await navigator.clipboard.writeText(value);
    setCopied(kind);
    window.setTimeout(() => setCopied(null), 1600);
  };

  return (
    <main className="concierge-lab">
      <header className="concierge-lab__hero">
        <div className="concierge-lab__intro">
          <p className="concierge-lab__eyebrow">CHARACTER CRAFT LABORATORY · SHIRO-YADO</p>
          <h1>ホテルコンシェルジュを、<br />美しさの設計からつくる。</h1>
          <p className="concierge-lab__lead">
            生成AIの一発出力を完成品にせず、設定画、造形、表情、品質評価を順番に積み上げる制作実験室です。
          </p>
          <div className="concierge-lab__progress" aria-label={`制作進捗 ${progress}%`}>
            <div className="concierge-lab__progress-meta"><span>PRODUCTION PROGRESS</span><strong>{progress}%</strong></div>
            <div className="concierge-lab__progress-track"><span style={{ width: `${progress}%` }} /></div>
          </div>
        </div>
        <ModelViewer />
      </header>

      <section className="concierge-lab__section" aria-labelledby="workflow-title">
        <div className="concierge-lab__section-heading">
          <p>WORKFLOW</p>
          <h2 id="workflow-title">8段階の制作工程</h2>
          <span>工程を選択し、成果物と完了条件を確認してください。</span>
        </div>
        <div className="concierge-lab__workflow">
          <nav className="concierge-lab__phase-list" aria-label="制作工程">
            {phases.map((phase) => (
              <button
                className={`concierge-lab__phase ${phase.id === activeId ? 'is-active' : ''}`}
                key={phase.id}
                type="button"
                onClick={() => setActiveId(phase.id)}
                aria-pressed={phase.id === activeId}
              >
                <span>{phase.number}</span><strong>{phase.title}</strong>{completed.has(phase.id) && <i>完了</i>}
              </button>
            ))}
          </nav>
          <article className="concierge-lab__phase-detail">
            <p className="concierge-lab__phase-number">PHASE {activePhase.number}</p>
            <h3>{activePhase.title}</h3>
            <p>{activePhase.summary}</p>
            <div className="concierge-lab__deliverable"><span>成果物</span><code>{activePhase.deliverable}</code></div>
            <ul>{activePhase.checks.map((check) => <li key={check}>{check}</li>)}</ul>
            <button className="concierge-lab__complete" type="button" onClick={() => toggleCompleted(activePhase.id)}>
              {completed.has(activePhase.id) ? '完了を取り消す' : 'この工程を完了にする'}
            </button>
          </article>
        </div>
      </section>

      <section className="concierge-lab__section concierge-lab__prompt-section" aria-labelledby="prompt-title">
        <div className="concierge-lab__section-heading">
          <p>GENERATION BRIEF</p>
          <h2 id="prompt-title">多方向設定画プロンプト</h2>
          <span>特定作家の模倣ではなく、造形言語を明示して人物の一貫性を作ります。</span>
        </div>
        <div className="concierge-lab__prompt-grid">
          <article className="concierge-lab__prompt-card concierge-lab__prompt-card--main">
            <div><span>MAIN PROMPT</span><button type="button" onClick={() => void copyPrompt('main', characterPrompt)}>{copied === 'main' ? 'コピー済み' : 'コピー'}</button></div>
            <p>{characterPrompt}</p>
          </article>
          <article className="concierge-lab__prompt-card">
            <div><span>NEGATIVE PROMPT</span><button type="button" onClick={() => void copyPrompt('negative', negativePrompt)}>{copied === 'negative' ? 'コピー済み' : 'コピー'}</button></div>
            <p lang="en">{negativePrompt}</p>
          </article>
        </div>
      </section>

      <section className="concierge-lab__section" aria-labelledby="score-title">
        <div className="concierge-lab__section-heading">
          <p>QUALITY GATE</p>
          <h2 id="score-title">完成判定の基準</h2>
          <span>「可愛い」という印象を、再現可能な評価項目に変換します。</span>
        </div>
        <div className="concierge-lab__score-grid">
          {[['30', '人物同一性', '全方向で同じ人物に見える'], ['20', '顔と表情', '横顔、まぶた、口角が自然'], ['15', '接客人格', '知性、親しみ、品位が共存'], ['15', '変形品質', '表情と関節に破綻がない'], ['10', '素材表現', '肌、瞳、髪に柔らかな奥行き'], ['10', 'Web性能', 'モバイルで滑らかに表示']].map(([score, label, detail]) => (
            <article key={label}><strong>{score}<small>pt</small></strong><h3>{label}</h3><p>{detail}</p></article>
          ))}
        </div>
        <aside className="concierge-lab__handoff">
          <div><span>FINAL HANDOFF</span><h3>白の宿への組み込み条件</h3></div>
          <p><code>public/models/shiro-yado/hotel-concierge.glb</code> を同名で置き換え、24方向QAで80点以上、モバイル表示とWebGLフォールバックを確認します。</p>
        </aside>
      </section>
    </main>
  );
}

export default ConciergeModelLab;
