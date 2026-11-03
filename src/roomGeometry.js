// All plan coordinates and furniture dimensions are in centimeters.
export const CATALOG_ITEMS = [
  { id: 'bed', name: '침대', width: 110, height: 200, isLocked: false },
  { id: 'desk', name: '책상', width: 120, height: 60, isLocked: false },
  { id: 'sofa', name: '1인용 소파', width: 80, height: 85, isLocked: false },
  { id: 'rug', name: '러그', width: 150, height: 200, isLocked: false },
  { id: 'lamp', name: '조명', width: 35, height: 35, isLocked: false },
  { id: 'plant', name: '화분', width: 45, height: 45, isLocked: false },
  { id: 'dresser', name: '서랍장', width: 80, height: 45, isLocked: false },
  { id: 'bookshelf', name: '책장', width: 80, height: 30, isLocked: false },
  { id: 'coffee_table', name: '소파 테이블', width: 80, height: 50, isLocked: false },
  { id: 'omons_bed', name: "오늘의 p!ck 침대", width: 150, height: 200, isLocked: true },
  { id: 'luxury_rug', name: "오늘의 p!ck 러그", width: 170, height: 230, isLocked: true },
];

export function roomDimensions(size, type = 'A') {
  const ratio = type === 'B' ? .86 : 1.18;
  const width = Math.sqrt(size * 3.3058 / ratio) * 100;
  return { width, height: width * ratio, type };
}

export const KITCHEN_ITEMS = [
  { id: 'fridge', name: '냉장고', width: 60, height: 70 },
  { id: 'sink', name: '싱크대', width: 80, height: 60 },
  { id: 'induction', name: '인덕션', width: 60, height: 60 },
  { id: 'washer', name: '세탁기', width: 60, height: 60 },
];

export function roomLayout(room) {
  const isB = room.type === 'B';
  const bathroom = { x: isB ? 0 : room.width - 140, y: 0, width: 140, height: 160 };
  let offset = 0;
  const kitchen = KITCHEN_ITEMS.map(item => {
    const localX = !isB && item.id === 'washer' ? 0 : offset;
    const localY = !isB && item.id === 'washer' ? 70 : 0;
    offset += item.width;
    return { ...item, rotation: isB ? 90 : 0,
      x: isB ? room.width - 8 - item.height : 8 + localX,
      y: isB ? 8 + localX : 8 + localY,
      boundsWidth: isB ? item.height : item.width,
      boundsHeight: isB ? item.width : item.height,
    };
  });
  return { bathroom, kitchen, obstacles: [bathroom, ...kitchen.map(item => ({
    x: item.x, y: item.y, width: item.boundsWidth, height: item.boundsHeight,
  }))] };
}

export function isValidPosition(item, room) {
  const { width, height } = footprint(item);
  const left = item.x - width / 2, top = item.y - height / 2;
  const right = left + width, bottom = top + height;
  const epsilon = .00001;
  if (left < 8 - epsilon || top < 8 - epsilon || right > room.width - 8 + epsilon || bottom > room.height - 8 + epsilon) return false;
  return roomLayout(room).obstacles.every(rect =>
    right <= rect.x - 8 + epsilon || left >= rect.x + rect.width + 8 - epsilon ||
    bottom <= rect.y - 8 + epsilon || top >= rect.y + rect.height + 8 - epsilon);
}

export function footprint(item) {
  return item.rotation % 180 === 0
    ? { width: item.width, height: item.height }
    : { width: item.height, height: item.width };
}

export function constrainItem(item, room) {
  const { width: w, height: h } = footprint(item);
  const clampX = x => Math.max(w / 2 + 8, Math.min(room.width - w / 2 - 8, x));
  const clampY = y => Math.max(h / 2 + 8, Math.min(room.height - h / 2 - 8, y));
  const desired = { ...item, x: clampX(item.x), y: clampY(item.y) };
  if (isValidPosition(desired, room)) return desired;
  // The closest legal point lies on an obstacle or room boundary.
  const xs = [desired.x, clampX(0), clampX(room.width)];
  const ys = [desired.y, clampY(0), clampY(room.height)];
  for (const rect of roomLayout(room).obstacles) {
    xs.push(clampX(rect.x - 8 - w / 2), clampX(rect.x + rect.width + 8 + w / 2));
    ys.push(clampY(rect.y - 8 - h / 2), clampY(rect.y + rect.height + 8 + h / 2));
  }
  let best = null, distance = Infinity;
  for (const x of xs) for (const y of ys) {
    const candidate = { ...item, x, y };
    const score = (x - desired.x) ** 2 + (y - desired.y) ** 2;
    if (score < distance && isValidPosition(candidate, room)) { best = candidate; distance = score; }
  }
  if (!best) throw new Error('이 가구를 배치할 공간이 없습니다.');
  return best;
}
