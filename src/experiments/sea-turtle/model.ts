import * as THREE from 'three';

export const ocean = { water: '#073d50', haze: '#176173', sand: '#b4b79b', grass: '#386f59', shell: '#727747', skin: '#92986c', belly: '#d2c995', eye: '#101d19', light: '#b8f4ee' };

// Original procedural asset: no third-party model or texture licensing dependency.
export function createTurtle() {
  const root = new THREE.Group();
  const textureCanvas = document.createElement('canvas');
  textureCanvas.width = textureCanvas.height = 1024;
  const ctx = textureCanvas.getContext('2d')!;
  ctx.fillStyle = ocean.shell;
  ctx.fillRect(0, 0, 1024, 1024);
  for (let row = -1; row < 9; row++) for (let col = -1; col < 9; col++) {
    const x = col * 150 + (row % 2) * 75, y = row * 125;
    ctx.beginPath();
    for (let k = 0; k < 6; k++) {
      const a = k * Math.PI / 3;
      ctx.lineTo(x + Math.cos(a) * 83, y + Math.sin(a) * 73);
    }
    ctx.closePath();
    ctx.fillStyle = `hsl(${48 + (row + col + 20) % 18} 26% ${28 + (row * col + 50) % 13}%)`;
    ctx.fill(); ctx.strokeStyle = '#c0af75'; ctx.lineWidth = 5; ctx.stroke();
    for (let k = 0; k < 12; k++) {
      ctx.beginPath(); ctx.moveTo(x, y);
      ctx.lineTo(x + Math.cos(k * 2.4) * 66, y + Math.sin(k * 2.4) * 55);
      ctx.strokeStyle = '#a19c6155'; ctx.lineWidth = 1; ctx.stroke();
    }
  }
  const texture = new THREE.CanvasTexture(textureCanvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  const shell = new THREE.MeshStandardMaterial({ map: texture, roughness: 0.73 });
  const skin = new THREE.MeshStandardMaterial({ color: ocean.skin, roughness: 0.85 });
  const belly = new THREE.MeshStandardMaterial({ color: ocean.belly, roughness: 0.85 });
  const eye = new THREE.MeshStandardMaterial({ color: ocean.eye, roughness: 0.12 });
  const add = (parent: THREE.Object3D, material: THREE.Material, position: number[], scale: number[], part: string) => {
    const mesh = new THREE.Mesh(new THREE.SphereGeometry(1, 40, 24), material);
    mesh.position.set(...position as [number, number, number]);
    mesh.scale.set(...scale as [number, number, number]);
    mesh.userData.part = part; parent.add(mesh); return mesh;
  };
  add(root, belly, [0, -.15, 0], [1.08, .28, 1.42], '腹甲');
  add(root, shell, [0, .05, 0], [1.12, .53, 1.47], '甲羅');
  const head = new THREE.Group(); head.position.set(0, .02, -1.35); root.add(head);
  add(head, skin, [0, 0, -.2], [.29, .25, .55], '頭部');
  add(head, skin, [0, 0, -.62], [.36, .29, .39], '頭部');
  add(head, belly, [0, -.13, -.78], [.27, .11, .23], '頭部');
  for (const side of [-1, 1]) {
    add(head, eye, [side * .285, .1, -.74], [.065, .065, .055], '眼');
    add(head, eye, [side * .11, .105, -.965], [.026, .018, .014], '鼻孔');
  }
  const fins: THREE.Group[] = [];
  for (const side of [-1, 1]) {
    const fin = new THREE.Group(); fin.position.set(side * .82, -.09, -.72); root.add(fin);
    const blade = add(fin, skin, [side * .77, 0, .16], [1.05, .085, .33], '前ヒレ');
    blade.rotation.y = -side * .4; fins.push(fin);
    const rear = add(root, skin, [side * .83, -.14, 1.22], [.5, .07, .28], '後ろヒレ');
    rear.rotation.y = side * .5;
  }
  add(root, skin, [0, -.16, 1.48], [.09, .07, .3], '尾');
  return { root, fins, head };
}
