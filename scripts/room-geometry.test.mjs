import assert from 'node:assert/strict';
import { CATALOG_ITEMS, roomDimensions, roomLayout, constrainItem, footprint, isValidPosition } from '../src/roomGeometry.js';
let cases = 0;
for (const type of ['A', 'B']) for (const size of [5, 7, 10]) {
  const room = roomDimensions(size, type);
  assert.ok(Math.abs(room.width * room.height / 10000 - size * 3.3058) < .001);
  const { kitchen, obstacles } = roomLayout(room);
  assert.deepEqual(kitchen.map(item => item.id), ['fridge', 'sink', 'induction', 'washer']);
  for (const rect of obstacles) {
    assert.ok(rect.x >= 0 && rect.y >= 0 && rect.x + rect.width <= room.width + .001 && rect.y + rect.height <= room.height + .001);
  }
  for (let i = 0; i < obstacles.length; i++) for (let j = i + 1; j < obstacles.length; j++) {
    const a = obstacles[i], b = obstacles[j];
    assert.ok(a.x + a.width <= b.x || b.x + b.width <= a.x || a.y + a.height <= b.y || b.y + b.height <= a.y, 'Fixtures must not overlap');
  }
  for (const furniture of CATALOG_ITEMS.filter(item => !item.isLocked)) for (const rotation of [0, 90, 180, 270]) {
    for (const x of [-1000, 0, 100, room.width / 2, room.width, 1000]) for (const y of [-1000, 0, 100, room.height / 2, room.height, 1000]) {
      const result = constrainItem({ ...furniture, rotation, x, y }, room);
      assert.ok(isValidPosition(result, room), 'Placement must clear all walls, kitchen appliances and bathroom');
      assert.deepEqual(constrainItem(result, room), result, 'Stable constrained position');
      for (const nextType of ['A', 'B']) for (const nextSize of [5, 7, 10]) {
        const next = roomDimensions(nextSize, nextType);
        const moved = constrainItem({ ...result, x: result.x * next.width / room.width, y: result.y * next.height / room.height }, next);
        assert.ok(isValidPosition(moved, next), 'Layout/size transitions preserve valid furniture placement');
      }
      cases++;
    }
  }
}
assert.equal(footprint({ width: 110, height: 200, rotation: 90 }).width, 200);
console.log(`Passed ${cases} placement cases and ${cases * 6} layout/size transitions.`);
