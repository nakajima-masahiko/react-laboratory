import { useRef, useState } from 'react';
import { CanvasStage } from './CanvasStage';
import type { CanvasLayer, Frame, StageHandle } from './CanvasStage';
import type { DemoProps } from './canvas-api';

export function TypographyDemo({ native, theme, onNativeFailure }: DemoProps) {
  const stage = useRef<StageHandle>(null);
  const [title, setTitle] = useState('描く、触れる、伝わる。');
  const [angle, setAngle] = useState(-8);
  const [scale, setScale] = useState(1);
  const [likes, setLikes] = useState(0);
  const draw = ({ context, width, height, palette }: Frame) => {
    context.fillStyle = palette.grid;
    for (let x = 20; x < width; x += 24) for (let y = 20; y < height; y += 24) {
      context.beginPath(); context.arc(x, y, 1, 0, Math.PI * 2); context.fill();
    }
    context.strokeStyle = palette.secondary;
    context.globalAlpha = .3;
    context.lineWidth = 1;
    [100, 155, 210].forEach((radius) => { context.beginPath(); context.arc(width / 2, height / 2, radius, 0, Math.PI * 2); context.stroke(); });
    context.globalAlpha = 1;
  };
  const layers: CanvasLayer[] = [{
    id: 'editable-card', className: 'hic-editor-card',
    place: (size, box) => {
      const radians = angle * Math.PI / 180;
      const rotatedWidth = Math.abs(box.width * Math.cos(radians)) + Math.abs(box.height * Math.sin(radians));
      const rotatedHeight = Math.abs(box.width * Math.sin(radians)) + Math.abs(box.height * Math.cos(radians));
      const fit = Math.min(scale, (size.width - 28) / rotatedWidth, (size.height - 28) / rotatedHeight);
      return { x: size.width / 2 - fit * (box.width * Math.cos(radians) - box.height * Math.sin(radians)) / 2, y: size.height / 2 - fit * (box.width * Math.sin(radians) + box.height * Math.cos(radians)) / 2, rotation: angle, scale: fit };
    },
    content: <>
      <span className="hic-eyebrow">TYPE / TRANSFORM</span>
      <h3>{title || 'タイトルを入力'}</h3>
      <p>日本語の折り返しも、<strong>文字の強調</strong>も。そのままCanvasへ。</p>
      <label>カードのタイトル<input value={title} maxLength={28} onChange={(event) => setTitle(event.target.value)} /></label>
      <button type="button" onClick={() => setLikes((count) => count + 1)}>いいね <span>{likes}</span></button>
      <span className="hic-label">回転したまま入力・クリックできます。</span>
    </>,
  }];
  return <div className="hic-demo">
    <div className="hic-demo-heading"><div><h2>HTMLカードを回転・拡大</h2><p>Canvasの座標変換と、HTMLの入力操作を一緒に試す。</p></div><span className="hic-count">2D transforms</span></div>
    <CanvasStage ref={stage} native={native} theme={theme} onNativeFailure={onNativeFailure} layers={layers} label="回転・拡大できるHTMLカード" draw={draw} />
    <div className="hic-toolbar">
      <label>回転 {angle}°<input type="range" min={-25} max={25} value={angle} onChange={(event) => setAngle(Number(event.target.value))} /></label>
      <label>拡大率 {scale.toFixed(2)}×<input type="range" min={.7} max={1.2} step={.05} value={scale} onChange={(event) => setScale(Number(event.target.value))} /></label>
      <button type="button" onClick={() => { setAngle(0); setScale(1); }}>正面に戻す</button>
      <button type="button" disabled={!native} onClick={() => stage.current?.savePng()}>HTMLごとPNG保存</button>
    </div>
    <p className="hic-hint">カード内の文字を選択・コピーし、Tabキーで操作できます。小さな画面ではカードが収まる倍率に調整します。</p>
  </div>;
}
