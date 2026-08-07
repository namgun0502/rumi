// PlayerRack.jsx - 플레이어 자신의 손패(Rack) 거치대 컴포넌트입니다.
// 타일 정렬(색상별/숫자별) 기능과 드래그 앤 드롭을 지원합니다.

import React from 'react';
import Tile from './Tile';
import { sortTilesByColor, sortTilesByNumber } from '../utils/tileFactory';
import { Palette, Hash } from 'lucide-react';

export default function PlayerRack({ rack, setRack, onTileDragStart, onRackDrop, selectedTileId, onTileClick }) {
  // 색상별 정렬 버튼 클릭 핸들러
  const handleSortColor = () => {
    setRack(sortTilesByColor(rack));
  };

  // 숫자별 정렬 버튼 클릭 핸들러
  const handleSortNumber = () => {
    setRack(sortTilesByNumber(rack));
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (onRackDrop) {
      onRackDrop(e);
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className="
        w-full p-4 rounded-2xl
        bg-amber-950/80 backdrop-blur-md border-2 border-amber-700/60
        shadow-[0_10px_25px_rgba(0,0,0,0.5)] flex flex-col gap-3
      "
    >
      {/* 상단 컨트롤 바 (손패 개수 + 정렬 버튼) */}
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-2">
          <span className="font-bold text-amber-200 text-lg">🪵 내 손패</span>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-amber-800 text-amber-100">
            {rack.length}장
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleSortColor}
            className="
              flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold
              bg-amber-900/80 text-amber-200 hover:bg-amber-800 hover:text-white
              border border-amber-700/50 transition-all active:scale-95 cursor-pointer
            "
          >
            <Palette className="w-3.5 h-3.5" /> 색상 정렬
          </button>

          <button
            onClick={handleSortNumber}
            className="
              flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold
              bg-amber-900/80 text-amber-200 hover:bg-amber-800 hover:text-white
              border border-amber-700/50 transition-all active:scale-95 cursor-pointer
            "
          >
            <Hash className="w-3.5 h-3.5" /> 숫자 정렬
          </button>
        </div>
      </div>

      {/* 타일 거치 영역 */}
      <div className="
        w-full min-h-[90px] p-3 rounded-xl bg-amber-900/40 border border-amber-800/40
        flex flex-wrap gap-2.5 items-center justify-start overflow-x-auto
      ">
        {rack.length === 0 ? (
          <div className="w-full text-center text-amber-400/50 text-sm font-semibold py-4">
            🎉 손패를 모두 털어냈습니다!
          </div>
        ) : (
          rack.map((tile) => (
            <Tile
              key={tile.id}
              tile={tile}
              isSelected={selectedTileId === tile.id}
              onDragStart={(e) => onTileDragStart && onTileDragStart(e, tile, 'rack')}
              onClick={onTileClick}
              size="medium"
            />
          ))
        )}
      </div>
    </div>
  );
}
