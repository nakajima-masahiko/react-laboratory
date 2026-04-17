import * as ToggleGroup from '@radix-ui/react-toggle-group';
import { useCallback, useEffect, useRef, useState } from 'react';
import './styles.css';

type ShapeType = 'circle' | 'triangle' | 'square';

interface Shape {
  id: number;
  type: ShapeType;
  x: number;
  y: number;
  color: string;
}

const COLORS = ['#e74c3c', '#3498db', '#2ecc71', '#f39c12', '#9b59b6', '#1abc9c', '#e67e22'];
const SIZE = 28;
let nextId = 0;

function drawShape(ctx: CanvasRenderingContext2D, shape: Shape) {
  ctx.fillStyle = shape.color;
  const { x, y } = shape;

  ctx.beginPath();
  if (shape.type === 'circle') {
    ctx.arc(x, y, SIZE, 0, Math.PI * 2);
    ctx.fill();
  } else if (shape.type === 'square') {
    ctx.fillRect(x - SIZE, y - SIZE, SIZE * 2, SIZE * 2);
  } else {
    ctx.moveTo(x, y - SIZE);
    ctx.lineTo(x + SIZE, y + SIZE);
    ctx.lineTo(x - SIZE, y + SIZE);
    ctx.closePath();
    ctx.fill();
  }
}

function ToggleShapeDrawing() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [selectedShape, setSelectedShape] = useState<ShapeType>('circle');
  const [shapes, setShapes] = useState<Shape[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    shapes.forEach((s) => drawShape(ctx, s));
  }, [shapes]);

  const handleCanvasClick = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const rect = canvasRef.current!.getBoundingClientRect();
      const scaleX = canvasRef.current!.width / rect.width;
      const scaleY = canvasRef.current!.height / rect.height;
      const x = (e.clientX - rect.left) * scaleX;
      const y = (e.clientY - rect.top) * scaleY;
      const color = COLORS[Math.floor(Math.random() * COLORS.length)];
      setShapes((prev) => [...prev, { id: nextId++, type: selectedShape, x, y, color }]);
    },
    [selectedShape],
  );

  const handleValueChange = (value: string) => {
    if (value) setSelectedShape(value as ShapeType);
  };

  return (
    <div className="tsd-lab">
      <h2>Toggle Shape Drawing</h2>
      <p>図形を選んでキャンバスをクリックすると描画されます。</p>

      <div className="tsd-toolbar">
        <ToggleGroup.Root
          type="single"
          value={selectedShape}
          onValueChange={handleValueChange}
          className="tsd-toggle-group"
          aria-label="描画する図形"
        >
          <ToggleGroup.Item value="circle" className="tsd-toggle-item" aria-label="丸">
            <span className="tsd-shape-icon tsd-circle" />
            丸
          </ToggleGroup.Item>
          <ToggleGroup.Item value="triangle" className="tsd-toggle-item" aria-label="三角">
            <span className="tsd-shape-icon tsd-triangle" />
            三角
          </ToggleGroup.Item>
          <ToggleGroup.Item value="square" className="tsd-toggle-item" aria-label="四角">
            <span className="tsd-shape-icon tsd-square" />
            四角
          </ToggleGroup.Item>
        </ToggleGroup.Root>

        <button
          className="tsd-clear-btn"
          onClick={() => setShapes([])}
          disabled={shapes.length === 0}
        >
          クリア
        </button>
      </div>

      <canvas
        ref={canvasRef}
        width={800}
        height={480}
        onClick={handleCanvasClick}
        className="tsd-canvas"
        aria-label="描画キャンバス"
      />

      <p className="tsd-count">
        {shapes.length > 0 ? `${shapes.length} 個の図形を描画中` : 'キャンバスをクリックして描画を開始'}
      </p>
    </div>
  );
}

export default ToggleShapeDrawing;
