import React, { useState, useEffect, useRef } from 'react';
import RoomPlan, { FurnitureShape } from './RoomPlan';
import { CATALOG_ITEMS, roomDimensions, constrainItem } from './roomGeometry';
import { ChevronLeft, Lock, Download, Quote, Check, Plus, Box, ChevronRight } from 'lucide-react';

export default function App() {
  const [step, setStep] = useState('intro');
  const [roomSize, setRoomSize] = useState(7);
  const [viewMode, setViewMode] = useState('2d');
  const [placedItems, setPlacedItems] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const dialogRef = useRef(null);
  const furnitureListRef = useRef(null);
  const [furnitureScroll, setFurnitureScroll] = useState(0);
  const roomDim = roomDimensions(roomSize);
  const [modalState, setModalState] = useState({ isOpen: false, type: '' });

  const handleAddToRoom = (catalogItem) => {
    if (catalogItem.isLocked) {
      triggerAppModal('premium');
      return;
    }

    const newItem = constrainItem({
      ...catalogItem, uid: crypto.randomUUID(), rotation: 0,
      x: roomDim.width / 2 + (placedItems.length % 3) * 12,
      y: roomDim.height * .62 + (placedItems.length % 3) * 12,
    }, roomDim);
    setPlacedItems(items => [...items, newItem]);
    setSelectedId(null);
  };

  const updateItem = updated => setPlacedItems(items => items.map(item => item.uid === updated.uid ? updated : item));
  const rotateItem = uid => setPlacedItems(items => items.map(item => item.uid === uid ? constrainItem({ ...item, rotation: (item.rotation + 90) % 360 }, roomDim) : item));
  const handleDeleteItem = uid => {
    setPlacedItems(items => items.filter(item => item.uid !== uid));
    setSelectedId(null);
  };
  const changeRoomSize = size => {
    const nextRoom = roomDimensions(size);
    setPlacedItems(items => items.map(item => constrainItem({ ...item, x: item.x * nextRoom.width / roomDim.width, y: item.y * nextRoom.height / roomDim.height }, nextRoom)));
    setRoomSize(size);
  };

  const triggerAppModal = (type) => {
    setModalState({ isOpen: true, type });
  };

  useEffect(() => {
    if (!modalState.isOpen) return;
    const previous = document.activeElement;
    dialogRef.current?.focus();
    return () => previous?.focus();
  }, [modalState.isOpen]);

  return (
    <div className="app-shell flex flex-col w-full bg-gray-100 text-gray-900 font-sans overflow-hidden sm:max-w-md sm:mx-auto sm:border-x sm:border-gray-200 relative shadow-2xl pb-5">
      
      <style>{`
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
          100% { transform: translateY(0px); }
        }
        .animate-float {
          animation: float 3.5s ease-in-out infinite;
        }
      `}</style>

      {/* 1. INTRO SCREEN */}
      {step === 'intro' && (
        <div className="flex flex-col h-full bg-white animate-in fade-in duration-500 overflow-y-auto">
          <div className="h-2/5 bg-gradient-to-br from-[#35C5F0] to-[#1DA9D4] rounded-b-[3rem] relative flex items-center justify-center p-6 shadow-sm flex-shrink-0">
            <div className="absolute top-8 left-6 text-white font-bold text-xl tracking-tight">
              오늘의집 <span className="font-light opacity-90">공모전</span>
            </div>
            <div className="text-white text-center mt-6">
              <h1 className="text-3xl font-extrabold mb-2">대국민 방꾸미기<br/>프로젝트</h1>
              <p className="text-blue-50 opacity-90 text-sm">당신의 센스로 누군가의 로망을 이뤄주세요!</p>
            </div>
          </div>

          <div className="flex-1 px-6 -mt-8 relative z-10 pb-6 flex flex-col justify-between">
            <div className="bg-white rounded-2xl shadow-xl p-5 border border-gray-100 animate-float">
              <div className="flex items-center gap-2 mb-3 text-[#35C5F0]">
                <Quote size={18} className="rotate-180" />
                <span className="font-bold text-xs bg-blue-50 px-2 py-1 rounded-full">OOO님의 사연</span>
              </div>
              <h2 className="text-[1.1rem] font-bold text-gray-800 leading-snug mb-2">
                "사회초년생 원룸 거주중입니다. 깔끔하고 모던한 방을 만들고 싶은데 너무 어려워요 도와주세요!"
              </h2>
              <p className="text-gray-500 text-xs leading-relaxed mb-3">
                자취방을 얻었지만 어떻게 꾸며야 할지 막막한 사회초년생의 사연입니다. 평수를 고르고 가구를 배치해 모던한 방을 완성해 주세요.
              </p>
              <div className="space-y-1.5 pt-2 border-t border-gray-100">
                <div className="flex items-center gap-2 text-xs text-gray-600 font-medium">
                  <Check size={14} className="text-[#35C5F0] flex-shrink-0" /> 공모전 참여시 100% 포인트 지급
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-600 font-medium">
                  <Check size={14} className="text-[#35C5F0] flex-shrink-0" /> 1등 상금 500만원 수여 및 커뮤니티 공식 인플루언서 기회 제공
                </div>
              </div>
            </div>

            {/* 참여하기 버튼 */}
            <div className="mt-4 mb-2">
              <button 
                onClick={() => setStep('editor')}
                className="w-full bg-[#35C5F0] hover:bg-[#28AADC] text-white font-bold text-lg py-4 rounded-xl shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-2"
              >
                참여하기 <ChevronRight size={20} strokeWidth={3} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. EDITOR SCREEN */}
      {step === 'editor' && (
        <div className="flex flex-col h-full animate-in slide-in-from-right duration-500 bg-[#f7f8fa]">
          
          <header className="flex flex-col px-4 py-3 bg-white border-b border-gray-200 z-30 shadow-sm gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <button onClick={() => setStep('intro')} className="p-1 -ml-1 text-gray-600 hover:text-black">
                  <ChevronLeft size={24} />
                </button>
                <h1 className="font-bold text-gray-800 hidden sm:block text-sm">이전</h1>
              </div>

              <div className="flex bg-gray-100 p-1 rounded-lg">
                <button 
                  className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${viewMode === '2d' ? 'bg-white text-black shadow-sm' : 'text-gray-400'}`}
                  onClick={() => setViewMode('2d')}
                >
                  2D
                </button>
                <button 
                  className={`px-3 py-1 text-xs font-bold rounded-md transition-all text-gray-500 hover:text-black`}
                  onClick={() => triggerAppModal('3d')}
                >
                  3D
                </button>
              </div>

              <button 
                onClick={() => setStep('success')}
                className="text-white font-bold text-xs px-3 py-1.5 bg-[#35C5F0] rounded-lg shadow-sm hover:bg-[#28AADC] transition-colors"
              >
                응모
              </button>
            </div>

            <div className="flex justify-center gap-2">
              {[5, 7, 10].map((size) => (
                <button
                  key={size}
                  onClick={() => changeRoomSize(size)}
                  className={`px-4 py-1.5 text-xs font-bold rounded-full transition-all border ${
                    roomSize === size 
                      ? 'border-[#35C5F0] bg-blue-50 text-[#35C5F0]' 
                      : 'border-gray-200 bg-white text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  {size}평
                </button>
              ))}
            </div>
          </header>

          <RoomPlan room={roomDim} items={placedItems} selectedId={selectedId} onSelect={setSelectedId} onChange={updateItem} onDelete={handleDeleteItem} onRotate={rotateItem} />

          <div 
            className="bg-[#FF6B6B] text-white text-xs font-bold py-2.5 px-4 text-center cursor-pointer flex items-center justify-center gap-2 z-30 shadow-md hover:bg-[#fa5a5a] transition-colors"
            onClick={() => triggerAppModal('ad')}
          >
            <span className="animate-bounce">🎉</span> 
            선택한 가구들 오늘의 집에서 최대 30% 할인중!
          </div>

          <div className="furniture-panel bg-white border-t border-gray-200 flex flex-col z-30 shadow-[0_-5px_15px_rgba(0,0,0,0.05)]">
            <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
              <span className="font-bold text-gray-800 text-sm">가구 추가</span>
              <span className="text-[10px] text-gray-400 bg-gray-100 px-2 py-1 rounded-md">좌우 스와이프</span>
            </div>
            
            <div ref={furnitureListRef}
              onScroll={e => {
                const list = e.currentTarget;
                const max = list.scrollWidth - list.clientWidth;
                setFurnitureScroll(max > 0 ? list.scrollLeft / max * 100 : 0);
              }}
              className="furniture-list flex-1 min-h-0 overflow-x-auto overflow-y-hidden flex items-center gap-3 px-4 py-2">
              {CATALOG_ITEMS.map((item) => {
                return (
                  <div key={item.id} className="flex-shrink-0 w-32 bg-white rounded-xl border border-gray-100 shadow-sm p-3 flex flex-col h-full justify-between">
                    <div className="flex flex-col items-center mb-1">
                      <div className={`w-16 h-16 rounded-lg ${item.color || 'bg-gray-50'} mb-2 relative overflow-hidden flex items-center justify-center border border-gray-200`}>
                         <svg viewBox={`-8 -8 ${item.width + 16} ${item.height + 16}`} className="w-14 h-14" aria-hidden="true"><FurnitureShape item={item} /></svg>
                         {item.isLocked && (
                           <div className="absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-[1px]">
                             <Lock size={20} className="text-white drop-shadow-md" />
                           </div>
                         )}
                      </div>

                      <span className="text-[11px] font-bold text-gray-700 text-center line-clamp-2 h-5">
                        {item.name}
                      </span>
                      <span className="text-[9px] text-gray-400">{item.width} × {item.height} cm</span>
                    </div>
                    
                    <div className="flex flex-col gap-1.5 mt-auto">
                      <button 
                        onClick={() => handleAddToRoom(item)}
                        aria-label={`${item.name} ${item.isLocked ? '앱에서 확인' : '배치하기'}`}
                        className={`w-full text-white text-[11px] font-bold py-2 rounded-md flex items-center justify-center gap-1 active:scale-95 transition-transform ${item.isLocked ? 'bg-gray-400 hover:bg-gray-500' : 'bg-gray-800 hover:bg-gray-700'}`}
                      >
                        {item.isLocked ? <><Lock size={12} /> 앱에서 확인</> : <><Plus size={12} /> 배치하기</>}
                      </button>
                      
                      <button 
                        onClick={() => triggerAppModal('price')}
                        className="w-full bg-blue-50 text-[#35C5F0] text-[11px] font-bold py-2 rounded-md flex items-center justify-center gap-1 hover:bg-blue-100 active:scale-95 transition-transform"
                      >
                        <Lock size={12} /> 앱에서 가격 보기
                      </button>
                    </div>
                  </div>
                );
              })}
              <button onClick={() => triggerAppModal('more')} className="more-furniture flex-shrink-0 w-36 h-full rounded-xl flex flex-col items-center justify-center gap-3 px-3">
                <span className="rounded-full bg-white p-3"><Plus size={24} /></span>
                <b className="text-xs">더 다양한 가구 추가</b>
                <span className="text-[10px] text-gray-500">오늘의집 앱에서 만나보세요</span>
              </button>
            </div>
            <div className="furniture-scroll-control">
              <span aria-hidden="true">‹</span>
              <input type="range" min="0" max="100" step="0.1" value={furnitureScroll}
                aria-label="가구 목록 좌우 스크롤"
                onChange={e => {
                  const value = Number(e.target.value);
                  setFurnitureScroll(value);
                  const list = furnitureListRef.current;
                  if (list) list.scrollLeft = (list.scrollWidth - list.clientWidth) * value / 100;
                }} />
              <span aria-hidden="true">›</span>
            </div>
          </div>
        </div>
      )}

      {/* 3. SUCCESS SCREEN */}
      {step === 'success' && (
        <div className="flex flex-col h-full bg-white items-center justify-center p-6 animate-in zoom-in-95 duration-500">
          <div className="w-24 h-24 bg-blue-50 text-[#35C5F0] rounded-full flex items-center justify-center mb-6 shadow-inner">
            <Check size={48} strokeWidth={3} />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">응모가 완료되었습니다!</h2>
          <p className="text-gray-500 text-center mb-10 leading-relaxed text-sm">
            소중한 인테리어 아이디어를 제출해주셔서 감사합니다.<br/>
            응모 투표 및 상세 결과는 <span className="font-bold text-gray-800">오늘의집 앱</span>에서<br/>
            확인하실 수 있습니다.
          </p>
          
          <button 
            onClick={() => alert("앱 스토어로 이동하는 기능입니다.")}
            className="w-full max-w-xs bg-[#35C5F0] hover:bg-[#28AADC] text-white font-bold text-lg py-4 rounded-xl shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-2 mb-3"
          >
            <Download size={20} /> 앱에서 결과 확인하기
          </button>
          
          <button 
            onClick={() => {
              setStep('intro');
              setPlacedItems([]);
            }}
            className="text-gray-400 hover:text-gray-600 font-medium text-sm py-2 mt-2"
          >
            처음으로 돌아가기
          </button>
        </div>
      )}

      {/* 4. MODAL */}
      {modalState.isOpen && (
        <div ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="app-modal-title" tabIndex={-1}
          onKeyDown={e => {
            if (e.key === 'Escape') setModalState({ isOpen: false, type: '' });
            if (e.key === 'Tab') {
              const controls = [...e.currentTarget.querySelectorAll('button, a[href]')];
              const first = controls[0], last = controls[controls.length - 1];
              if (e.shiftKey && (document.activeElement === first || document.activeElement === e.currentTarget)) { e.preventDefault(); last.focus(); }
              else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
            }
          }} className="absolute inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-5 transition-opacity">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="bg-[#35C5F0] p-6 text-center text-white relative">
              <button 
                onClick={() => setModalState({ isOpen: false, type: '' })}
                className="absolute top-3 right-3 text-white/80 hover:text-white transition-colors"
              >
                ✕
              </button>
              <div className="w-16 h-16 bg-white text-[#35C5F0] rounded-full flex items-center justify-center mx-auto mb-3 shadow-inner">
                {modalState.type === '3d' ? <Box size={32} /> : <Lock size={32} />}
              </div>
              <h3 id="app-modal-title" className="text-xl font-bold">
                {modalState.type === '3d' ? '3D 뷰는 앱에서 지원해요!' : 
                 modalState.type === 'more' ? '더 다양한 가구를 만나보세요!' :
                 modalState.type === 'premium' ? '오늘의 p!ck은 앱에서!' :
                 '가격 및 정보는 앱에서 확인!'}
              </h3>
            </div>
            
            <div className="p-6 text-center">
              <p className="text-gray-600 text-sm mb-6 leading-relaxed whitespace-pre-line">
                {modalState.type === '3d' 
                  ? '더욱 실감나는 3D 인테리어 뷰와 AR 배치는\n오늘의집 앱에서 완벽하게 지원합니다!' 
                  : (modalState.type === 'premium' || modalState.type === 'more')
                  ? '나에게 꼭 맞는 가구부터 오늘의 p!ck까지,\n더 다양한 가구로 방을 완성해 보세요.\n앱을 다운로드해주세요.'
                  : '선택하신 가구의 실제 가격, 할인 혜택 및\n상세 정보는 앱에서 확인 가능합니다.'}
                <br/><br/>
                <span className="font-bold text-gray-900">앱을 설치하고 공모전에 응모해보세요!</span>
              </p>
              
              <a href="https://play.google.com/store/apps/details?id=net.bucketplace&gl=KR" target="_blank" rel="noreferrer"
                className="w-full py-3.5 rounded-xl font-bold text-white bg-[#35C5F0] hover:bg-[#28AADC] flex justify-center items-center gap-2 shadow-md active:scale-95 transition-transform"
              >
                <Download size={18} /> Google Play에서 다운로드
              </a>
              <a href="https://apps.apple.com/kr/app/id1008236892" target="_blank" rel="noreferrer" className="block mt-3 text-sm font-bold text-sky-600">App Store에서 다운로드</a>
              
              <button 
                onClick={() => setModalState({ isOpen: false, type: '' })}
                className="w-full mt-3 py-3 text-sm text-gray-400 font-medium hover:text-gray-600 transition-colors"
              >
                나중에 하기
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="absolute bottom-0 left-0 right-0 z-40 pointer-events-none bg-white/90 text-[9px] text-gray-400 text-center py-1.5">
        ※ 할인율이나 프로그램 실행은 실제와 다를 수 있습니다.
      </div>
    </div>
  );
}
