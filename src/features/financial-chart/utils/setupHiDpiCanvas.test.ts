import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { setupHiDpiCanvas } from './setupHiDpiCanvas';

describe('setupHiDpiCanvas', () => {
  it('sets canvas width/height based on device pixel ratio', () => {
    const canvas = {
      width: 0,
      height: 0,
      style: { width: '', height: '' },
    } as HTMLCanvasElement;

    setupHiDpiCanvas(canvas, 200, 100, 2);

    assert.equal(canvas.width, 400);
    assert.equal(canvas.height, 200);
  });

  it('sets canvas style size in css pixels', () => {
    const canvas = {
      width: 0,
      height: 0,
      style: { width: '', height: '' },
    } as HTMLCanvasElement;

    setupHiDpiCanvas(canvas, 300, 150, 1.5);

    assert.equal(canvas.style.width, '300px');
    assert.equal(canvas.style.height, '150px');
  });

  it('avoids redundant width/height assignments for identical size', () => {
    const style = { width: '', height: '' };
    let widthValue = 0;
    let heightValue = 0;
    let widthAssignments = 0;
    let heightAssignments = 0;

    const canvas = {
      style,
      get width() {
        return widthValue;
      },
      set width(value: number) {
        widthAssignments += 1;
        widthValue = value;
      },
      get height() {
        return heightValue;
      },
      set height(value: number) {
        heightAssignments += 1;
        heightValue = value;
      },
    } as HTMLCanvasElement;

    setupHiDpiCanvas(canvas, 200, 100, 2);
    setupHiDpiCanvas(canvas, 200, 100, 2);

    assert.equal(widthAssignments, 1);
    assert.equal(heightAssignments, 1);
  });
});
