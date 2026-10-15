import { useState } from 'react';
import { HotelPreview } from './scene/HotelPreview';
import type { SceneId } from './scene/types';

export function SceneDisclosure({ scene, label }: { scene: SceneId; label: string }) {
  const [open, setOpen] = useState(false);
  return <details className="shiro-yado__scene-disclosure" onToggle={(event) => setOpen(event.currentTarget.open)}>
    <summary>{label}</summary>
    {open && <HotelPreview scene={scene} />}
  </details>;
}
