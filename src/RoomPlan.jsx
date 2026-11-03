import React, { useRef } from 'react';
import { RotateCw, Trash2, Check } from 'lucide-react';
import { constrainItem, footprint } from './roomGeometry';

export function FurnitureShape({ item }) {
  const { width: w, height: h, id } = item;
  if (id === 'bed' || id === 'omons_bed') return <g>
    <rect width={w} height={h} rx="5" fill="#9b8066" />
    <rect x="4" y="9" width={w - 8} height={h - 14} rx="8" fill="#f9f7f2" stroke="#d4d1c9" strokeWidth="2" />
    <rect x="11" y="17" width={w - 22} height="35" rx="7" fill="#fffefa" stroke="#dedbd3" />
    <path d={`M7 66 H${w - 7} V${h - 9} H7 Z`} fill="#a9bbc2" />
    <path d={`M7 66 H${w - 7} V85 H7 Z`} fill="#c9d5d8" />
    {[0.25, 0.5, 0.75].map(p => <path key={p} d={`M${w * p} 87 V${h - 13}`} stroke="#e4ecec" opacity=".32" strokeWidth="2" />)}
    <path d={`M4 4 H${w - 4}`} stroke="#715b49" strokeWidth="7" />
  </g>;
  if (id === 'desk') return <g>
    <rect x="2" y="2" width={w - 4} height={h - 4} rx="3" fill="#c2a27b" stroke="#987b58" strokeWidth="2" />
    <path d={`M7 12 H${w - 7} M7 18 H${w - 7}`} stroke="#dfc19b" opacity=".5" />
    <rect x={w * .34} y="10" width={w * .36} height="25" rx="2" fill="#57636a" stroke="#e2e6e7" strokeWidth="3" />
    <rect x={w * .3} y="36" width={w * .44} height="13" rx="2" fill="#e6e9e8" />
    <circle cx="18" cy="39" r="7" fill="#faf9f1" />
  </g>;
  if (id === 'sofa') return <g>
    <rect x="2" y="2" width={w - 4} height={h - 4} rx="15" fill="#b6aa96" stroke="#8e8372" strokeWidth="2" />
    <rect x="13" y="24" width={w - 26} height={h - 33} rx="10" fill="#dcd2bf" stroke="#b7ab96" />
    <rect x="10" y="5" width={w - 20} height="23" rx="9" fill="#e6dccb" stroke="#b7ab96" />
    <rect x="2" y="20" width="13" height={h - 28} rx="6" fill="#cfc3ad" />
    <rect x={w - 15} y="20" width="13" height={h - 28} rx="6" fill="#cfc3ad" />
  </g>;
  if (id === 'rug' || id === 'luxury_rug') return <g>
    <rect width={w} height={h} rx="3" fill="#c6b497" stroke="#b09c7f" strokeWidth="2" />
    <rect x="9" y="9" width={w - 18} height={h - 18} rx="2" fill="none" stroke="#eae0cf" strokeWidth="3" />
    {Array.from({ length: 22 }, (_, i) => <path key={i} d={`M14 ${15 + i * (h - 30) / 21} H${w - 14}`} stroke="#eee5d4" opacity=".38" />)}
  </g>;
  return <g>
    <circle cx={w / 2} cy={h / 2} r={w / 2 - 1} fill="#e7dfce" stroke="#b7a58c" strokeWidth="2" />
    <circle cx={w / 2} cy={h / 2} r={w * .31} fill="#fff6d9" />
    <circle cx={w / 2} cy={h / 2} r="3" fill="#ad9872" />
  </g>;
}

export default function RoomPlan({ room, items, selectedId, onSelect, onChange, onDelete, onRotate }) {
  const svgRef = useRef(null);
  const drag = useRef(null);
  const { width: w, height: h } = room;
  const selected = items.find(item => item.uid === selectedId);
  const point = e => new DOMPoint(e.clientX, e.clientY).matrixTransform(svgRef.current.getScreenCTM().inverse());
  const move = e => {
    if (!drag.current) return;
    const p = point(e);
    onChange(constrainItem({ ...drag.current.item, x: p.x - drag.current.dx, y: p.y - drag.current.dy }, room));
  };
  const finish = e => {
    drag.current = null;
    if (e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId);
  };
  return <section className="plan-stage" aria-label="2D 방꾸미기">
    <div className="plan-caption"><span>MY ROOM <b>· 2D 평면도</b></span><span>화장실 포함 · 가구 실측 비율</span></div>
    <div className="plan-canvas" onPointerDown={() => onSelect(null)}>
      <svg ref={svgRef} viewBox={`-24 -24 ${w + 48} ${h + 70}`} aria-label="주방과 화장실이 있는 원룸 평면도" onPointerMove={move} onPointerUp={finish} onPointerCancel={finish} onLostPointerCapture={() => { drag.current = null; }}>
        <defs>
          <pattern id="wood" width="44" height="170" patternUnits="userSpaceOnUse"><rect width="44" height="170" fill="#e9dfcf" /><path d="M0 0V170 M22 0V170 M0 75H22 M22 130H44" stroke="#d9cdbb" strokeWidth=".8" /><path d="M5 0V170 M14 0V170 M29 0V170 M37 0V170" stroke="#f6f0e6" opacity=".6" strokeWidth="1" /></pattern>
          <pattern id="tile" width="25" height="25" patternUnits="userSpaceOnUse"><rect width="25" height="25" fill="#eef0ed" /><path d="M0 25V0H25" fill="none" stroke="#d4dbd8" strokeWidth="1" /></pattern>
          <filter id="furniture-shadow" x="-30%" y="-30%" width="170%" height="170%"><feDropShadow dx="2" dy="4" stdDeviation="3" floodColor="#40372c" floodOpacity=".22" /></filter>
        </defs>
        <rect width={w} height={h} fill="url(#wood)" />
        {/* Built-in kitchen */}
        <g filter="url(#furniture-shadow)">
          <rect x="8" y="8" width={w - 156} height="50" fill="#f7f5ef" stroke="#c1bbaf" strokeWidth="2" />
          <rect x="9" y="9" width="49" height="48" fill="#e4e5e0" stroke="#babcb7" /><path d="M13 48H54" stroke="#9fa39d" strokeWidth="3" />
          <rect x="70" y="16" width="45" height="32" rx="4" fill="#a7aaa4" /><rect x="75" y="20" width="34" height="24" rx="4" fill="#bfc4bd" /><path d="M90 13v12h7" fill="none" stroke="#7f8984" strokeWidth="3" />
          <rect x={w - 206} y="17" width="41" height="31" rx="2" fill="#333b3b" /><circle cx={w - 195} cy="27" r="6" fill="none" stroke="#858c88" /><circle cx={w - 177} cy="38" r="7" fill="none" stroke="#858c88" />
        </g>
        {/* Bathroom, drawn to the same centimeter scale */}
        <rect x={w - 140} width="140" height="160" fill="url(#tile)" />
        <rect x={w - 130} y="10" width="73" height="70" rx="3" fill="#fafdfc" stroke="#baccc9" strokeWidth="2" /><circle cx={w - 95} cy="45" r="4" fill="#acb7b3" /><path d={`M${w - 119} 18h28v12`} fill="none" stroke="#8c9a96" strokeWidth="3" />
        <rect x={w - 46} y="13" width="34" height="39" rx="4" fill="#fff" stroke="#bac2bd" /><ellipse cx={w - 29} cy="34" rx="12" ry="11" fill="#e2e9e5" /><circle cx={w - 29} cy="19" r="3" fill="#99aaa3" />
        <rect x={w - 42} y="91" width="30" height="17" rx="3" fill="#fff" stroke="#c3cbc6" /><ellipse cx={w - 27} cy="120" rx="17" ry="22" fill="#fff" stroke="#c3cbc6" strokeWidth="2" /><ellipse cx={w - 27} cy="119" rx="10" ry="14" fill="#e5ebe7" />
        <text x={w - 92} y="110" textAnchor="middle" fill="#7f8d87" fontSize="12">화장실</text>
        <path d={`M${w - 140} 0V160h18 M${w - 47} 160H${w}`} fill="none" stroke="#4c4d49" strokeWidth="9" />
        <path d={`M${w - 122} 160v75 M${w - 122} 235 A75 75 0 0 0 ${w - 47} 160`} fill="none" stroke="#8a8d83" strokeWidth="1.5" />
        {/* Outer wall, window, and entry door */}
        <path d={`M40 ${h}H0V0H${w}V${h}H120`} fill="none" stroke="#484944" strokeWidth="12" strokeLinejoin="miter" />
        <path d={`M40 ${h}v-80 M40 ${h - 80}A80 80 0 0 1 120 ${h}`} fill="none" stroke="#8a8d83" strokeWidth="1.5" />
        <rect x={w - 4} y={h * .45} width="8" height={h * .27} fill="#d5e8e8" stroke="#a1b9b9" /><path d={`M${w} ${h * .45}v${h * .27}`} stroke="#fff" strokeWidth="2" />
        <text x={w / 2} y={h + 27} textAnchor="middle" fill="#919a9d" fontSize="11">{(w / 100).toFixed(2)} m × {(h / 100).toFixed(2)} m</text>
        {[...items].sort((a, b) => (a.id === 'rug' ? 0 : 1) - (b.id === 'rug' ? 0 : 1)).map(item => {
          const active = selectedId === item.uid;
          const bounds = footprint(item);
          return <g key={item.uid} data-furniture={item.id} data-rotation={item.rotation} role="button" tabIndex={0} aria-label={`${item.name}, ${item.rotation}도, 방향키로 이동`} aria-pressed={active}
            transform={`translate(${item.x} ${item.y})`} style={{ cursor: 'grab', touchAction: 'none', outline: 'none' }}
            onPointerDown={e => { e.stopPropagation(); onSelect(item.uid); const p = point(e); drag.current = { item, dx: p.x - item.x, dy: p.y - item.y }; svgRef.current.setPointerCapture(e.pointerId); }}
            onFocus={() => onSelect(item.uid)}
            onKeyDown={e => {
              if (e.key === 'Escape') { onSelect(null); e.currentTarget.blur(); }
              if (e.key === 'Delete' || e.key === 'Backspace') { e.preventDefault(); onDelete(item.uid); }
              if (e.key.toLowerCase() === 'r') { e.preventDefault(); onRotate(item.uid); }
              const delta = { ArrowLeft: [-5, 0], ArrowRight: [5, 0], ArrowUp: [0, -5], ArrowDown: [0, 5] }[e.key];
              if (delta) { e.preventDefault(); onChange(constrainItem({ ...item, x: item.x + delta[0], y: item.y + delta[1] }, room)); }
            }}>
            <g transform={`rotate(${item.rotation}) translate(${-item.width / 2} ${-item.height / 2})`} filter={item.id === 'rug' ? undefined : 'url(#furniture-shadow)'}><FurnitureShape item={item} /></g>
            {active && <rect x={-bounds.width / 2 - 5} y={-bounds.height / 2 - 5} width={bounds.width + 10} height={bounds.height + 10} rx="5" fill="none" stroke="#20b8de" strokeWidth="2" strokeDasharray="6 4" pointerEvents="none" />}
          </g>;
        })}
      </svg>
    </div>
    <div className="selection-bar" aria-live="polite">
      {selected ? <><span><b>{selected.name}</b><small>{selected.width} × {selected.height} cm · {selected.rotation}°</small></span><button onClick={() => onRotate(selected.uid)} aria-label="선택한 가구 90도 회전"><RotateCw size={17} /> 회전</button><button onClick={() => onDelete(selected.uid)} aria-label="선택한 가구 삭제"><Trash2 size={17} /></button><button onClick={() => onSelect(null)} aria-label="배치 완료"><Check size={18} /></button></> : <p>{items.length ? '가구를 누르면 이동 · 회전 · 삭제할 수 있어요' : '아래에서 가구를 골라 나만의 방을 꾸며보세요'}</p>}
    </div>
  </section>;
}
