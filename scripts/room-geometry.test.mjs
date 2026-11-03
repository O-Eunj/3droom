import assert from 'node:assert/strict';
import { CATALOG_ITEMS, roomDimensions, constrainItem, footprint } from '../src/roomGeometry.js';

let cases = 0;
for (const size of [5, 7, 10]) {
  const room = roomDimensions(size);
  assert.ok(Math.abs(room.width * room.height / 10000 - size * 3.3058) < .001);
  for (const furniture of CATALOG_ITEMS.filter(item => !item.isLocked)) {
    for (const rotation of [0, 90, 180, 270]) {
      for (const x of [-1000, 0, 100, room.width / 2, room.width, 1000]) {
        for (const y of [-1000, 0, 100, room.height / 2, room.height, 1000]) {
          const result = constrainItem({ ...furniture, rotation, x, y }, room);
          const bounds = footprint(result);
          const left = result.x - bounds.width / 2, right = result.x + bounds.width / 2;
          const top = result.y - bounds.height / 2, bottom = result.y + bounds.height / 2;
          assert.ok(left >= 8 - .001 && right <= room.width - 8 + .001, 'Horizontal room bounds');
          assert.ok(top >= 68 - .001 && bottom <= room.height - 8 + .001, 'Vertical room / kitchen bounds');
          assert.ok(right <= room.width - 148 + .001 || top >= 168 - .001, 'Bathroom exclusion');
          assert.deepEqual(constrainItem(result, room), result, 'Stable constrained position');
          cases++;
        }
      }
    }
  }
}
assert.equal(footprint({ width: 110, height: 200, rotation: 90 }).width, 200);
console.log(`Passed ${cases} placement cases across all sizes, furniture, and rotations.`);
