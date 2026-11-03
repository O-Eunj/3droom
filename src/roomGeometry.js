// All plan coordinates and furniture dimensions are in centimeters.
export const CATALOG_ITEMS = [
  { id: 'bed', name: '침대', width: 110, height: 200, isLocked: false },
  { id: 'desk', name: '책상', width: 120, height: 60, isLocked: false },
  { id: 'sofa', name: '1인용 소파', width: 80, height: 85, isLocked: false },
  { id: 'rug', name: '러그', width: 150, height: 200, isLocked: false },
  { id: 'lamp', name: '조명', width: 35, height: 35, isLocked: false },
  { id: 'omons_bed', name: "오늘의 p!ck 침대", width: 150, height: 200, isLocked: true },
  { id: 'luxury_rug', name: "오늘의 p!ck 러그", width: 170, height: 230, isLocked: true },
];

export function roomDimensions(size) {
  const width = Math.sqrt(size * 3.3058 / 1.18) * 100;
  return { width, height: width * 1.18 };
}

export function footprint(item) {
  return item.rotation % 180 === 0
    ? { width: item.width, height: item.height }
    : { width: item.height, height: item.width };
}

export function constrainItem(item, room) {
  const { width: w, height: h } = footprint(item);
  let x = Math.max(w / 2 + 8, Math.min(room.width - w / 2 - 8, item.x));
  // Fixed kitchen occupies the top 60 cm; bathroom occupies the top-right 140 x 160 cm.
  let y = Math.max(68 + h / 2, Math.min(room.height - h / 2 - 8, item.y));
  if (x + w / 2 > room.width - 148 && y - h / 2 < 168) {
    const left = room.width - 148 - w / 2;
    const below = 168 + h / 2;
    if (left >= w / 2 + 8 && Math.abs(x - left) < Math.abs(y - below)) x = left;
    else y = below;
  }
  return { ...item, x, y };
}
